import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

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

    if (newPassword !== confirmPassword) {
      setMessage("❌ Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/users/change-password",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage("✅ Mot de passe mis à jour avec succès !");
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Erreur lors de la mise à jour.");
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
        {message && <p className="alert alert-info">{message}</p>}
        
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label">Ancien mot de passe</label>
            <input 
              type="password" 
              className="form-control border-0 border-bottom rounded-0" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nouveau mot de passe</label>
            <input 
              type="password" 
              className="form-control border-0 border-bottom rounded-0" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
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
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Mettre à jour</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
