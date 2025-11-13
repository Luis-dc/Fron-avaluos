import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const ReferencialesTab = ({ idDocumento, setMsg }) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [referenciales, setReferenciales] = useState([]);
  const [newRef, setNewRef] = useState({
    link_fuente: "",
    valor_total_inmueble: "",
    area_total_terreno: "",
    area_total_construccion: "",
    valor_construccion: "",
    foto_url: "",
    foto_file: null,
  });

  // 🔹 Cargar referenciales al entrar
  const loadReferenciales = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/referenciales/documentos/${idDocumento}`,
        { headers }
      );
      setReferenciales(data || []);
    } catch (err) {
      setMsg({
        type: "danger",
        text: err?.response?.data?.message || err.message,
      });
    }
  };

  useEffect(() => {
    loadReferenciales();
    // eslint-disable-next-line
  }, [idDocumento]);

  // 🔹 Sanitizar números (quita comas)
  const sanitizeNumber = (val) =>
    Number(String(val).replace(/,/g, "").trim()) || 0;

  // 🔹 Agregar referencial
  const agregarReferencial = async () => {
    if (
      !newRef.link_fuente ||
      !newRef.valor_total_inmueble ||
      !newRef.area_total_terreno
    ) {
      return setMsg({
        type: "warning",
        text: "Completa los campos obligatorios: Link, Valor total, Área terreno.",
      });
    }

    if (
      sanitizeNumber(newRef.valor_total_inmueble) <
      sanitizeNumber(newRef.valor_construccion)
    ) {
      return setMsg({
        type: "warning",
        text: "El valor total debe ser mayor o igual al valor de construcción.",
      });
    }

    try {
      const fd = new FormData();
      fd.append("link_fuente", newRef.link_fuente);
      fd.append(
        "valor_total_inmueble",
        sanitizeNumber(newRef.valor_total_inmueble)
      );
      fd.append("area_total_terreno", sanitizeNumber(newRef.area_total_terreno));
      fd.append(
        "area_total_construccion",
        sanitizeNumber(newRef.area_total_construccion)
      );
      fd.append("valor_construccion", sanitizeNumber(newRef.valor_construccion));

      if (newRef.foto_file) fd.append("foto", newRef.foto_file);
      else if (newRef.foto_url) fd.append("foto_url", newRef.foto_url);

      const { data } = await axios.post(
        `${API}/api/referenciales/documentos/${idDocumento}`,
        fd,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );

      setReferenciales((prev) => [data, ...prev]);
      setNewRef({
        link_fuente: "",
        valor_total_inmueble: "",
        area_total_terreno: "",
        area_total_construccion: "",
        valor_construccion: "",
        foto_url: "",
        foto_file: null,
      });
      setMsg({ type: "success", text: "Referencial agregado correctamente." });
    } catch (err) {
      setMsg({
        type: "danger",
        text: err?.response?.data?.message || err.message,
      });
    }
  };

  // 🔹 Eliminar referencial
  const eliminarReferencial = async (id) => {
    if (!window.confirm("¿Eliminar referencial?")) return;
    try {
      await axios.delete(`${API}/api/referenciales/${id}`, { headers });
      setReferenciales((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setMsg({
        type: "danger",
        text: err?.response?.data?.message || err.message,
      });
    }
  };

  // 🔹 Promedio de valor suelo/m²
  const promedio = referenciales.length
    ? (
        referenciales.reduce(
          (acc, r) => acc + Number(r.valor_suelo_m2 || 0),
          0
        ) / referenciales.length
      ).toFixed(2)
    : 0;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Referenciales</span>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={agregarReferencial}
        >
          + Agregar
        </button>
      </div>

      <div className="card-body">
        {/* Formulario */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Link fuente</label>
            <input
              className="form-control"
              placeholder="https://..."
              value={newRef.link_fuente}
              onChange={(e) =>
                setNewRef((s) => ({ ...s, link_fuente: e.target.value }))
              }
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Valor total</label>
            <input
              type="text"
              className="form-control"
              value={newRef.valor_total_inmueble}
              onChange={(e) =>
                setNewRef((s) => ({
                  ...s,
                  valor_total_inmueble: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Área terreno (m²)</label>
            <input
              type="text"
              className="form-control"
              value={newRef.area_total_terreno}
              onChange={(e) =>
                setNewRef((s) => ({
                  ...s,
                  area_total_terreno: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Área constr. (m²)</label>
            <input
              type="text"
              className="form-control"
              value={newRef.area_total_construccion}
              onChange={(e) =>
                setNewRef((s) => ({
                  ...s,
                  area_total_construccion: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Valor construcción</label>
            <input
              type="text"
              className="form-control"
              value={newRef.valor_construccion}
              onChange={(e) =>
                setNewRef((s) => ({
                  ...s,
                  valor_construccion: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Foto (subir o URL)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control mb-1"
              onChange={(e) =>
                setNewRef((s) => ({ ...s, foto_file: e.target.files[0] }))
              }
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Link</th>
                <th>Valor total</th>
                <th>Área terreno</th>
                <th>Área constr.</th>
                <th>Valor constr.</th>
                <th>Valor suelo/m²</th>
                <th>Foto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {referenciales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted">
                    Sin referenciales
                  </td>
                </tr>
              ) : (
                referenciales.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <a href={r.link_fuente} target="_blank" rel="noreferrer">
                        {r.link_fuente}
                      </a>
                    </td>
                    <td>{Number(r.valor_total_inmueble).toLocaleString()}</td>
                    <td>{r.area_total_terreno}</td>
                    <td>{r.area_total_construccion}</td>
                    <td>{r.valor_construccion}</td>
                    <td>{r.valor_suelo_m2}</td>
                    <td className="text-center">
                      {r.foto_url ? (
                        <img
                          src={
                            r.foto_url.startsWith("http")
                              ? r.foto_url
                              : `${API}${r.foto_url}`
                          }
                          alt="foto"
                          width="70"
                          height="55"
                          className="rounded shadow-sm border"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarReferencial(r.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {referenciales.length > 0 && (
          <div className="text-end fw-bold">
            Promedio suelo/m²:&nbsp;{Number(promedio).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencialesTab;
