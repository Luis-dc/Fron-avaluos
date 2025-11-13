// src/components/TerrenoTab.js
import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL;

const UBICACION_OPTIONS = [
  { value: "medial", label: "Medial" },
  { value: "esquina_residencial", label: "Esquina (Residencial)" },
  { value: "esquina_comercial", label: "Esquina (Comercial)" },
  { value: "lote_interior", label: "Lote interior" },
];

// Forma: 5 opciones fijas (Sprint 2)
const FORMA_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "irregular", label: "Irregular" },
  { value: "muy_irregular", label: "Muy irregular" },
  { value: "triangulo_delta", label: "Triángulo delta" },
  { value: "triangulo_nabla", label: "Triángulo nabla" },
];

function getToken() {
  return localStorage.getItem("token") || "";
}

async function apiGetTerreno(idDocumento) {
  const res = await fetch(`${API}/api/legal/${idDocumento}/documento-terreno`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  
  if (res.status === 404) {
    // No existe aún → devolver objeto vacío
    return { ok: false, data: null };
  }
  
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "fetch_error");
  }

  return res.json();
}


async function apiUpsertTerreno(idDocumento, payload) {
  const res = await fetch(`${API}/api/legal/${idDocumento}/documento-terreno`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw res;
  return res.json();
}

export default function TerrenoTab({ idDocumento }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form: solo entradas que el usuario edita
  const [form, setForm] = useState({
    ubicacion: "medial",
    frente_m: "",
    fondo_m: "",
    distancia_interior: "", // solo si lote_interior
    forma_clave: "regular",
    pendiente_pct: "",      // %
    nivel_tipo: "sobre",    // "sobre" | "bajo"
    nivel_desnivel_m: "",   // metros
  });

  // Respuesta del backend (último guardado)
  const [serverData, setServerData] = useState(null);
  const [result, setResult] = useState({
    factor_ubicacion: null,
    factor_frente: null,
    factor_fondo: null,
    factor_extension: null,
    factor_forma: null,
    factor_pendiente: null,
    factor_nivel: null,
    factor_final: null,
  });
  const [trace, setTrace] = useState(null);

  const requiresDistancia = form.ubicacion === "lote_interior";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const json = await apiGetTerreno(idDocumento);
        if (!mounted) return;
        if (json?.ok && json.data) {
          const d = json.data;
          setServerData(d);

          // Compatibilidad: mapear posibles campos anteriores a forma_clave
          const forma_clave =
            d.forma_clave ??
            (d.clasificacion_forma === "regular" ? "regular"
              : d.clasificacion_forma === "irregular" ? "irregular"
              : d.clasificacion_forma === "muy_irregular" ? "muy_irregular"
              : d.clasificacion_forma === "TRIANGULO_NABLA" ? "triangulo_nabla"
              : d.clasificacion_forma === "triangular" ? "triangulo_delta"
              : "regular");

          setForm({
            ubicacion: d.ubicacion || "medial",
            frente_m: d.frente_m ?? "",
            fondo_m: d.fondo_m ?? "",
            distancia_interior: d.distancia_interior ?? "",
            forma_clave,
            pendiente_pct: d.pendiente_pct ?? "",
            nivel_tipo: d.nivel_tipo ?? "sobre",
            nivel_desnivel_m: d.nivel_desnivel_m ?? "",
          });

          setResult({
            factor_ubicacion: d.factor_ubicacion != null ? Number(d.factor_ubicacion) : null,
            factor_frente: d.factor_frente != null ? Number(d.factor_frente) : null,
            factor_fondo: d.factor_fondo != null ? Number(d.factor_fondo) : null,
            factor_extension: d.factor_extension != null ? Number(d.factor_extension) : null,
            factor_forma: d.factor_forma != null ? Number(d.factor_forma) : null,
            factor_pendiente: d.factor_pendiente != null ? Number(d.factor_pendiente) : null,
            factor_nivel: d.factor_nivel != null ? Number(d.factor_nivel) : null,
            factor_final: d.factor_final != null ? Number(d.factor_final) : null,
          });
          setTrace(d.factor_json ?? null);
        } else {
          setServerData(null);
        }
      } catch {
        // 404 u otro: no hay registro aún
        setServerData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [idDocumento]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const numeric = ["frente_m", "fondo_m", "distancia_interior", "pendiente_pct", "nivel_desnivel_m"];
    // Si cambia ubicacion y deja de ser lote_interior, limpia distancia_interior
    if (name === "ubicacion") {
      setForm((s) => ({
        ...s,
        ubicacion: value,
        distancia_interior: value === "lote_interior" ? s.distancia_interior : "",
      }));
      return;
    }
    setForm((s) => ({
      ...s,
      [name]: numeric.includes(name) ? value.replace(",", ".") : value,
    }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    setError("");
    try {
      // Validaciones mínimas
      const fm = Number(form.frente_m);
      const fo = Number(form.fondo_m);
      if (!(fm > 0 && fo > 0)) {
        setError("Frente y Fondo deben ser mayores a 0.");
        setSaving(false);
        return;
      }
      if (requiresDistancia) {
        const di = Number(form.distancia_interior);
        if (!Number.isFinite(di) || di < 0) {
          setError("Distancia al frente (m) requerida y >= 0 para lote interior.");
          setSaving(false);
          return;
        }
      }
      const pend = form.pendiente_pct === "" ? null : Number(form.pendiente_pct);
      if (pend != null && !(pend >= 0)) {
        setError("Pendiente (%) debe ser >= 0.");
        setSaving(false);
        return;
      }
      const desn = form.nivel_desnivel_m === "" ? null : Number(form.nivel_desnivel_m);
      if (desn != null && !(desn >= 0)) {
        setError("Desnivel (m) debe ser >= 0.");
        setSaving(false);
        return;
      }

      const payload = {
        ubicacion: form.ubicacion,
        frente_m: Number(form.frente_m),
        fondo_m: Number(form.fondo_m),
        ...(requiresDistancia ? { distancia_interior: Number(form.distancia_interior) } : {}),
        forma_clave: form.forma_clave,
        pendiente_pct: pend,
        nivel_tipo: form.nivel_tipo,            // "sobre" | "bajo"
        nivel_desnivel_m: desn,
      };

      const json = await apiUpsertTerreno(idDocumento, payload);
      if (json?.ok && json.data) {
        const d = json.data;
        setServerData(d);
        setResult({
          factor_ubicacion: d.factor_ubicacion != null ? Number(d.factor_ubicacion) : null,
          factor_frente: d.factor_frente != null ? Number(d.factor_frente) : null,
          factor_fondo: d.factor_fondo != null ? Number(d.factor_fondo) : null,
          factor_extension: d.factor_extension != null ? Number(d.factor_extension) : null,
          factor_forma: d.factor_forma != null ? Number(d.factor_forma) : null,
          factor_pendiente: d.factor_pendiente != null ? Number(d.factor_pendiente) : null,
          factor_nivel: d.factor_nivel != null ? Number(d.factor_nivel) : null,
          factor_final: d.factor_final != null ? Number(d.factor_final) : null,
        });
        setTrace(d.factor_json ?? null);
      }
    } catch (e) {
      try {
        const m = await e.json();
        setError(m?.error || "No se pudo guardar. Revisa los datos.");
      } catch {
        setError("No se pudo guardar. Revisa los datos.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDescartar = () => {
    if (!serverData) {
      setForm({
        ubicacion: "medial",
        frente_m: "",
        fondo_m: "",
        distancia_interior: "",
        forma_clave: "regular",
        pendiente_pct: "",
        nivel_tipo: "sobre",
        nivel_desnivel_m: "",
      });
      setResult({
        factor_ubicacion: null,
        factor_frente: null,
        factor_fondo: null,
        factor_extension: null,
        factor_forma: null,
        factor_pendiente: null,
        factor_nivel: null,
        factor_final: null,
      });
      setTrace(null);
      return;
    }
    const d = serverData;
    setForm({
      ubicacion: d.ubicacion || "medial",
      frente_m: d.frente_m ?? "",
      fondo_m: d.fondo_m ?? "",
      distancia_interior: d.distancia_interior ?? "",
      forma_clave: d.forma_clave ?? "regular",
      pendiente_pct: d.pendiente_pct ?? "",
      nivel_tipo: d.nivel_tipo ?? "sobre",
      nivel_desnivel_m: d.nivel_desnivel_m ?? "",
    });
    setResult({
      factor_ubicacion: d.factor_ubicacion != null ? Number(d.factor_ubicacion) : null,
      factor_frente: d.factor_frente != null ? Number(d.factor_frente) : null,
      factor_fondo: d.factor_fondo != null ? Number(d.factor_fondo) : null,
      factor_extension: d.factor_extension != null ? Number(d.factor_extension) : null,
      factor_forma: d.factor_forma != null ? Number(d.factor_forma) : null,
      factor_pendiente: d.factor_pendiente != null ? Number(d.factor_pendiente) : null,
      factor_nivel: d.factor_nivel != null ? Number(d.factor_nivel) : null,
      factor_final: d.factor_final != null ? Number(d.factor_final) : null,
    });
    setTrace(d.factor_json ?? null);
  };

  if (loading) return <div className="card"><div className="card-body">Cargando…</div></div>;

  const fmt = (v) => (v != null && Number.isFinite(Number(v)) ? Number(v).toFixed(4) : "—");

  return (
    <div className="card mt-3">
      <div className="card-header"><b>Terreno / Factores</b></div>
      <div className="card-body">

        {error && <div className="alert alert-danger">{error}</div>}

        <h5>Datos del lote</h5>
        <div className="row">
          {/* Ubicación */}
          <div className="col-md-6 mb-2">
            <label className="form-label">Ubicación en manzana</label>
            <div className="row">
              {UBICACION_OPTIONS.map(opt => (
                <div className="col-6" key={opt.value}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="ubicacion"
                      id={`ubic_${opt.value}`}
                      value={opt.value}
                      checked={form.ubicacion === opt.value}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor={`ubic_${opt.value}`}>
                      {opt.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distancia si es lote interior */}
          {requiresDistancia && (
            <div className="col-md-6 mb-2">
              <label className="form-label">Distancia al frente (m)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="distancia_interior"
                value={form.distancia_interior}
                onChange={onChange}
                className="form-control"
                placeholder="e.g. 30.00"
              />
            </div>
          )}

          {/* Frente / Fondo */}
          <div className="col-md-3 mb-2">
            <label className="form-label">Frente (m)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="frente_m"
              value={form.frente_m}
              onChange={onChange}
              className="form-control"
              placeholder="12.50"
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className="form-label">Fondo (m)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="fondo_m"
              value={form.fondo_m}
              onChange={onChange}
              className="form-control"
              placeholder="25.00"
            />
          </div>

          {/* Forma */}
          <div className="col-md-3 mb-2">
            <label className="form-label">Forma</label>
            <select
              className="form-select"
              name="forma_clave"
              value={form.forma_clave}
              onChange={onChange}
            >
              {FORMA_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Pendiente (%) */}
          <div className="col-md-3 mb-2">
            <label className="form-label">Pendiente (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="pendiente_pct"
              value={form.pendiente_pct}
              onChange={onChange}
              className="form-control"
              placeholder="Ej. 12"
            />
          </div>

          {/* Nivel */}
          <div className="col-md-3 mb-2">
            <label className="form-label d-block">Nivel</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nivel_tipo"
                  id="nivel_sobre"
                  value="sobre"
                  checked={form.nivel_tipo === "sobre"}
                  onChange={onChange}
                />
                <label className="form-check-label" htmlFor="nivel_sobre">Sobre nivel</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nivel_tipo"
                  id="nivel_bajo"
                  value="bajo"
                  checked={form.nivel_tipo === "bajo"}
                  onChange={onChange}
                />
                <label className="form-check-label" htmlFor="nivel_bajo">Bajo nivel</label>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <label className="form-label">Desnivel (m)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="nivel_desnivel_m"
              value={form.nivel_desnivel_m}
              onChange={onChange}
              className="form-control"
              placeholder="Ej. 3.50"
            />
          </div>
        </div>

        <div className="mt-2 d-flex gap-2">
          <button className="btn btn-primary me-2" disabled={saving} onClick={handleGuardar}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={handleDescartar}>
            Descartar cambios
          </button>
        </div>

        {/* Resultados */}
        <div className="mt-4">
          <h5>Resultados</h5>
          <div className="row">
            {[
              ["Factor ubicación", result.factor_ubicacion],
              ["Factor frente", result.factor_frente],
              ["Factor fondo", result.factor_fondo],
              ["Factor extensión", result.factor_extension],
              ["Factor forma", result.factor_forma],
              ["Factor pendiente", result.factor_pendiente],
              ["Factor nivel", result.factor_nivel],
            ].map(([label, val]) => (
              <div className="col-md-3 mb-2" key={label}>
                <div className="border rounded p-3 h-100">
                  <div className="text-muted">{label}</div>
                  <div className="fs-5 fw-semibold">{fmt(val)}</div>
                  {label === "Factor extensión" && trace?.detalles?.rango_extension && (
                    <div className="small text-muted mt-1">
                      Rango: {trace.detalles.rango_extension.min_m2}–{trace.detalles.rango_extension.max_m2 ?? "∞"} m²
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="col-12 mb-2">
              <div className="border rounded p-3 bg-light d-flex justify-content-between align-items-center">
                <div className="text-muted">Factor final</div>
                <div className="fs-3 fw-bold">{fmt(result.factor_final)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trazabilidad */}
        <details className="mt-2">
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Trazabilidad</summary>
          <div className="mt-2">
            {!trace ? (
              <div className="text-muted">Sin datos de trazabilidad aún.</div>
            ) : (
              <>
                <div className="mb-2"><b>Regla aplicada:</b> {trace.regla_aplicada}</div>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr><th>Campo</th><th>Valor</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(trace.inputs || {}).map(([k, v]) => (
                        <tr key={k}><td>{k}</td><td>{String(v)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {trace.detalles?.lote_interior_grid && (
                  <div className="small text-muted mt-2">
                    Grid (lote interior): fondo={trace.detalles.lote_interior_grid.fondo_grid} · distancia={trace.detalles.lote_interior_grid.distancia_grid}
                  </div>
                )}
              </>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
