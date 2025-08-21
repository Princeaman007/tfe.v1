import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Container, Spinner, Alert, Button, Card } from "react-bootstrap";
import { API_BASE_URL } from "../../config.js";
import { useAuth } from '../context/AuthContext';
const Success = () => {
  const { getAuthHeaders } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("ID de session manquant.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/payment/verify-payment`, {
  sessionId,
}, {
  headers: getAuthHeaders()
});
        console.log("✅ Réponse backend :", res.data);
        setSessionInfo(res.data.rental);
      } catch (err) {
        console.error("❌ Erreur de vérification :", err);
        setError("Échec de la vérification du paiement.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

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
        <Link to="/dashboard" className="btn btn-outline-primary mt-3">Retour à la boutique</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5 text-center">
      <Card className="p-4 shadow-sm">
        <h2 className="text-success mb-3">✅ Paiement Réussi !</h2>
        <p>Merci pour votre location 📚</p>

        <div className="my-3">
          <p><strong>ID de session Stripe :</strong> {sessionInfo.stripeSessionId}</p>
          <p><strong>Date de location :</strong> {
            sessionInfo.borrowedAt
              ? new Date(sessionInfo.borrowedAt).toLocaleDateString()
              : "Non disponible"
          }</p>
          <p><strong>Échéance :</strong> {
            sessionInfo.dueDate
              ? new Date(sessionInfo.dueDate).toLocaleDateString()
              : "Non disponible"
          }</p>
        </div>

        <Link to="/dashboard">
          <Button variant="primary">📂 Accéder à mon tableau de bord</Button>
        </Link>
      </Card>
    </Container>
  );
};

export default Success;
