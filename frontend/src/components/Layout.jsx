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
        <div className={`col-auto ${collapsed ? "col-md-1" : "col-md-3"} col-xl-2 px-sm-2 px-0 bg-dark text-white min-vh-100 d-flex flex-column`}>
          
          {/* Toggler */}
          <div className="text-end pt-3 pe-3">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Déplier" : "Réduire"}
            >
              <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mt-3 mb-4">
            <h4 className="fw-bold d-none d-md-block">📊 Dashboard</h4>
          </div>

          <ul className="nav nav-pills flex-column mb-auto px-2">
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link text-white">
                <i className="fas fa-tachometer-alt me-2"></i>
                {!collapsed && "Bibliothèque"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-rentals" className="nav-link text-white">
                <i className="fas fa-bookmark me-2"></i>
                {!collapsed && "Mes Locations"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-reviews" className="nav-link text-white">
                <i className="fas fa-comment-alt me-2"></i>
                {!collapsed && "Mes Avis"}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/favorites" className="nav-link text-white">
                <i className="fas fa-heart me-2"></i>
                {!collapsed && "Favoris"}
              </NavLink>
            </li>

            {user?.role === "admin" || user?.role === "superadmin" ? (
              <>
                <li className="nav-item">
                  <NavLink to="/add-book" className="nav-link text-white">
                    <i className="fas fa-plus-circle me-2"></i>
                    {!collapsed && "Ajouter un Livre"}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/manage-books" className="nav-link text-white">
                    <i className="fas fa-edit me-2"></i>
                    {!collapsed && "Gérer les Livres"}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/analytics" className="nav-link text-white">
                    <i className="fas fa-chart-bar me-2"></i>
                    {!collapsed && "Statistiques"}
                  </NavLink>
                </li>
              </>
            ) : null}

            {user?.role === "superadmin" && (
              <>
                <li className="nav-item">
                  <NavLink to="/manage-users" className="nav-link text-white">
                    <i className="fas fa-users me-2"></i>
                    {!collapsed && "Gérer les Utilisateurs"}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/security-logs" className="nav-link text-white">
                    <i className="fas fa-shield-alt me-2"></i>
                    {!collapsed && "Logs Sécurité"}
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* ✅ Profil utilisateur */}
          <div className="mt-auto text-center border-top pt-3 pb-3 px-2">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle border border-light mb-2"
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
            <button onClick={logout} className="btn btn-danger btn-sm">Déconnexion</button>
          </nav>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
