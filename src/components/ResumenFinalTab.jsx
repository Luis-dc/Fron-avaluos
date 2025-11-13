import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const ResumenFinalTab = ({ idDocumento, setMsg }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadResumen = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/resumen/documentos/${idDocumento}`, { headers });
      setResumen(data);
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResumen(); /* eslint-disable-next-line */ }, [idDocumento]);
  const finalizarAvaluo = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
  
      await axios.post(`${API}/api/resumen/documentos/${idDocumento}/finalizar`, {}, { headers });
      setMsg({ type: "success", text: "Avalúo marcado como completado. Ya puedes generar el PDF." });
    } catch (err) {
      setMsg({ type: "danger", text: err.response?.data?.message || err.message });
    }
  };
  

  if (loading) return <div className="text-muted">Calculando...</div>;
  if (!resumen) return <div className="text-danger">Sin datos para calcular el valor total</div>;

  return (
    <div className="card mt-3">
      <div className="card-header">Resumen del Avalúo</div>
      <div className="card-body">
        <table className="table table-sm table-bordered mb-3">
          <tbody>
            <tr>
              <th>Promedio valor suelo (m²)</th>
              <td>Q {Number(resumen.promedio_suelo_m2).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Área del documento (m²)</th>
              <td>{Number(resumen.area_documento).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Factor de ajuste (terreno)</th>
              <td>{resumen.factor_ajuste}</td>
            </tr>
            <tr>
              <th>Promedio valor construcciones</th>
              <td>Q {Number(resumen.promedio_construccion).toLocaleString()}</td>
            </tr>
            <tr className="table-success fw-bold">
              <th>VALOR ESTIMADO TOTAL</th>
              <td>Q {Number(resumen.valor_estimado_total).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary me-2" onClick={loadResumen}>
            Recalcular
          </button>
          <button className="btn btn-success" onClick={finalizarAvaluo}>
            Generar PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResumenFinalTab;
