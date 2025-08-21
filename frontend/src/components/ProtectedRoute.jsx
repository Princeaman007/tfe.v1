import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner, Container } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, allowedRoles }) => {
  let authData;
  
  // Gestion d'erreur pour useAuth
  try {
    authData = useAuth();
  } catch (error) {
    console.error("Erreur AuthContext dans ProtectedRoute:", error);
    
    // Redirection d'urgence vers login si le contexte est cassé
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, user, loading } = authData;
  const location = useLocation();

  // Affichage de chargement pendant la vérification d'authentification
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

  // Redirection vers login si pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Vérification des rôles avec gestion des hiérarchies
  if (role || allowedRoles) {
    const userRole = user?.role?.toLowerCase();
    
    if (!userRole) {
      console.warn("Utilisateur sans rôle défini");
      return <Navigate to="/dashboard" replace />;
    }

    // Vérification avec allowedRoles (prioritaire sur role)
    if (allowedRoles) {
      const hasAllowedRole = allowedRoles.some(
        allowedRole => allowedRole.toLowerCase() === userRole
      );
      
      if (!hasAllowedRole) {
        console.warn(`Accès refusé: rôle '${userRole}' non autorisé. Rôles autorisés: ${allowedRoles.join(', ')}`);
        return <Navigate to="/dashboard" replace />;
      }
    } 
    // Vérification avec role (hiérarchie)
    else if (role) {
      const roleHierarchy = {
        user: 1,
        admin: 2,
        superadmin: 3 // Attention à la casse
      };

      const userRoleLevel = roleHierarchy[userRole] || 0;
      const requiredRoleLevel = roleHierarchy[role.toLowerCase()] || 999;

      if (userRoleLevel < requiredRoleLevel) {
        console.warn(`Accès refusé: rôle '${userRole}' insuffisant pour '${role}'`);
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // Utilisateur autorisé
  return children;
};

export default ProtectedRoute;