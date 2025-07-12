import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isAuthenticated === null) {
    return <h1 className="text-center mt-5">🔄 Chargement...</h1>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* ✅ Sidebar */}
        <div className={`col-auto ${collapsed ? "col-md-1" : "col-md-3"} col-xl-2 px-sm-2 px-0 bg-dark text-white min-vh-100 d-flex flex-column shadow`}>



          {/* Header */}
          <div className="text-center mt-3 mb-4">
            <h4 className="fw-bold d-none d-md-block">Bibliothèque</h4>
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

            {user?.role === "admin" || user?.role === "superAdmin" ? (
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
            ) : null}

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

          {/* ✅ Profil utilisateur */}
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

        {/* ✅ Main content */}
        <div className="col py-3 px-4">
          <nav className="navbar navbar-light bg-white shadow-sm rounded mb-4 justify-content-end">
            <span className="me-3 fw-semibold text-secondary">
              Bonjour, {user?.name?.split(" ")[0] || "Utilisateur"}
            </span>
            <button onClick={logout} className="btn btn-outline-danger btn-sm">Déconnexion</button>
          </nav>

          <Outlet />
          {/* ✅ Footer */}
          <footer className="bg-light text-center text-muted py-3 mt-4 border-top small">
            © {new Date().getFullYear()} Bibliothèque App — Tous droits réservés.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;