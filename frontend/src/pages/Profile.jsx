import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fonction pour générer les initiales (ex: "John Doe" → "JD")
  const getInitials = (name) => {
    if (!name) return "U"; // Si pas de nom, afficher "U" pour "User"
    const nameParts = name.split(" ");
    return nameParts.map(part => part[0].toUpperCase()).join("").slice(0, 2);
  };

  // ✅ Fonction pour gérer la modification du mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validation côté client
    if (newPassword !== confirmPassword) {
      setMessage("❌ Les nouveaux mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ Le nouveau mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    // Validation du format du mot de passe (selon vos règles serveur)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setMessage("❌ Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.");
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Structure de données correspondant à la validation serveur
      const requestData = {
        currentPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword  // ⚠️ Ce champ était manquant !
      };

      console.log("Données envoyées:", requestData); // Pour debug

      const response = await axios.put(
        "http://localhost:5000/api/users/change-password",
        requestData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage("✅ Mot de passe mis à jour avec succès !");
      
      // Réinitialiser les champs
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error.response?.data);
      
      // Gestion d'erreurs plus détaillée
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || error.response.data?.error;
        setMessage(`❌ ${errorMsg || "Données invalides. Vérifiez vos informations."}`);
      } else if (error.response?.status === 401) {
        setMessage("❌ Ancien mot de passe incorrect.");
      } else if (error.response?.status === 403) {
        setMessage("❌ Non autorisé. Reconnectez-vous.");
      } else {
        setMessage("❌ Erreur serveur. Réessayez plus tard.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card p-4 border-0" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="text-center">👤 Mon Profil</h2>

        {/* ✅ Affichage des initiales dans un cercle stylé */}
        <div 
          className="d-flex justify-content-center align-items-center rounded-circle mx-auto mt-3"
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "30px",
            fontWeight: "bold",
            textTransform: "uppercase",
            border: "2px solid #0056b3"
          }}
        >
          {getInitials(user?.name)}
        </div>

        {/* ✅ Informations utilisateur */}
        <div className="text-center mt-3">
          <h4 className="fw-bold">{user?.name}</h4>
          <p className="text-muted">{user?.email}</p>
        </div>

        {/* ✅ Formulaire de modification du mot de passe */}
        <h4 className="mt-4">Modifier mon mot de passe</h4>
        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label">Ancien mot de passe</label>
            <input 
              type="password" 
              className="form-control border-0 border-bottom rounded-0" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nouveau mot de passe</label>
            <small className="form-text text-muted">
              Doit contenir au moins 6 caractères avec une minuscule, une majuscule et un chiffre
            </small>
            <input 
              type="password" 
              className="form-control border-0 border-bottom rounded-0" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              minLength="6"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirmer le mot de passe</label>
            <input 
              type="password" 
              className="form-control border-0 border-bottom rounded-0" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Mise à jour...
              </>
            ) : (
              "Mettre à jour"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;