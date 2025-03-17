import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">📚 Bibliothèque</h1>
      <div>
        <Link to="/" className="mr-4">Accueil</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="mr-4">Tableau de Bord</Link>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
