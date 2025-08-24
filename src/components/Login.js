import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.message || "Credenciales incorrectas"));
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.usuario.rol);
      localStorage.setItem('nombre', data.usuario.nombre);

      if (data.usuario.rol === 'valuador') {
        navigate('/valuador');
      } else if (data.usuario.rol === 'tecnico') {
        navigate('/tecnico');
      } else if (data.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        alert("Rol no reconocido");
      }

    } catch (error) {
      alert("Error de red: no se pudo conectar al servidor.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              placeholder="Tu contraseña"
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Ingresar
          </button>
          <p className="text-center mt-3">
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a> · <a href="/estado">Consultar estado</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
