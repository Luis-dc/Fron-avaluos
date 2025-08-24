import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const API = process.env.REACT_APP_API_URL;


// === Componente inline: NO requiere import ===
function ApprovalCheck({ size = 36 }) {
    return (
      <div style={{ width: size, height: size, display: 'inline-block' }}>
        <style>{`
          .acp-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
          .acp-svg { width: 100%; height: 100%; }
          .acp-ring {
            fill: none; stroke: #0d6efd; stroke-width: 4; stroke-linecap: round;
            stroke-dasharray: 164; stroke-dashoffset: 164;
            animation: acp-ring 1s ease-in-out forwards; transform-origin: 50% 50%;
          }
          .acp-check {
            fill: none; stroke: #0d6efd; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round;
            stroke-dasharray: 36; stroke-dashoffset: 36; animation: acp-draw 0.5s ease-out 0.6s forwards;
          }
          .acp-bg { fill: rgba(13,110,253,0.08); opacity: 0; animation: acp-bgfade 0.3s ease-in 0.4s forwards; }
          @keyframes acp-ring { 0%{stroke-dashoffset:164;transform:rotate(0)} 60%{stroke-dashoffset:82;transform:rotate(200deg)} 100%{stroke-dashoffset:0;transform:rotate(360deg)} }
          @keyframes acp-draw { to { stroke-dashoffset: 0; } }
          @keyframes acp-bgfade { to { opacity: 1; } }
        `}</style>
        <div className="acp-wrap" aria-label="Aprobado">
          <svg viewBox="0 0 52 52" className="acp-svg">
            <circle className="acp-bg" cx="26" cy="26" r="25" />
            <circle className="acp-ring" cx="26" cy="26" r="26" />
            <path className="acp-check" d="M16 27 L23 34 L37 18" />
          </svg>
        </div>
      </div>
    );
  }



export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fxApprovedId, setFxApprovedId] = useState(null); // para mostrar el check animado

  useEffect(()=>{
    if (!token || rol !== 'admin') { navigate('/'); return; }
    (async ()=>{
      try {
        const res = await fetch(`${API}/api/admin/solicitudes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) { alert(data.message || 'Error al cargar solicitudes'); return; }
        setItems(data);
      } catch {
        alert('Error de red al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    })();
  },[token, rol, navigate]);

  const aprobar = async (id, rolFinal='valuador') => {
    try {
      const res = await fetch(`${API}/api/admin/solicitudes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type':'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'aprobado', rol: rolFinal })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Error al aprobar');

      // Actualiza la fila y dispara animación
      setItems(items.map(x => x.id===id ? {...x, estado_solicitud:'aprobado', rol:rolFinal} : x));
      setFxApprovedId(id);
      setTimeout(()=> setFxApprovedId(null), 1600); // oculta el check después de la animación
    } catch {
      alert('Error de red al aprobar');
    }
  };

  const rechazar = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/solicitudes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type':'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'rechazado' })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Error al rechazar');

      setItems(items.map(x => x.id===id ? {...x, estado_solicitud:'rechazado'} : x));
    } catch {
      alert('Error de red al rechazar');
    }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  if (loading) return <div className="container mt-5">Cargando…</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Solicitudes</h3>
        <button className="btn btn-danger" onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>#</th><th>Nombre</th><th>Profesión</th><th>Correo</th>
              <th>Rol</th><th>Estado</th><th>Docs</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u=>(
              <tr key={u.id} className={fxApprovedId===u.id ? 'table-success' : ''}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.profesion}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td className="d-flex align-items-center gap-2">
                  <span>{u.estado_solicitud}</span>
                  {fxApprovedId===u.id && <ApprovalCheck size={26} />}
                </td>
                <td style={{maxWidth:260}}>
                  {u.dpi_archivo && <a href={`${API}/uploads/${u.dpi_archivo}`} target="_blank" rel="noreferrer">DPI</a>} {' '}
                  {u.diploma_archivo && <a href={`${API}/uploads/${u.diploma_archivo}`} target="_blank" rel="noreferrer">Diploma</a>} {' '}
                  {u.cv_archivo && <a href={`${API}/uploads/${u.cv_archivo}`} target="_blank" rel="noreferrer">CV</a>}
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-success" onClick={()=>aprobar(u.id,'valuador')}>Aprobar Valuador</button>
                    <button className="btn btn-sm btn-outline-success" onClick={()=>aprobar(u.id,'tecnico')}>Aprobar Técnico</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>rechazar(u.id)}>Rechazar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="8" className="text-center">Sin solicitudes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
