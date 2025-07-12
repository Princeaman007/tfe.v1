import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #f0f4ff, #e0e7ff)",
        padding: "40px",
      }}
    >
      <div className="text-center">
        <div className="mb-4">
          <i className="fas fa-book-open fa-4x text-primary"></i>
        </div>
        <h1 className="fw-bold text-dark mb-3">
          Bienvenue à la Bibliothèque 
        </h1>
        <p className="text-secondary fs-5">
          Explorez des milliers de livres, louez vos préférés, et cultivez votre curiosité.
        </p>

        <div className="mt-4">
          <Link
            to="/login"
            className="btn btn-primary btn-lg px-5 me-3 shadow-sm"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="btn btn-outline-primary btn-lg px-5 shadow-sm"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
