import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, isAllowed } from "../utils/auth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;             // sin login
  if (!isAllowed(roles)) return <Navigate to="/" replace />;  // sin rol
  return children;
};

export default ProtectedRoute;
