import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container, Row, Col, Image, Button, Spinner, Alert, Badge, Form
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const BookDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rentDate, setRentDate] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [id]);

  const fetchBook = async () => {
    try {
      console.log("📦 ID reçu depuis l'URL :", id);
      const res = await axios.get(`http://localhost:5000/api/books/${id}`);
      console.log("✅ Réponse backend :", res.data);
      setBook(res.data);
    } catch (err) {
      console.error("❌ Erreur fetchBook :", err.message);
      setError("Impossible de charger ce livre.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Erreur en récupérant les avis :", err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return alert("Connectez-vous pour liker.");
    try {
      await axios.post(`http://localhost:5000/api/books/${id}/like`, {}, { withCredentials: true });
      fetchBook();
    } catch (err) {
      console.error("Erreur de like :", err);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      alert("Connectez-vous pour ajouter aux favoris.");
      return;
    }

    setIsFavorited((prev) => !prev);

    // Optionnel : ici tu peux appeler le backend pour enregistrer le favori
    // await axios.post("/api/favorites", { bookId: book._id }, { withCredentials: true });
  };

  const handleRent = async () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour louer.");
      return;
    }
  
    if (!book?._id) {
      alert("Le livre n'est pas encore chargé.");
      return;
    }
  
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/create-checkout-session",
        { bookId: book._id },
        { withCredentials: true }
      );
  
      const sessionId = res.data.id;
  
      if (!sessionId) {
        console.error("❌ ID de session manquant dans la réponse backend.");
        alert("Erreur : ID de session Stripe manquant.");
        return;
      }
  
      console.log("📦 Session ID reçu côté frontend :", sessionId);
  
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
  
    } catch (err) {
      console.error("❌ Erreur lors de la création de la session Stripe :", err);
      alert("Erreur lors du paiement. Veuillez réessayer.");
    }
  };
  

  const handleSubmitComment = async () => {
    if (!isAuthenticated) return alert("Connectez-vous pour commenter.");
    if (!commentInput.trim()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          bookId: id,
          rating,
          comment: commentInput,
        },
        { withCredentials: true }
      );

      setCommentInput("");
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du commentaire :", error.response?.data || error.message);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !book) {
    return <Alert variant="danger">{error || "Livre introuvable."}</Alert>;
  }

  return (
    <Container className="py-5">
      <Row className="g-5">
        <Col md={4}>
          <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 0 15px rgba(0,0,0,0.08)", background: "#fff" }}>
            <Image
              src={book.coverImage || "https://via.placeholder.com/300x450"}
              alt={book.title}
              fluid
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
          </div>
        </Col>

        <Col md={8}>
          <h1 className="fw-bold mb-2" style={{ fontSize: "2.2rem" }}>{book.title}</h1>
          <h5 className="text-muted mb-3">par {book.author}</h5>

          <div className="mb-3 d-flex align-items-center gap-3">
            <Badge bg="dark" className="text-uppercase">{book.genre}</Badge>
            <Badge bg="secondary">{book.publishedYear || "Année inconnue"}</Badge>
            {averageRating && <Badge bg="warning" text="dark">⭐ {averageRating}/5</Badge>}
          </div>

          <p className="lead mb-4" style={{ lineHeight: "1.8", color: "#333" }}>
            {book.description || "Aucune description disponible pour ce livre."}
          </p>

          <div className="d-flex flex-wrap gap-3 mt-3">
            <Button variant="primary" size="lg" onClick={handleRent}>
              📖 Louer maintenant
            </Button>
            <Button variant={isFavorited ? "danger" : "outline-danger"} size="lg" onClick={handleFavorite}>
              {isFavorited ? "❤️ Supprimer des favoris" : "🤍 Ajouter aux favoris"}
            </Button>
            <Button variant="outline-secondary" size="lg" onClick={handleLike}>
              👍 {book.likes?.length || 0}
            </Button>
          </div>

          {rentDate && (
            <p className="mt-4 alert alert-info">
              📅 Retour prévu le <strong>{rentDate}</strong>
            </p>
          )}
        </Col>
      </Row>

      {/* Avis lecteurs */}
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4 border-bottom pb-2">💬 Avis des lecteurs</h3>

          {isAuthenticated && (
            <Form className="mb-5">
              <Form.Group className="mb-3">
                <Form.Label>Note :</Form.Label>
                <Form.Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((val) => (
                    <option key={val} value={val}>{val} étoile{val > 1 ? "s" : ""}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Commentaire :</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Laissez un commentaire..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
              </Form.Group>
              <Button onClick={handleSubmitComment}>Commenter</Button>
            </Form>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted fst-italic">Aucun avis pour ce livre pour l’instant.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="d-flex gap-3 mb-4 align-items-start">
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                  style={{ width: "50px", height: "50px", fontWeight: "bold", fontSize: "1rem" }}
                >
                  {getInitials(review.user?.name)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong>{review.user?.name || "Utilisateur"}</strong>
                    <span className="text-warning fw-bold">{review.rating} ★</span>
                  </div>
                  <p className="text-muted mb-1">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookDetails;
