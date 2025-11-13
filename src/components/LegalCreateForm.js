// src/components/LegalCreateForm.js
import React, { useMemo, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const initialState = {
  propietario: "",
  direccion: "",
  area_m2: "",
  fecha_cert: "",
  numero_escritura: "",
  abogado: "",
  poseedor: "",
};

const initialCalc = {
  diagonal: "",
  frente_t1: "",
  fondo_t1: "",
  frente_t2: "",
  fondo_t2: "",
};

// filas iniciales vacías
const emptyColRow = { lado: "N", texto: "" }; // N|S|E|O + descripción
const emptyOriRow = { rumbo: "", medida: "", colindante: "" };

const LegalCreateForm = ({ tipo = "certificacion", onCreated }) => {
  const [form, setForm] = useState(initialState);
  const [calc, setCalc] = useState(initialCalc);
  const [usarCalculo, setUsarCalculo] = useState(false);

  // Archivo inicial
  const [fileObj, setFileObj] = useState(null);
  const [fileDesc, setFileDesc] = useState("");

  // NUEVO: UI amigable para colindancias / orientaciones
  const [colRows, setColRows] = useState([{ ...emptyColRow }]); // objeto {lado, texto}
  const [oriRows, setOriRows] = useState([{ ...emptyOriRow }]); // objeto {rumbo, medida, colindante}

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const isCert = useMemo(() => tipo === "certificacion", [tipo]);
  const isEsc = !isCert;

  const ch = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const chCalc = (e) => setCalc((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Helpers para filas dinámicas
  const addColRow = () => setColRows((r) => [...r, { ...emptyColRow }]);
  const delColRow = (i) => setColRows((r) => r.length > 1 ? r.filter((_, idx) => idx !== i) : r);
  const setColVal = (i, key, val) =>
    setColRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  const addOriRow = () => setOriRows((r) => [...r, { ...emptyOriRow }]);
  const delOriRow = (i) => setOriRows((r) => r.length > 1 ? r.filter((_, idx) => idx !== i) : r);
  const setOriVal = (i, key, val) =>
    setOriRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  // Transformaciones a JSON para el backend
  const buildColindanciasJSON = () => {
    // { "N": "texto", "S": "texto", ... } — concatena si hay varias del mismo lado
    const out = {};
    colRows
      .filter((r) => r.texto && r.texto.trim())
      .forEach((r) => {
        const k = r.lado || "N";
        out[k] = out[k] ? `${out[k]}; ${r.texto.trim()}` : r.texto.trim();
      });
    return Object.keys(out).length ? out : undefined;
  };

  const buildOrientacionesJSON = () => {
    // [ {rumbo, medida:Number, colindante} ]
    const arr = oriRows
      .filter((r) => r.rumbo?.trim() && r.colindante?.trim() && r.medida !== "")
      .map((r) => ({
        rumbo: r.rumbo.trim(),
        medida: Number(r.medida),
        colindante: r.colindante.trim(),
      }))
      .filter((r) => isFinite(r.medida) && r.medida > 0);
    return arr.length ? arr : undefined;
  };

  const validate = () => {
    if (!form.propietario?.trim()) throw new Error("propietario es requerido");
    if (!form.direccion?.trim()) throw new Error("direccion es requerido");
    if (isCert && !form.fecha_cert) throw new Error("fecha_cert es requerido para certificación");
    if (isEsc && !form.numero_escritura?.trim()) throw new Error("numero_escritura es requerido para escritura");

    if (!usarCalculo && form.area_m2 && Number(form.area_m2) <= 0) {
      throw new Error("area_m2 debe ser > 0");
    }
    if (usarCalculo) {
      const vals = ["diagonal","frente_t1","fondo_t1","frente_t2","fondo_t2"].map((k) => Number(calc[k]));
      if (vals.some((v) => !isFinite(v) || v <= 0)) {
        throw new Error("Todos los valores del cálculo deben ser > 0");
      }
    }

    if (fileObj) {
      const okType = ["application/pdf", "image/jpeg", "image/png"].includes(fileObj.type);
      if (!okType) throw new Error("Archivo no permitido (usa PDF/JPG/PNG)");
      const max = 5 * 1024 * 1024;
      if (fileObj.size > max) throw new Error("Archivo excede 5MB");
    }

    // Validaciones suaves para filas (no obligamos a llenar todo, pero si llenan, que sea válido)
    oriRows.forEach((r, i) => {
      if ((r.rumbo || r.colindante || r.medida !== "") &&
        (!r.rumbo?.trim() || !r.colindante?.trim() || !(Number(r.medida) > 0))) {
        throw new Error(`Orientación fila ${i + 1}: completa rumbo, medida (>0) y colindante`);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      validate();
      setLoading(true);

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        tipo,
        propietario: form.propietario || undefined,
        direccion: form.direccion || undefined,
        area_m2: usarCalculo ? undefined : (form.area_m2 ? Number(form.area_m2) : undefined),
        // aquí convertimos inputs a JSON automáticamente:
        colindancias: buildColindanciasJSON(),
        orientaciones: buildOrientacionesJSON(),
        fecha_cert: isCert ? form.fecha_cert : undefined,
        numero_escritura: isEsc ? form.numero_escritura : undefined,
        abogado: isEsc ? (form.abogado || undefined) : undefined,
        poseedor: isEsc ? (form.poseedor || undefined) : undefined,
      };

      // 1) Crear documento
      const { data: created } = await axios.post(`${API}/api/legal`, payload, { headers });

      // 2) Calcular área si “No la conozco”
      if (usarCalculo) {
        await axios.post(
          `${API}/api/legal/${created.id}/calcular-area`,
          {
            diagonal: Number(calc.diagonal),
            frente_t1: Number(calc.frente_t1),
            fondo_t1: Number(calc.fondo_t1),
            frente_t2: Number(calc.frente_t2),
            fondo_t2: Number(calc.fondo_t2),
            force: false,
          },
          { headers }
        );
      }

      // 3) Subir archivo inicial (opcional)
      if (fileObj) {
        const fd = new FormData();
        fd.append("file", fileObj);
        if (fileDesc) fd.append("descripcion", fileDesc);
        await axios.post(`${API}/api/legal/${created.id}/archivos`, fd, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
      }

      setMsg({ type: "success", text: `Documento creado (ID: ${created.id})` });
      // reset
      setForm(initialState);
      setCalc(initialCalc);
      setUsarCalculo(false);
      setFileObj(null);
      setFileDesc("");
      setColRows([{ ...emptyColRow }]);
      setOriRows([{ ...emptyOriRow }]);

      if (typeof onCreated === "function") onCreated(created);
    } catch (err) {
      const text = err?.response?.data?.message || err.message || "Error creando documento";
      setMsg({ type: "danger", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="d-grid gap-3" onSubmit={handleSubmit}>
      {msg && <div className={`alert alert-${msg.type} mb-0`}>{msg.text}</div>}

      {/* Propietario / Dirección */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Propietario *</label>
          <input className="form-control" name="propietario" value={form.propietario} onChange={ch} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Dirección *</label>
          <input className="form-control" name="direccion" value={form.direccion} onChange={ch} />
        </div>
      </div>

      {/* Área conocida / cálculo */}
      <div className="row g-3 align-items-end">
        {!usarCalculo && (
          <div className="col-md-4">
            <label className="form-label">Área (m²)</label>
            <input
              className="form-control"
              name="area_m2"
              type="number"
              step="0.01"
              value={form.area_m2}
              onChange={ch}
              placeholder="Ej. 120.50"
            />
          </div>
        )}
        <div className="col-md-4 d-flex align-items-center gap-2">
          <input
            id="usarCalculo"
            className="form-check-input"
            type="checkbox"
            checked={usarCalculo}
            onChange={(e) => setUsarCalculo(e.target.checked)}
          />
          <label htmlFor="usarCalculo" className="form-check-label">
            No la conozco (calcular área)
          </label>
        </div>
      </div>

      {usarCalculo && (
        <>
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Triángulo 1</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Frente T1 (m)</label>
                  <input className="form-control" name="frente_t1" type="number" step="0.01" value={calc.frente_t1} onChange={chCalc} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fondo T1 (m)</label>
                  <input className="form-control" name="fondo_t1" type="number" step="0.01" value={calc.fondo_t1} onChange={chCalc} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Diagonal (m)</label>
                  <input className="form-control" name="diagonal" type="number" step="0.01" value={calc.diagonal} onChange={chCalc} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Triángulo 2</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Frente T2 (m)</label>
                  <input className="form-control" name="frente_t2" type="number" step="0.01" value={calc.frente_t2} onChange={chCalc} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fondo T2 (m)</label>
                  <input className="form-control" name="fondo_t2" type="number" step="0.01" value={calc.fondo_t2} onChange={chCalc} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Campos por tipo */}
      <div className="row g-3">
        {isCert && (
          <div className="col-md-4">
            <label className="form-label">Fecha de certificación *</label>
            <input className="form-control" name="fecha_cert" type="date" value={form.fecha_cert} onChange={ch} />
          </div>
        )}
        {isEsc && (
          <>
            <div className="col-md-4">
              <label className="form-label">Número de escritura *</label>
              <input className="form-control" name="numero_escritura" value={form.numero_escritura} onChange={ch} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Abogado</label>
              <input className="form-control" name="abogado" value={form.abogado} onChange={ch} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Poseedor</label>
              <input className="form-control" name="poseedor" value={form.poseedor} onChange={ch} />
            </div>
          </>
        )}
      </div>

      {/* COLINDANCIAS (UI) */}
      <div className="card">
        <div className="card-body">
          <h6 className="mb-3">Colindancias</h6>
          <div className="d-grid gap-2">
            {colRows.map((r, i) => (
              <div className="row g-2" key={`col-${i}`}>
                <div className="col-3 col-md-2">
                  <label className="form-label">Lado</label>
                  <select
                    className="form-select"
                    value={r.lado}
                    onChange={(e) => setColVal(i, "lado", e.target.value)}
                  >
                    <option value="N">N</option>
                    <option value="S">S</option>
                    <option value="E">E</option>
                    <option value="O">O</option>
                  </select>
                </div>
                <div className="col-7 col-md-9">
                  <label className="form-label">Descripción</label>
                  <input
                    className="form-control"
                    placeholder="Ej. 20m con Finca X"
                    value={r.texto}
                    onChange={(e) => setColVal(i, "texto", e.target.value)}
                  />
                </div>
                <div className="col-2 col-md-1 d-flex align-items-end">
                  <button type="button" className="btn btn-outline-danger w-100" onClick={() => delColRow(i)} disabled={colRows.length === 1}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button type="button" className="btn btn-outline-primary" onClick={addColRow}>
                ➕ Agregar colindancia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORIENTACIONES (UI) */}
      <div className="card">
        <div className="card-body">
          <h6 className="mb-3">Orientaciones</h6>
          <div className="d-grid gap-2">
            {oriRows.map((r, i) => (
              <div className="row g-2" key={`ori-${i}`}>
                <div className="col-md-3">
                  <label className="form-label">Rumbo</label>
                  <input
                    className="form-control"
                    placeholder="Ej. N45E"
                    value={r.rumbo}
                    onChange={(e) => setOriVal(i, "rumbo", e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Medida (m)</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.01"
                    placeholder="Ej. 20"
                    value={r.medida}
                    onChange={(e) => setOriVal(i, "medida", e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Colindante</label>
                  <input
                    className="form-control"
                    placeholder="Ej. Finca X"
                    value={r.colindante}
                    onChange={(e) => setOriVal(i, "colindante", e.target.value)}
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button type="button" className="btn btn-outline-danger w-100" onClick={() => delOriRow(i)} disabled={oriRows.length === 1}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button type="button" className="btn btn-outline-primary" onClick={addOriRow}>
                ➕ Agregar orientación
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documento soporte inicial */}
      <div className="card">
        <div className="card-body">
          <h6 className="mb-2">Documento soporte (opcional)</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Archivo (PDF/JPG/PNG, máx 5MB)</label>
              <input
                className="form-control"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFileObj(e.target.files?.[0] || null)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Descripción</label>
              <input
                className="form-control"
                value={fileDesc}
                onChange={(e) => setFileDesc(e.target.value)}
                placeholder="Ej. Certificación escaneada"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={loading}
          onClick={() => {
            setForm(initialState);
            setCalc(initialCalc);
            setUsarCalculo(false);
            setFileObj(null);
            setFileDesc("");
            setColRows([{ ...emptyColRow }]);
            setOriRows([{ ...emptyOriRow }]);
          }}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default LegalCreateForm;
