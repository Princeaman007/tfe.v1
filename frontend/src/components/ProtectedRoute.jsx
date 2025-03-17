import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // 🔹 Vérifie si un token est présent

  if (!token) {
    return <Navigate to="/login" replace />; // 🔹 Redirection vers Login si non connecté
  }

  return children;
};

export default ProtectedRoute;
