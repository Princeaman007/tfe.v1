import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ResetPassword = () => {
  const { token } = useParams(); // ✅ Récupérer le token depuis l'URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // ✅ Nom correct
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // ✅ Validation côté client
    if (newPassword !== confirmNewPassword) {
      setError("❌ Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("❌ Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    // ✅ Validation du format selon vos règles serveur
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setError("❌ Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.");
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Envoi requête reset password...');
      console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'undefined');
      console.log('📋 Données:', { newPassword: '***', confirmNewPassword: '***' });

      // ✅ Utiliser PUT au lieu de POST et envoyer les deux champs
      const response = await axios.put(
        `http://localhost:5000/api/auth/reset-password/${token}`, 
        { 
          newPassword,
          confirmNewPassword  // ✅ Champ requis par la validation serveur
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Succès:', response.data);
      setSuccess(response.data.message);
      
      // ✅ Nettoyer les champs
      setNewPassword("");
      setConfirmNewPassword("");
      
      // ✅ Redirige vers Login après 3s
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      console.error('📋 Réponse serveur:', error.response?.data);
      
      // ✅ Gestion d'erreurs plus détaillée
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || 'Données invalides';
        setError(errorMsg);
      } else if (error.response?.status === 404) {
        setError("❌ Utilisateur non trouvé.");
      } else {
        setError("❌ Erreur lors de la réinitialisation. Réessayez plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "450px" }}>
        <h2 className="text-center text-danger mb-3">🔒 Nouveau mot de passe</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Entrez un nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
            <small className="form-text text-muted">
              Minimum 6 caractères avec une minuscule, une majuscule et un chiffre
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmez le mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirmez le mot de passe"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-danger w-100" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Modification en cours...
              </>
            ) : (
              "Modifier le mot de passe"
            )}
          </button>
        </form>

        {/* ✅ Lien pour retourner au login si nécessaire */}
        <div className="text-center mt-3">
          <button 
            className="btn btn-link text-muted"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;