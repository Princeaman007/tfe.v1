import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // ✅ Évite le clignotement temporaire en attendant l'authentification
  if (isAuthenticated === null) {
    return <p className="text-center mt-5">🔄 Chargement en cours...</p>;
  }

  // ✅ Redirige vers `/login` en sauvegardant la page actuelle pour une redirection après connexion
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
