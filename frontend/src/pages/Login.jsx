import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetSuccess("Veuillez entrer un email valide.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email: resetEmail });
      setResetSuccess(response.data.message);
    } catch (error) {
      setResetSuccess(error.response?.data?.message || "Erreur lors de l'envoi du mail.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center text-primary mb-3">🔑 Connexion</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Connexion..." : "Se Connecter"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>
            <button
              className="btn btn-link"
              data-bs-toggle="modal"
              data-bs-target="#resetPasswordModal"
            >
              Mot de passe oublié ?
            </button>
          </p>
          <p>
            Pas encore de compte ? <Link to="/register" className="text-primary">S'inscrire</Link>
          </p>
        </div>
      </div>

      {/* 🔹 MODAL POUR RÉINITIALISATION DU MOT DE PASSE */}
      <div
        className="modal fade"
        id="resetPasswordModal"
        tabIndex="-1"
        aria-labelledby="resetPasswordModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-primary" id="resetPasswordModalLabel">
                🔐 Réinitialisation du mot de passe
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <p>Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
              <input
                type="email"
                className="form-control"
                placeholder="Votre email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              {resetSuccess && (
                <div className="alert alert-info mt-3" role="alert" aria-live="polite">
                  {resetSuccess}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
              <button type="button" className="btn btn-primary" onClick={handleResetPassword} disabled={!resetEmail}>
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
