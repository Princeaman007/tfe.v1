import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="text-primary fw-bold mb-4">Bienvenue dans la Bibliothèque 📚</h1>
      <p className="text-muted">Découvrez un monde de connaissances et d’aventures littéraires.</p>
      
      <div className="mt-4">
        <Link to="/login" className="btn btn-primary px-4 py-2 me-2">
          Se Connecter
        </Link>
        <Link to="/register" className="btn btn-outline-primary px-4 py-2">
          S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default Home;
