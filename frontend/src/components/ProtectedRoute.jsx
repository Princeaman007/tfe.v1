import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 🔄 Évite le clignotement en attendant la vérification
  if (isAuthenticated === null) {
    return <p className="text-center mt-5">🔄 Chargement en cours...</p>;
  }

  // 🔒 Vérifie si l'utilisateur est connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔐 Vérifie si l'utilisateur a le bon rôle pour accéder à cette page
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
