import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated === null) {
    return <h1 className="text-center mt-5">🔄 Chargement...</h1>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // ✅ Fonction pour générer les initiales du nom
  const getInitials = (name) => {
    if (!name) return "U"; // Si pas de nom, afficher "U" pour "User"
    const nameParts = name.split(" ");
    return nameParts.map(part => part[0].toUpperCase()).join("").slice(0, 2);
  };

  return (
    <div className="d-flex">
      {/* ✅ Sidebar */}
      <nav className="sidebar vh-100 d-flex flex-column p-3 bg-dark text-white">
        <h4 className="fw-bold text-center mb-4">📊 Dashboard</h4>

        <ul className="nav flex-column">
          {/* 📌 Pages accessibles par tous les utilisateurs */}
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link text-white">
              <i className="fas fa-tachometer-alt me-2"></i> Tableau de Bord
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/library" className="nav-link text-white">
              <i className="fas fa-book me-2"></i> Bibliothèque
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/my-rentals" className="nav-link text-white">
              <i className="fas fa-bookmark me-2"></i> Mes Locations
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/my-reviews" className="nav-link text-white">
              <i className="fas fa-comment-alt me-2"></i> Mes Avis
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/favorites" className="nav-link text-white">
              <i className="fas fa-heart me-2"></i> Favoris
            </NavLink>
          </li>

          {/* 📌 Pages Admin */}
          {user?.role === "admin" || user?.role === "superadmin" ? (
            <>
              <li className="nav-item">
                <NavLink to="/add-book" className="nav-link text-white">
                  <i className="fas fa-plus-circle me-2"></i> Ajouter un Livre
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/manage-books" className="nav-link text-white">
                  <i className="fas fa-edit me-2"></i> Gérer les Livres
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/analytics" className="nav-link text-white">
                  <i className="fas fa-chart-bar me-2"></i> Statistiques
                </NavLink>
              </li>
            </>
          ) : null}

          {/* 📌 Pages Super Admin */}
          {user?.role === "superadmin" ? (
            <>
              <li className="nav-item">
                <NavLink to="/manage-users" className="nav-link text-white">
                  <i className="fas fa-users me-2"></i> Gérer les Utilisateurs
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/security-logs" className="nav-link text-white">
                  <i className="fas fa-shield-alt me-2"></i> Logs Sécurité
                </NavLink>
              </li>
            </>
          ) : null}
        </ul>

        {/* ✅ Profil Utilisateur Dynamique (Affichage des initiales BIEN ESPACÉES) */}
        <div className="mt-auto text-center border-top pt-3">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle border border-light mb-3"
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#007bff",
              color: "white",
              fontSize: "28px",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            {getInitials(user?.name)}
          </div>

          <NavLink to="/profile" className="btn btn-outline-light btn-sm w-75">
            Voir Profil
          </NavLink>
        </div>
      </nav>

      {/* ✅ Contenu Principal */}
      <div className="flex-grow-1">
        {/* ✅ Navbar sans photo ni nom */}
        <nav className="navbar navbar-expand-lg bg-white shadow-sm px-3 d-flex justify-content-end">
          <button onClick={logout} className="btn btn-danger btn-sm">Déconnexion</button>
        </nav>

        {/* ✅ Ici le contenu des pages s'affiche */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
