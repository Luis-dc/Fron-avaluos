import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ValuadorDashboard from './components/ValuadorDashboard';
import TecnicoDashboard from './components/TecnicoDashboard';
import EstadoSolicitud from './components/EstadoSolicitud';
import AdminDashboard from './components/AdminDashboard';
import LegalDashboard from './components/LegalDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/estado" element={<EstadoSolicitud />} />

        {/* privadas existentes (si quieres puedes protegerlas igual) */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/valuador" element={
          <ProtectedRoute roles={['valuador','admin']}>
            <ValuadorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/tecnico" element={
          <ProtectedRoute roles={['tecnico','admin']}>
            <TecnicoDashboard />
          </ProtectedRoute>
        } />

        {/* NUEVA: Módulo Legal (valuador|admin) */}
        <Route path="/legal" element={
          <ProtectedRoute roles={['valuador','admin']}>
            <LegalDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
