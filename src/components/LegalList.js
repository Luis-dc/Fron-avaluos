import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const PAGE_SIZE = 10;

const LegalList = ({ tipo = "certificacion", onSelect }) => {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [numEscritura, setNumEscritura] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const params = useMemo(
    () => ({
      q: q || undefined,
      tipo: tipo || undefined,
      estado: estado || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      num_escritura: numEscritura || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [q, tipo, estado, desde, hasta, numEscritura, page]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/api/legal`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error listando documentos";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [q, tipo, estado, desde, hasta, numEscritura]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const anular = async (id) => {
    if (!window.confirm("¿Anular este documento?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/legal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error anulando";
      alert(msg);
    }
  };

  return (
    <div className="d-grid gap-3">
      {/* Filtros */}
      <div className="row g-3 align-items-end">
        <div className="col-md">
          <label className="form-label">Búsqueda</label>
          <input
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Propietario, dirección, #escritura"
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Desde</label>
          <input
            className="form-control"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Hasta</label>
          <input
            className="form-control"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        {tipo === "escritura" && (
          <div className="col-md-2">
            <label className="form-label"># Escritura</label>
            <input
              className="form-control"
              value={numEscritura}
              onChange={(e) => setNumEscritura(e.target.value)}
              placeholder="ESP-123"
            />
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Propietario</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Fecha / Escritura</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>
        <table className="table table-bordered table-hover align-middle">
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  {loading ? "Cargando..." : "Sin resultados"}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.numero_interno}</td>
                <td>{r.tipo}</td>
                <td>{r.propietario || "-"}</td>
                <td>{r.direccion || "-"}</td>
                <td>
                  <span className={`badge ${r.estado === "activo" ? "bg-success" : "bg-danger"}`}>
                    {r.estado}
                  </span>
                </td>
                <td>
                  {r.tipo === "certificacion"
                    ? r.fecha_cert?.slice(0, 10) || "-"
                    : r.numero_escritura || "-"}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => (typeof onSelect === "function" ? onSelect(r) : alert(`ID ${r.id}`))}
                    >
                      Ver / Editar
                    </button>
                    {r.estado === "activo" && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => anular(r.id)}
                      >
                        Anular
                      </button>
                    )}
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center">
        <span className="text-muted">
          {total} resultados · Página {page} / {totalPages}
        </span>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ◀
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalList;
