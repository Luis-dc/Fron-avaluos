import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const AvaluosPDFTab = () => {
  const [avaluos, setAvaluos] = useState([]);
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadAvaluos = async () => {
    try {
      const { data } = await axios.get(`${API}/api/legal/avaluados`, { headers });
      setAvaluos(data || []);
    } catch (err) {
      setMsg({ type: "danger", text: err.response?.data?.message || err.message });
    }
  };

  useEffect(() => { loadAvaluos(); }, []);

  const descargarPDF = async (id) => {
    try {
      setMsg({ type: "info", text: `Generando PDF para certificación #${id}...` });
  
      const response = await axios.get(`${API}/api/pdf/documentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // 👈 clave: indica que esperamos un archivo binario
      });
  
      // Crear un Blob del PDF recibido
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace temporal para descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `avaluo_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
  
      // Limpieza
      window.URL.revokeObjectURL(url);
      link.remove();
  
      setMsg({ type: "success", text: "PDF descargado correctamente." });
    } catch (err) {
      console.error("❌ Error descargando PDF:", err);
      setMsg({
        type: "danger",
        text: err?.response?.data?.message || "Error al generar o descargar el PDF.",
      });
    }
  };
  

  return (
    <div className="card">
      <div className="card-header">Avalúos completados</div>
      <div className="card-body">
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {avaluos.length === 0 ? (
          <p className="text-muted">No hay avalúos finalizados.</p>
        ) : (
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Propietario</th>
                <th>Dirección</th>
                <th>Fecha</th>
                <th>Descargar</th>
              </tr>
            </thead>
            <tbody>
                {avaluos.map((a, i) => (
                    <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.tipo}</td>
                    <td>{a.propietario}</td>
                    <td>{a.direccion}</td>
                    <td>{a.fecha_cert || a.creado_en?.split("T")[0]}</td>
                    <td>
                        <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => descargarPDF(a.id)} // ✅ corregido
                        >
                        Descargar PDF
                        </button>
                    </td>
                    </tr>
                ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
};

export default AvaluosPDFTab;
