import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

function Register() {
  const [form, setForm] = useState({
    nombre: '',
    profesion: '',
    correo: '',
    celular: '',
    dpi_numero: '',
    contrasena: '',
    rol: 'valuador'
  });
  const [files, setFiles] = useState({ dpi: null, diploma: null, cv: null });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('dpi', files.dpi);
      fd.append('diploma', files.diploma);
      fd.append('cv', files.cv);

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Error al registrar');

      alert('Solicitud creada. Queda en PENDIENTE hasta aprobación.');
      navigate('/');
    } catch {
      alert('Error de red');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '550px' }}>
        <h3 className="text-center mb-4">Crear cuenta</h3>
        <form onSubmit={handleRegister}>
          <div className="row">
            <div className="mb-3 col-md-6">
              <label className="form-label">Nombre completo</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3 col-md-6">
              <label className="form-label">Profesión</label>
              <input name="profesion" className="form-control" value={form.profesion} onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="mb-3 col-md-6">
              <label className="form-label">Correo electrónico</label>
              <input type="email" name="correo" className="form-control" value={form.correo} onChange={handleChange} required />
            </div>
            <div className="mb-3 col-md-6">
              <label className="form-label">Celular</label>
              <input name="celular" className="form-control" value={form.celular} onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="mb-3 col-md-6">
              <label className="form-label">DPI</label>
              <input name="dpi_numero" className="form-control" value={form.dpi_numero} onChange={handleChange} required />
            </div>
            <div className="mb-3 col-md-6">
              <label className="form-label">Contraseña</label>
              <input type="password" name="contrasena" className="form-control" value={form.contrasena} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Rol solicitado</label>
            <select name="rol" className="form-select" value={form.rol} onChange={handleChange}>
              <option value="valuador">Valuador</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>

          <div className="row">
            <div className="mb-3 col-md-4">
              <label className="form-label">DPI (PDF/JPG/PNG)</label>
              <input type="file" name="dpi" className="form-control" onChange={handleFile} required />
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">Diploma</label>
              <input type="file" name="diploma" className="form-control" onChange={handleFile} required />
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">CV</label>
              <input type="file" name="cv" className="form-control" onChange={handleFile} required />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100">Enviar solicitud</button>
          <p className="text-center mt-3">
            ¿Ya tienes cuenta? <a href="/">Inicia sesión</a> · <a href="/estado">Consultar estado</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
