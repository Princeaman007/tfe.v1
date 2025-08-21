import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  let authData;
  
  // Gestion d'erreur pour useAuth
  try {
    authData = useAuth();
  } catch (error) {
    console.error("Erreur AuthContext dans Layout:", error);
    
    // Affichage d'erreur si le contexte est cassé
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Erreur d'authentification</h4>
          <p>Impossible de charger les données d'authentification.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/login'}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const { isAuthenticated, user, logout, loading } = authData;
  const [collapsed, setCollapsed] = useState(false);

  // Affichage de chargement
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérification de l'état d'authentification
  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>Accès non autorisé</h4>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Forcer la déconnexion locale en cas d'erreur
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Sidebar */}
        <div className={`col-auto ${collapsed ? "col-md-1" : "col-md-3"} col-xl-2 px-sm-2 px-0 bg-dark text-white min-vh-100 d-flex flex-column shadow`}>
          {/* Toggle Button */}
          <div className="d-flex justify-content-end p-2">
            <button 
              className="btn btn-sm btn-outline-light"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Étendre" : "Réduire"}
            >
              <i className={`fas fa-${collapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mt-3 mb-4">
            {!collapsed && <h4 className="fw-bold d-none d-md-block">Bibliothèque</h4>}
          </div>

          {/* Menu */}
          <ul className="nav nav-pills flex-column mb-auto px-2">
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link text-white">
                <i className="fas fa-home me-2"></i>
                {!collapsed && "Accueil"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-rentals" className="nav-link text-white">
                <i className="fas fa-book-reader me-2"></i>
                {!collapsed && "Mes Locations"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-reviews" className="nav-link text-white">
                <i className="fas fa-star me-2"></i>
                {!collapsed && "Mes Avis"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/favorites" className="nav-link text-white">
                <i className="fas fa-heart me-2"></i>
                {!collapsed && "Favoris"}
              </NavLink>
            </li>

            {(user?.role === "admin" || user?.role === "superAdmin") && (
              <>
                <hr className="bg-light" />
                <li className="nav-item">
                  <NavLink to="/manage-books" className="nav-link text-white">
                    <i className="fas fa-cog me-2"></i>
                    {!collapsed && "Gérer Livres"}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/analytics" className="nav-link text-white">
                    <i className="fas fa-chart-line me-2"></i>
                    {!collapsed && "Statistiques"}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin-rentals" className="nav-link text-white">
                    <i className="fas fa-clipboard-list me-2"></i>
                    {!collapsed && "Locations"}
                  </NavLink>
                </li>
              </>
            )}

            {user?.role === "superAdmin" && (
              <>
                <hr className="bg-light" />
                <li className="nav-item">
                  <NavLink to="/manage-users" className="nav-link text-white">
                    <i className="fas fa-users me-2"></i>
                    {!collapsed && "Utilisateurs"}
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Profil utilisateur */}
          <div className="mt-auto text-center border-top pt-3 pb-3 px-2">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle border border-light mb-2 shadow-sm"
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#007bff",
                color: "white",
                fontWeight: "bold",
                fontSize: "20px"
              }}
            >
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <NavLink to="/profile" className="btn btn-outline-light btn-sm w-100">
                Voir Profil
              </NavLink>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="col py-3 px-4">
          <nav className="navbar navbar-light bg-white shadow-sm rounded mb-4 justify-content-end">
            <span className="me-3 fw-semibold text-secondary">
              Bonjour, {user?.name?.split(" ")[0] || "Utilisateur"}
            </span>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline-danger btn-sm"
              disabled={loading}
            >
              {loading ? "Déconnexion..." : "Déconnexion"}
            </button>
          </nav>

          <main>
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-light text-center text-muted py-3 mt-4 border-top small">
            © {new Date().getFullYear()} Bibliothèque App — Tous droits réservés.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;