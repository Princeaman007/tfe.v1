import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Spinner, Alert, Button, Card } from "react-bootstrap";
import { API_BASE_URL } from "../../config.js";
import { useAuth } from '../context/AuthContext';

const Success = () => {
  const { getAuthHeaders, isAuthenticated, refreshUser, checkAuthStatus } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("ID de session manquant.");
        setLoading(false);
        return;
      }

      try {
        // 🔑 Vérification côté client d'abord
        if (!checkAuthStatus()) {
          throw new Error("Token d'authentification expiré ou manquant");
        }
        
        console.log("🔍 Vérification de l'authentification avant la requête...");
        
        // Actualisez les données utilisateur pour s'assurer que le token est valide
        const tokenValid = await refreshUser();
        if (!tokenValid) {
          throw new Error("Échec de la validation du token");
        }
        
        const headers = getAuthHeaders();
        console.log("🔑 Headers d'auth:", headers);
        
        if (!headers.Authorization) {
          throw new Error("Token d'authentification manquant");
        }

        const res = await axios.post(
          `${API_BASE_URL}/api/payment/verify-payment`, 
          { sessionId }, 
          { headers }
        );
        
        console.log("✅ Réponse backend :", res.data);
        setSessionInfo(res.data.rental);
        
      } catch (err) {
        console.error("❌ Erreur de vérification :", err);
        
        // Gestion spécifique des erreurs d'authentification
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("🚨 Erreur d'authentification détectée");
          setError("Votre session a expiré. Vous allez être redirigé vers la page de connexion.");
          setTimeout(() => {
            navigate("/login", { 
              state: { from: { pathname: "/dashboard" } },
              replace: true 
            });
          }, 3000);
        } else if (err.message === "Token d'authentification expiré ou manquant" || 
                   err.message === "Échec de la validation du token") {
          setError("Votre session a expiré pendant le processus de paiement. Redirection...");
          setTimeout(() => {
            navigate("/login", { 
              state: { 
                from: { pathname: "/dashboard" },
                message: "Session expirée. Veuillez vous reconnecter pour voir vos locations."
              },
              replace: true 
            });
          }, 3000);
        } else {
          setError("Échec de la vérification du paiement. Veuillez réessayer.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, refreshUser, getAuthHeaders, navigate]);

  // Fonction pour gérer le retour au dashboard de manière sécurisée
  const handleReturnToDashboard = async () => {
    try {
      console.log("🔄 Vérification de l'authentification avant redirection...");
      
      // Double vérification avant la navigation
      if (isAuthenticated) {
        // Actualiser les données utilisateur une dernière fois
        await refreshUser();
        navigate("/dashboard");
      } else {
        console.log("⚠️ Utilisateur non authentifié, redirection vers login");
        navigate("/login", { 
          state: { from: { pathname: "/dashboard" } } 
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la navigation :", error);
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Vérification du paiement en cours...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
        {!error.includes("session a expiré") && !error.includes("Session expirée") && (
          <Button 
            variant="outline-primary" 
            onClick={handleReturnToDashboard}
            className="mt-3"
          >
            Retour au tableau de bord
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container className="py-5 text-center">
      <Card className="p-4 shadow-sm">
        <h2 className="text-success mb-3">✅ Paiement Réussi !</h2>
        <p>Merci pour votre location 📚</p>

        <div className="my-3">
          <p><strong>Date de location :</strong> {
            sessionInfo?.borrowedAt
              ? new Date(sessionInfo.borrowedAt).toLocaleDateString()
              : "Non disponible"
          }</p>
          <p><strong>Échéance :</strong> {
            sessionInfo?.dueDate
              ? new Date(sessionInfo.dueDate).toLocaleDateString()
              : "Non disponible"
          }</p>
        </div>

        <Button 
          variant="primary" 
          onClick={handleReturnToDashboard}
        >
          📂 Accéder à mon tableau de bord
        </Button>
      </Card>
    </Container>
  );
};

export default Success;