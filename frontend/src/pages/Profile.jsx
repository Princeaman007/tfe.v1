
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../schemas/userSchema";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";  

const Profile = () => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }
  });

  // Observer le nouveau mot de passe pour analyser sa force
  const watchedNewPassword = watch("newPassword");
  const watchedConfirmPassword = watch("confirmNewPassword");

  // Analyser la force du mot de passe
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 3) return { score, label: "Faible", color: "danger" };
    if (score < 4) return { score, label: "Moyen", color: "warning" };
    return { score, label: "Fort", color: "success" };
  };

  const passwordStrength = getPasswordStrength(watchedNewPassword);

  // Fonction pour générer les initiales
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    return nameParts.map(part => part[0].toUpperCase()).join("").slice(0, 2);
  };

  // Fonction pour obtenir la couleur de l'avatar selon le rôle
  const getAvatarColor = (role) => {
    switch (role) {
      case 'superAdmin': return { bg: '#dc3545', border: '#b02a37' }; // Rouge
      case 'admin': return { bg: '#fd7e14', border: '#fd6300' }; // Orange
      default: return { bg: '#007bff', border: '#0056b3' }; // Bleu
    }
  };

  const avatarColors = getAvatarColor(user?.role);

  // Fonction pour formater la date de dernière connexion
  const formatLastLogin = (date) => {
    if (!date) return "Jamais";
    const lastLogin = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    return lastLogin.toLocaleDateString('fr-FR');
  };

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      setIsSuccess(false);
      
      console.log("Changement de mot de passe...");

      const response = await axios.put(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Mot de passe modifié:", response.data);
      setIsSuccess(true);
      reset(); // Nettoyer le formulaire
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => setIsSuccess(false), 5000);
      
    } catch (error) {
      console.error("❌ Erreur changement mot de passe:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      // Gestion d'erreurs selon votre backend
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || error.response.data?.error;
        setSubmitError(errorMsg || "Données invalides. Vérifiez vos informations.");
      } else if (error.response?.status === 401) {
        setSubmitError("Ancien mot de passe incorrect.");
      } else if (error.response?.status === 403) {
        setSubmitError("Non autorisé. Reconnectez-vous.");
      } else {
        setSubmitError("Erreur serveur. Réessayez plus tard.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="row">
            {/* Carte Profil */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title mb-4">
                    <i className="fas fa-user me-2"></i>
                    Mon Profil
                  </h5>
                  
                  {/* Avatar avec initiales */}
                  <div 
                    className="d-flex justify-content-center align-items-center rounded-circle mx-auto mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: avatarColors.bg,
                      color: "white",
                      fontSize: "28px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      border: `3px solid ${avatarColors.border}`,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>

                  {/* Informations utilisateur */}
                  <h5 className="fw-bold mb-1">{user?.name || "Utilisateur"}</h5>
                  <p className="text-muted small mb-2">{user?.email}</p>
                  
                  {/* Badge de rôle */}
                  <span className={`badge mb-3 ${
                    user?.role === 'superAdmin' ? 'bg-danger' : 
                    user?.role === 'admin' ? 'bg-warning text-dark' : 
                    'bg-primary'
                  }`}>
                    {user?.role === 'superAdmin' ? 'Super Admin' : 
                     user?.role === 'admin' ? 'Administrateur' : 
                     'Utilisateur'}
                  </span>

                  {/* Statut de vérification */}
                  <div className="mb-3">
                    {user?.isVerified ? (
                      <span className="badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Compte vérifié
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Non vérifié
                      </span>
                    )}
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="small text-muted">
                    <div className="d-flex justify-content-between border-bottom py-1">
                      <span>Membre depuis:</span>
                      <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1">
                      <span>Dernière connexion:</span>
                      <span>{formatLastLogin(user?.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire Changement de mot de passe */}
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <i className="fas fa-key me-2"></i>
                    Modifier mon mot de passe
                  </h5>

                  {submitError && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {submitError}
                    </div>
                  )}

                  {isSuccess && (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      Mot de passe mis à jour avec succès !
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="mb-3">
                      <label className="form-label">
                        Mot de passe actuel <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="password" 
                        className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                        placeholder="Entrez votre mot de passe actuel"
                        {...register("currentPassword")}
                        disabled={isSubmitting}
                      />
                      {errors.currentPassword && (
                        <div className="invalid-feedback">
                          {errors.currentPassword.message}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Nouveau mot de passe <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="password" 
                        className={`form-control ${errors.newPassword ? 'is-invalid' : watchedNewPassword && !errors.newPassword ? 'is-valid' : ''}`}
                        placeholder="Entrez votre nouveau mot de passe"
                        {...register("newPassword")}
                        disabled={isSubmitting}
                      />
                      {errors.newPassword && (
                        <div className="invalid-feedback">
                          {errors.newPassword.message}
                        </div>
                      )}
                      
                      {/* Indicateur de force du mot de passe */}
                      {watchedNewPassword && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Force du mot de passe:</small>
                            <span className={`badge bg-${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="progress mt-1" style={{ height: "4px" }}>
                            <div 
                              className={`progress-bar bg-${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <small className="form-text text-muted mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        Minimum 6 caractères avec une minuscule, une majuscule et un chiffre
                      </small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Confirmer le nouveau mot de passe <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="password" 
                        className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : watchedConfirmPassword && watchedNewPassword && watchedConfirmPassword === watchedNewPassword ? 'is-valid' : ''}`}
                        placeholder="Confirmez votre nouveau mot de passe"
                        {...register("confirmNewPassword")}
                        disabled={isSubmitting}
                      />
                      {errors.confirmNewPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmNewPassword.message}
                        </div>
                      )}
                      
                      {/* Indicateur de correspondance */}
                      {watchedConfirmPassword && watchedNewPassword && (
                        <small className={`form-text ${watchedConfirmPassword === watchedNewPassword ? 'text-success' : 'text-danger'}`}>
                          <i className={`fas ${watchedConfirmPassword === watchedNewPassword ? 'fa-check' : 'fa-times'} me-1`}></i>
                          {watchedConfirmPassword === watchedNewPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                        </small>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isSubmitting || !isValid}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Mettre à jour le mot de passe
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Statistiques (si l'utilisateur a des stats) */}
          {user?.stats && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <i className="fas fa-chart-bar me-2"></i>
                      Mes Statistiques
                    </h5>
                    <div className="row text-center">
                      <div className="col-md-4">
                        <div className="p-3">
                          <h3 className="text-primary">{user.stats.totalRentals || 0}</h3>
                          <p className="text-muted mb-0">Emprunts totaux</p>
                        </div>
                      </div>
                      <div className="col-md-4 border-start border-end">
                        <div className="p-3">
                          <h3 className="text-success">{user.stats.currentRentals || 0}</h3>
                          <p className="text-muted mb-0">Emprunts en cours</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3">
                          <h3 className="text-warning">{user.favorites?.length || 0}</h3>
                          <p className="text-muted mb-0">Favoris</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;