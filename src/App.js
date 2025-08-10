import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ValuadorDashboard from './components/ValuadorDashboard';
import TecnicoDashboard from './components/TecnicoDashboard';
import EstadoSolicitud from './components/EstadoSolicitud';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/estado" element={<EstadoSolicitud />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/valuador" element={<ValuadorDashboard />} />
        <Route path="/tecnico" element={<TecnicoDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
