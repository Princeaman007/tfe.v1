// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, resetPasswordSchema } from "../schemas/userSchema";
import { useAuth } from "../context/AuthContext";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // États pour le modal de réinitialisation
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  // Form principal de connexion
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError
  } = useForm({
    resolver: zodResolver(userLoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Form de réinitialisation de mot de passe
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    reset: resetForm,
    formState: { errors: resetErrors, isSubmitting: isResettingPassword }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: ""
    }
  });

  // Gérer les messages de redirection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message');
    const type = searchParams.get('type');
    
    if (message) {
      if (type === 'success') {
        // Afficher un message de succès (ex: après inscription)
        console.log("Message de succès:", message);
      } else if (type === 'error') {
        setFormError('root', { message: decodeURIComponent(message) });
      }
    }
  }, [location, setFormError]);

  // Reset modal states when closing
  useEffect(() => {
    if (!showResetModal) {
      setResetSuccess(false);
      setResetError("");
      resetForm();
    }
  }, [showResetModal, resetForm]);

  const onLoginSubmit = async (data) => {
    try {
      console.log("🔐 Tentative de connexion...");
      
      await login(data);
      
      // Redirection après connexion réussie
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      
      let errorMessage = "Erreur de connexion. Veuillez réessayer.";
      
      if (error.response?.status === 401) {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.response?.status === 403) {
        errorMessage = "Compte non vérifié. Vérifiez vos emails.";
      } else if (error.response?.status === 423) {
        errorMessage = "Compte temporairement verrouillé. Réessayez plus tard.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setFormError('root', { message: errorMessage });
    }
  };

  const onResetSubmit = async (data) => {
    try {
      setResetError("");
      
      console.log("📧 Demande de réinitialisation pour:", data.email);
      
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password", 
        data,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log("✅ Email de réinitialisation envoyé:", response.data);
      setResetSuccess(true);
      
    } catch (error) {
      console.error("❌ Erreur réinitialisation:", error);
      
      if (error.response?.status === 404) {
        setResetError("Aucun compte associé à cette adresse email.");
      } else if (error.response?.status === 429) {
        setResetError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setResetError(
          error.response?.data?.message || 
          "Erreur lors de l'envoi de l'email. Réessayez plus tard."
        );
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "450px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <i className="fas fa-book text-primary" style={{ fontSize: "3rem" }}></i>
          <h2 className="text-primary mt-3 mb-1">Connexion</h2>
          <p className="text-muted">Accédez à votre bibliothèque personnelle</p>
        </div>

        {/* Messages d'erreur globaux */}
        {errors.root && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {errors.root.message}
          </Alert>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit(onLoginSubmit)}>
          <div className="mb-3">
            <label className="form-label">
              Adresse email <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-envelope"></i>
              </span>
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
          </div>

          <div className="mb-4">
            <label className="form-label">
              Mot de passe <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Votre mot de passe"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Connexion en cours...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Actions supplémentaires */}
        <div className="text-center mt-4">
          <div className="border-top pt-3">
            <button
              className="btn btn-link text-muted p-0 mb-2"
              onClick={() => setShowResetModal(true)}
              disabled={isSubmitting}
            >
              <i className="fas fa-key me-1"></i>
              Mot de passe oublié ?
            </button>
            
            <p className="mb-0">
              Pas encore de compte ? 
              <Link to="/register" className="text-primary ms-2 fw-bold">
                <i className="fas fa-user-plus me-1"></i>
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-4">
          <div className="alert alert-light border small">
            <i className="fas fa-shield-alt text-primary me-2"></i>
            Votre connexion est sécurisée et vos données sont protégées.
          </div>
        </div>
      </div>

      {/* Modal de réinitialisation de mot de passe */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-key me-2 text-primary"></i>
            Réinitialiser le mot de passe
          </Modal.Title>
        </Modal.Header>
        
        <form onSubmit={handleSubmitReset(onResetSubmit)}>
          <Modal.Body>
            {resetSuccess ? (
              <Alert variant="success">
                <i className="fas fa-check-circle me-2"></i>
                <strong>Email envoyé !</strong> Vérifiez votre boîte de réception pour les instructions de réinitialisation.
                <div className="mt-2 small">
                  Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
                </div>
              </Alert>
            ) : (
              <>
                {resetError && (
                  <Alert variant="danger" className="mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {resetError}
                  </Alert>
                )}

                <p className="text-muted mb-3">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                <div className="mb-3">
                  <label className="form-label">
                    Adresse email <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${resetErrors.email ? 'is-invalid' : ''}`}
                      placeholder="votre@email.com"
                      {...registerReset("email")}
                      disabled={isResettingPassword}
                    />
                    {resetErrors.email && (
                      <div className="invalid-feedback">
                        {resetErrors.email.message}
                      </div>
                    )}
                  </div>
                  <small className="text-muted">
                    Nous vous enverrons un lien de réinitialisation sécurisé
                  </small>
                </div>
              </>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            {resetSuccess ? (
              <Button variant="primary" onClick={() => setShowResetModal(false)}>
                <i className="fas fa-check me-2"></i>
                Fermer
              </Button>
            ) : (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowResetModal(false)}
                  disabled={isResettingPassword}
                >
                  <i className="fas fa-times me-2"></i>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Envoyer le lien
                    </>
                  )}
                </Button>
              </>
            )}
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Login;