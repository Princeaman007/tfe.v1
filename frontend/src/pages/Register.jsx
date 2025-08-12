import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ Ajout du champ manquant
  const [phoneNumber, setPhoneNumber] = useState(""); // ✅ Champ optionnel
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Vérification email format valide
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // ✅ Validation du nom selon vos règles serveur
  const validateName = (name) => {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-ZÀ-ÿ\s\-']+$/.test(name);
  };

  // ✅ Validation du mot de passe selon vos règles serveur
  const validatePassword = (password) => {
    return password.length >= 6 && 
           password.length <= 128 && 
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  // ✅ Validation du téléphone (optionnel)
  const validatePhone = (phone) => {
    return !phone || /^[+]?[0-9\s\-\(\)]{10,15}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // ✅ Validations côté client correspondant au serveur
    if (!name.trim()) {
      setError("Le nom est obligatoire.");
      setLoading(false);
      return;
    }

    if (!validateName(name)) {
      setError("Le nom doit contenir entre 2 et 50 caractères et ne peut contenir que des lettres, espaces, tirets et apostrophes.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Veuillez entrer un email valide.");
      setLoading(false);
      return;
    }

    if (email.length > 100) {
      setError("L'email ne peut pas dépasser 100 caractères.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir entre 6 et 128 caractères avec au moins une minuscule, une majuscule et un chiffre.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError("Format de téléphone invalide.");
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Envoi inscription...');
      
      // ✅ Préparer les données selon la validation serveur
      const requestData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        confirmPassword // ✅ Champ requis par la validation serveur
      };

      // ✅ Ajouter le téléphone seulement s'il est renseigné
      if (phoneNumber.trim()) {
        requestData.phoneNumber = phoneNumber.trim();
      }

      console.log('📋 Données envoyées:', { 
        ...requestData, 
        password: '***', 
        confirmPassword: '***' 
      });

      const response = await axios.post(
        "http://localhost:5000/api/auth/register", 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Inscription réussie:', response.data);
      setSuccess(response.data.message || "Inscription réussie ! Vérifiez votre email.");
      
      // ✅ Nettoyer les champs
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      console.error('📋 Réponse serveur:', error.response?.data);
      
      // ✅ Gestion d'erreurs de validation
      if (error.response?.data?.errors) {
        // Erreurs de validation express-validator
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Erreur d'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "450px" }}>
        <h2 className="text-center text-success mb-3">📝 Inscription</h2>

        {/* ✅ Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* ✅ Message de succès */}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nom complet *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <small className="form-text text-muted">
              2-50 caractères, lettres uniquement
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Téléphone (optionnel)</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+33 1 23 45 67 89"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <small className="form-text text-muted">
              Doit contenir au moins une minuscule, une majuscule et un chiffre
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmer le mot de passe *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success w-100" 
            disabled={loading || !name || !email || !password || !confirmPassword}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
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