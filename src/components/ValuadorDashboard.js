import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ValuadorDashboard() {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre');
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    if (!localStorage.getItem('token') || rol !== 'valuador') {
      navigate('/');
    }
  }, [navigate, rol]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Bienvenido, {nombre}</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      <p>Panel exclusivo para <strong>Valuador</strong>.</p>
    </div>
  );
}

export default ValuadorDashboard;
