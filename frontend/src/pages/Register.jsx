import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Vérification email format valide
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Veuillez entrer un email valide.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", { name, email, password });

      setSuccess(response.data.message || "Inscription réussie ! Vérifiez votre email.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Erreur d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center text-success mb-3">📝 Inscription</h2>

        {/* ✅ Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* ✅ Message de succès */}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input
              type="text"
              className={`form-control ${error && !name ? "is-invalid" : ""}`}
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${error && !validateEmail(email) ? "is-invalid" : ""}`}
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && !validateEmail(email) && <div className="invalid-feedback">Format d'email invalide.</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className={`form-control ${error && password.length < 6 ? "is-invalid" : ""}`}
              placeholder="Votre mot de passe (6 caractères minimum)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && password.length < 6 && <div className="invalid-feedback">Mot de passe trop court.</div>}
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading || !name || !email || !password}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>
            Déjà un compte ? <Link to="/login" className="text-success">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
