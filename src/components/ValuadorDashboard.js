import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function ValuadorDashboard() {
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombre");
  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (!localStorage.getItem("token") || rol !== "valuador") {
      navigate("/");
    }
  }, [navigate, rol]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bienvenido, {nombre}</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <p className="lead">Panel exclusivo para <strong>Valuador</strong>.</p>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Accesos rápidos</h5>
          <p className="card-text">Selecciona un módulo para continuar:</p>
          <Link to="/legal" className="btn btn-primary">
            Ir al Módulo Legal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ValuadorDashboard;
