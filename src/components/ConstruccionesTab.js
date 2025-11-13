import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const calcularFactorAjuste = (tipo, edad) => {
  const tabla = [
    { min: 0, max: 5,   Alta: 1.00, Media: 1.00, Baja: 1.00, Precaria: 1.00 },
    { min: 6, max: 10,  Alta: 0.93, Media: 0.92, Baja: 0.90, Precaria: 0.88 },
    { min: 11, max: 15, Alta: 0.89, Media: 0.87, Baja: 0.85, Precaria: 0.82 },
    { min: 16, max: 20, Alta: 0.87, Media: 0.84, Baja: 0.81, Precaria: 0.78 },
    { min: 21, max: 25, Alta: 0.80, Media: 0.77, Baja: 0.72, Precaria: 0.67 },
    { min: 26, max: 30, Alta: 0.77, Media: 0.72, Baja: 0.67, Precaria: 0.62 },
    { min: 31, max: 35, Alta: 0.75, Media: 0.70, Baja: 0.64, Precaria: 0.56 },
    { min: 36, max: 40, Alta: 0.73, Media: 0.67, Baja: 0.59, Precaria: 0.53 },
    { min: 41, max: 45, Alta: 0.71, Media: 0.65, Baja: 0.55, Precaria: 0.50 },
    { min: 46, max: 50, Alta: 0.69, Media: 0.63, Baja: 0.51, Precaria: 0.47 },
    { min: 51, max: 55, Alta: 0.67, Media: 0.61, Baja: 0.55, Precaria: 0.44 },
    { min: 56, max: 60, Alta: 0.65, Media: 0.59, Baja: 0.53, Precaria: 0.41 },
  ];
  const fila = tabla.find(r => edad >= r.min && edad <= r.max);
  return fila ? fila[tipo] || 1 : 1;
};

const ConstruccionesTab = ({ idDocumento, setMsg }) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [construcciones, setConstrucciones] = useState([]);
  const [newC, setNewC] = useState({
    tipo: "Alta",
    area_m2: "",
    valor_m2: "",
    edad_anios: "",
    descripcion: "",
    foto_url: "",
  });

  const loadConstrucciones = async () => {
    try {
      const { data } = await axios.get(`${API}/api/construcciones/documentos/${idDocumento}`, { headers });
      setConstrucciones(data || []);
    } catch (err) {
      setConstrucciones([]);
    }
  };

  useEffect(() => { loadConstrucciones(); }, [idDocumento]);

  const agregarConstruccion = async () => {
    if (!newC.tipo || !newC.area_m2 || !newC.valor_m2 || !newC.edad_anios)
      return setMsg({ type: "warning", text: "Completa los campos: Tipo, Área, Valor/m², Edad." });

    // Calcular factor automáticamente
    const factor = calcularFactorAjuste(newC.tipo, Number(newC.edad_anios));

    const construccion = {
      ...newC,
      factor_ajuste: factor,
      valor_total: newC.area_m2 * newC.valor_m2 * factor,
    };

    try {
      const { data } = await axios.post(`${API}/api/construcciones/documentos/${idDocumento}`, construccion, { headers });
      setConstrucciones((prev) => [data, ...prev]);
      setNewC({ tipo: "Alta", area_m2: "", valor_m2: "", edad_anios: "", descripcion: "", foto_url: "" });
      setMsg({ type: "success", text: "Construcción agregada correctamente." });
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    }
  };

  const eliminarConstruccion = async (id) => {
    if (!window.confirm("¿Eliminar construcción?")) return;
    try {
      await axios.delete(`${API}/api/construcciones/${id}`, { headers });
      setConstrucciones((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Construcciones</span>
        <button className="btn btn-sm btn-outline-primary" onClick={agregarConstruccion}>
          + Agregar
        </button>
      </div>

      <div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={newC.tipo} onChange={(e) => setNewC({ ...newC, tipo: e.target.value })}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
              <option>Precaria</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Área (m²)</label>
            <input type="number" className="form-control" value={newC.area_m2} onChange={(e) => setNewC({ ...newC, area_m2: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Valor/m²</label>
            <input type="number" className="form-control" value={newC.valor_m2} onChange={(e) => setNewC({ ...newC, valor_m2: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Edad (años)</label>
            <input type="number" className="form-control" value={newC.edad_anios} onChange={(e) => setNewC({ ...newC, edad_anios: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Descripción</label>
            <input className="form-control" value={newC.descripcion} onChange={(e) => setNewC({ ...newC, descripcion: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Foto (URL)</label>
            <input className="form-control" value={newC.foto_url} onChange={(e) => setNewC({ ...newC, foto_url: e.target.value })} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Área</th>
                <th>Valor/m²</th>
                <th>Edad</th>
                <th>Factor ajuste</th>
                <th>Valor total</th>
                <th>Foto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {construcciones.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted">Sin construcciones</td></tr>
              ) : construcciones.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.tipo}</td>
                  <td>{c.area_m2}</td>
                  <td>{c.valor_m2}</td>
                  <td>{c.edad_anios}</td>
                  <td>{c.factor_ajuste}</td>
                  <td>{(c.area_m2 * c.valor_m2 * c.factor_ajuste).toFixed(2)}</td>
                  <td>{c.foto_url ? <img src={c.foto_url} alt="foto" width="60" /> : "-"}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarConstruccion(c.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConstruccionesTab;
