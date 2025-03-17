import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Layout = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated === null) {
    return <h1 className="text-center mt-5">🔄 Chargement...</h1>; // ✅ Afficher "Chargement" au lieu de `null`
  }

  if (!isAuthenticated) {
    return null; // ✅ Empêcher l'affichage de Layout si l'utilisateur n'est pas connecté
  }

  return (
    <div className="d-flex">
      {/* ✅ Sidebar toujours affichée */}
      <nav className="sidebar vh-100 d-flex flex-column p-3 text-white bg-dark">
        <h4 className="fw-bold text-center">📚 Bibliothèque</h4>

        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link text-white">
              <i className="fas fa-tachometer-alt me-2"></i> Tableau de Bord
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/analytics" className="nav-link text-white">
              <i className="fas fa-chart-bar me-2"></i> Analytics
            </NavLink>
          </li>
        </ul>

        {/* ✅ Profil Section */}
        <div className="mt-auto text-center">
          <img src="https://randomuser.me/api/portraits/women/70.jpg" className="rounded-circle mb-2" alt="Profile" width="60" />
          <h6 className="text-white mb-0">Alex Morgan</h6>
          <small className="text-light">Admin</small>
        </div>
      </nav>

      {/* ✅ Main Content */}
      <div className="flex-grow-1">
        {/* ✅ Navbar */}
        <nav className="navbar navbar-expand-lg bg-white shadow-sm px-3">
          <NavLink to="/" className="navbar-brand fw-bold text-dark">📚 Bibliothèque</NavLink>

          <div className="ms-auto">
            <button onClick={logout} className="btn btn-danger btn-sm">Déconnexion</button>
          </div>
        </nav>

        {/* ✅ Affichage du contenu */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
