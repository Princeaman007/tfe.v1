
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRegisterSchema } from "../schemas/userSchema";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from '../config.js';

const Register = () => {
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
    resolver: zodResolver(userRegisterSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: ""
    }
  });

  // Observer le mot de passe pour afficher la force
  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");

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

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      console.log('📤 Envoi inscription...');
      
      // Préparer les données - retirer confirmPassword pour l'envoi
      const { confirmPassword, ...requestData } = data;
      
      // Nettoyer et formater les données
      const cleanedData = {
        name: requestData.name.trim(),
        email: requestData.email.toLowerCase().trim(),
        password: requestData.password,
        confirmPassword: data.confirmPassword // Requis par le backend pour validation
      };

      // Ajouter le téléphone seulement s'il est renseigné
      if (requestData.phoneNumber && requestData.phoneNumber.trim()) {
        cleanedData.phoneNumber = requestData.phoneNumber.trim();
      }

      console.log('📋 Données envoyées:', { 
        ...cleanedData, 
        password: '***', 
        confirmPassword: '***' 
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        cleanedData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Inscription réussie:', response.data);
      setIsSuccess(true);
      setCountdown(5); // Démarrer le countdown de 5 secondes
      reset(); // Nettoyer le formulaire
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      console.error('📋 Réponse serveur:', error.response?.data);
      
      // Gestion d'erreurs de validation express-validator
      if (error.response?.data?.errors) {
        // Erreurs de validation du backend
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        setSubmitError(errorMessages);
      } else if (error.response?.status === 409) {
        setSubmitError("Un compte avec cet email existe déjà.");
      } else {
        setSubmitError(
          error.response?.data?.message || 
          "Erreur lors de l'inscription. Veuillez réessayer."
        );
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
          <h2 className="text-success mb-3">Inscription réussie !</h2>
          <p className="text-muted mb-4">
            Votre compte a été créé avec succès. Vérifiez votre boîte email pour confirmer votre adresse et activer votre compte.
          </p>
          
          <div className="alert alert-info">
            <i className="fas fa-envelope me-2"></i>
            <strong>Vérification requise :</strong> Un email de confirmation vous a été envoyé.
          </div>
          
          {countdown > 0 ? (
            <div className="alert alert-light">
              <i className="fas fa-clock me-2"></i>
              Redirection vers la connexion dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}...
            </div>
          ) : null}
          
          <button 
            onClick={() => navigate("/login")}
            className="btn btn-success btn-lg"
          >
            <i className="fas fa-sign-in-alt me-2"></i>
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "500px" }}>
        <div className="text-center mb-4">
          <i className="fas fa-user-plus text-success" style={{ fontSize: "3rem" }}></i>
          <h2 className="text-success mt-3 mb-1">Inscription</h2>
          <p className="text-muted">Créez votre compte pour accéder à la bibliothèque</p>
        </div>

        {submitError && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Nom et Téléphone */}
          <div className="row">
            <div className="col-md-7 mb-3">
              <label className="form-label">
                Nom complet <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Jean Dupont"
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <div className="invalid-feedback">
                  {errors.name.message}
                </div>
              )}
            </div>
            <div className="col-md-5 mb-3">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                placeholder="+33 1 23 45 67 89"
                {...register("phoneNumber")}
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback">
                  {errors.phoneNumber.message}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">
              Adresse email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="votre@email.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="invalid-feedback">
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Mot de passe */}
          <div className="mb-3">
            <label className="form-label">
              Mot de passe <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : watchedPassword && !errors.password ? 'is-valid' : ''}`}
              placeholder="Minimum 6 caractères"
              {...register("password")}
              disabled={isSubmitting}
            />
            {errors.password && (
              <div className="invalid-feedback">
                {errors.password.message}
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
              Doit contenir: une minuscule, une majuscule et un chiffre
            </small>
          </div>

          {/* Confirmation du mot de passe */}
          <div className="mb-4">
            <label className="form-label">
              Confirmer le mot de passe <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : watchedConfirmPassword && watchedPassword && watchedConfirmPassword === watchedPassword ? 'is-valid' : ''}`}
              placeholder="Répétez votre mot de passe"
              {...register("confirmPassword")}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">
                {errors.confirmPassword.message}
              </div>
            )}
            
            {/* Indicateur de correspondance */}
            {watchedConfirmPassword && watchedPassword && (
              <small className={`form-text ${watchedConfirmPassword === watchedPassword ? 'text-success' : 'text-danger'}`}>
                <i className={`fas ${watchedConfirmPassword === watchedPassword ? 'fa-check' : 'fa-times'} me-1`}></i>
                {watchedConfirmPassword === watchedPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-success w-100 btn-lg" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Inscription en cours...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>
                S'inscrire
              </>
            )}
          </button>
        </form>

        {/* Liens de navigation */}
        <div className="text-center mt-4">
          <div className="border-top pt-3">
            <p className="mb-2">
              Déjà un compte ? 
              <Link to="/login" className="text-success ms-2 fw-bold">
                <i className="fas fa-sign-in-alt me-1"></i>
                Se connecter
              </Link>
            </p>
            <p className="small text-muted mb-0">
              Mot de passe oublié ? 
              <Link to="/forgot-password" className="text-muted ms-1">
                Réinitialiser
              </Link>
            </p>
          </div>
        </div>

        {/* Conditions d'utilisation */}
        <div className="mt-4">
          <div className="alert alert-light border small">
            <i className="fas fa-info-circle text-primary me-2"></i>
            En vous inscrivant, vous acceptez nos 
            <a href="/terms" className="text-primary ms-1">conditions d'utilisation</a> et notre 
            <a href="/privacy" className="text-primary ms-1">politique de confidentialité</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;