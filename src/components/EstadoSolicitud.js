import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

export default function EstadoSolicitud() {
  const [correo, setCorreo] = useState('');
  const [dpi, setDpi] = useState('');
  const [resp, setResp] = useState(null);
  const navigate = useNavigate();

  const consultar = async (e) => {
    e.preventDefault();
    setResp(null);
    try {
      const res = await fetch(`${API}/api/auth/estado-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, dpi_numero: dpi })
      });
      const data = await res.json();
      setResp(res.ok ? data : { error: data.message || 'No se pudo consultar' });
    } catch {
      setResp({ error: 'Error de red' });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: 500, maxWidth: '95%' }}>
        <h3 className="text-center mb-3">Consultar estado de solicitud</h3>
        <form onSubmit={consultar}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input className="form-control" value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">DPI</label>
            <input className="form-control" value={dpi} onChange={e => setDpi(e.target.value)} required />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary w-100">Consultar</button>
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => navigate('/')}
            >
              Regresar
            </button>
          </div>
        </form>
        {resp && (
          <div className="alert mt-3" role="alert" style={{ border: '1px solid #ddd' }}>
            {resp.error
              ? <span><b>Error:</b> {resp.error}</span>
              : <span>Estado: <b>{resp.estado_solicitud}</b> — Rol: <b>{resp.rol}</b></span>}
          </div>
        )}
      </div>
    </div>
  );
}
