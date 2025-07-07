import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner, Container } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 🔄 Affichage de chargement pendant la vérification d'authentification
  if (loading || isAuthenticated === null) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Vérification de l'authentification...</p>
        </div>
      </Container>
    );
  }

  // 🔒 Redirection vers login si pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔐 Vérification des rôles avec gestion des hiérarchies
  if (role) {
    const roleHierarchy = {
      user: 1,
      admin: 2,
      superadmin: 3
    };

    const userRoleLevel = roleHierarchy[user?.role] || 0;
    const requiredRoleLevel = roleHierarchy[role] || 999;

    // L'utilisateur doit avoir un niveau de rôle >= au niveau requis
    if (userRoleLevel < requiredRoleLevel) {
      console.warn(`Accès refusé: rôle '${user?.role}' insuffisant pour '${role}'`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ✅ Utilisateur autorisé
  return children;
};

export default ProtectedRoute;