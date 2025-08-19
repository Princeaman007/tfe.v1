
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmResetPasswordSchema } from "../schemas/userSchema";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from '../../config.js';;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm({
    resolver: zodResolver(confirmResetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmNewPassword: ""
    }
  });

  // Observer le mot de passe pour afficher des conseils en temps réel
  const watchedPassword = watch("newPassword");

  // Vérifier la force du mot de passe
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

  const passwordStrength = getPasswordStrength(watchedPassword);

  // Countdown pour la redirection
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate("/login");
    }
  }, [isSuccess, countdown, navigate]);

  // Vérifier si le token est présent
  useEffect(() => {
    if (!token) {
      setSubmitError("Token de réinitialisation manquant ou invalide");
    }
  }, [token]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      console.log('📤 Envoi requête reset password...');
      console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'undefined');

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/reset-password/${token}`, 
        {
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Succès:', response.data);
      setIsSuccess(true);
      setCountdown(5); // Démarrer le countdown de 5 secondes
      reset(); // Nettoyer le formulaire
      
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      console.error('📋 Réponse serveur:', error.response?.data);
      
      // Gestion d'erreurs détaillée selon votre backend
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || 'Données invalides';
        setSubmitError(errorMsg);
      } else if (error.response?.status === 404) {
        setSubmitError("Token invalide ou expiré. Demandez un nouveau lien de réinitialisation.");
      } else if (error.response?.status === 410) {
        setSubmitError("Ce lien de réinitialisation a expiré. Demandez un nouveau lien.");
      } else {
        setSubmitError("Erreur lors de la réinitialisation. Réessayez plus tard.");
      }
    }
  };

  // Affichage de succès
  if (isSuccess) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow-lg p-4 text-center" style={{ width: "450px" }}>
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }}></i>
          </div>
          <h2 className="text-success mb-3">Mot de passe réinitialisé !</h2>
          <p className="text-muted mb-4">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          
          {countdown > 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Redirection automatique vers la connexion dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}...
            </div>
          ) : null}
          
          <button 
            onClick={() => navigate("/login")}
            className="btn btn-success btn-lg"
          >
            <i className="fas fa-sign-in-alt me-2"></i>
            Se connecter maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "450px" }}>
        <div className="text-center mb-4">
          <i className="fas fa-lock text-primary" style={{ fontSize: "3rem" }}></i>
          <h2 className="text-primary mt-3 mb-1">Nouveau mot de passe</h2>
          <p className="text-muted">Entrez votre nouveau mot de passe sécurisé</p>
        </div>

        {submitError && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {submitError}
          </div>
        )}

        {!token && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Token de réinitialisation manquant. Vérifiez le lien dans votre email.
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="mb-3">
            <label className="form-label">
              Nouveau mot de passe <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.newPassword ? 'is-invalid' : watchedPassword && !errors.newPassword ? 'is-valid' : ''}`}
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
            {watchedPassword && (
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
              Confirmer le mot de passe <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
              placeholder="Confirmez votre nouveau mot de passe"
              {...register("confirmNewPassword")}
              disabled={isSubmitting}
            />
            {errors.confirmNewPassword && (
              <div className="invalid-feedback">
                {errors.confirmNewPassword.message}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg" 
            disabled={isSubmitting || !isValid || !token}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Réinitialisation en cours...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Réinitialiser le mot de passe
              </>
            )}
          </button>
        </form>

        {/* Actions supplémentaires */}
        <div className="text-center mt-4">
          <div className="border-top pt-3">
            <p className="text-muted small mb-2">Vous vous souvenez de votre mot de passe ?</p>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
            >
              <i className="fas fa-arrow-left me-1"></i>
              Retour à la connexion
            </button>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-4">
          <div className="alert alert-light border">
            <h6 className="mb-2">
              <i className="fas fa-shield-alt text-primary me-2"></i>
              Conseils de sécurité
            </h6>
            <ul className="mb-0 small text-muted">
              <li>Utilisez un mot de passe unique pour ce compte</li>
              <li>Évitez d'utiliser des informations personnelles</li>
              <li>Conservez votre mot de passe en lieu sûr</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;