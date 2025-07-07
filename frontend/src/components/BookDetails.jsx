// frontend/src/components/BookDetails.jsx - Version améliorée
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Container, Row, Col, Image, Button, Spinner, Alert, Badge, Form, Modal
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

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
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [rating, setRating] = useState(5);
  const [showRentModal, setShowRentModal] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchReviews();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, isAuthenticated]);

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

  const checkFavoriteStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/favorites/check/${id}`, {
        withCredentials: true
      });
      setIsFavorited(res.data.isFavorite);
    } catch (err) {
      console.error("Erreur lors de la vérification du statut favori:", err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour liker ce livre");
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/api/books/${id}/like`, {}, { withCredentials: true });
      fetchBook();
      toast.success("Like mis à jour!");
    } catch (err) {
      console.error("Erreur de like :", err);
      toast.error("Erreur lors du like");
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }

    setFavoriteLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/favorites/toggle", 
        { bookId: book._id }, 
        { withCredentials: true }
      );
      
      setIsFavorited(res.data.isFavorite);
      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Erreur de favori :", err);
      toast.error("Erreur lors de la mise à jour des favoris");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRent = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour louer");
      return;
    }
  
    if (!book?._id) {
      toast.error("Le livre n'est pas encore chargé");
      return;
    }

    if (!book.price || book.price <= 0) {
      toast.error("Ce livre n'est pas disponible à la location");
      return;
    }
  
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/create-checkout-session",
        { bookId: book._id },
        { withCredentials: true }
      );
  
      const { url } = res.data;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Erreur lors de la création de la session de paiement");
      }
  
    } catch (err) {
      console.error("❌ Erreur lors de la création de la session Stripe :", err);
      toast.error(err.response?.data?.message || "Erreur lors du paiement. Veuillez réessayer.");
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour commenter");
      return;
    }
    
    if (!commentInput.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }

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
      toast.success("Avis ajouté avec succès!");
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du commentaire :", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de l'avis");
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
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du livre...</p>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Livre introuvable."}</Alert>
        <Link to="/dashboard" className="btn btn-primary">
          Retour à la bibliothèque
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard" className="text-decoration-none">Bibliothèque</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

      <Row className="g-5">
        <Col md={4}>
          <div className="position-relative">
            <div style={{ 
              borderRadius: "12px", 
              overflow: "hidden", 
              boxShadow: "0 0 20px rgba(0,0,0,0.1)", 
              background: "#fff" 
            }}>
              <Image
                src={book.coverImage || "https://via.placeholder.com/300x450"}
                alt={book.title}
                fluid
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
            
            {/* Badge de disponibilité */}
            <div className="position-absolute top-0 start-0 m-3">
              <Badge bg={book.availableCopies > 0 ? "success" : "danger"}>
                {book.availableCopies > 0 ? "Disponible" : "Non disponible"}
              </Badge>
            </div>
          </div>
        </Col>

        <Col md={8}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="fw-bold mb-2" style={{ fontSize: "2.5rem" }}>
                {book.title}
              </h1>
              <h4 className="text-muted mb-3">par {book.author}</h4>
            </div>
            
            {/* Prix */}
            <div className="text-end">
              <div className="display-6 fw-bold text-success">
                {typeof book.price === "number" 
                  ? `${book.price.toFixed(2)}€` 
                  : "Prix non défini"
                }
              </div>
              <small className="text-muted">Prix de location</small>
            </div>
          </div>

          <div className="mb-4 d-flex align-items-center gap-3 flex-wrap">
            <Badge bg="dark" className="text-uppercase px-3 py-2">
              {book.genre}
            </Badge>
            <Badge bg="secondary" className="px-3 py-2">
              {book.publishedYear || "Année inconnue"}
            </Badge>
            {averageRating && (
              <Badge bg="warning" text="dark" className="px-3 py-2">
                ⭐ {averageRating}/5 ({reviews.length} avis)
              </Badge>
            )}
            <Badge bg="info" className="px-3 py-2">
              {book.availableCopies} exemplaire(s) disponible(s)
            </Badge>
          </div>

          <p className="lead mb-4" style={{ lineHeight: "1.8", color: "#333" }}>
            {book.description || "Aucune description disponible pour ce livre."}
          </p>

          {/* Boutons d'action */}
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowRentModal(true)}
              disabled={!book.price || book.availableCopies === 0}
              className="px-4 py-3"
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Louer maintenant
            </Button>
            
            <Button 
              variant={isFavorited ? "danger" : "outline-danger"} 
              size="lg"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className="px-4 py-3"
            >
              {favoriteLoading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : (
                <>
                  <i className={`fas fa-heart me-2`}></i>
                  {isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              size="lg" 
              onClick={handleLike}
              className="px-4 py-3"
            >
              <i className="fas fa-thumbs-up me-2"></i>
              {book.likes?.length || 0}
            </Button>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">
              <i className="fas fa-info-circle me-2 text-primary"></i>
              Informations de location
            </h6>
            <ul className="mb-0 list-unstyled">
              <li className="mb-1">
                <i className="fas fa-calendar me-2 text-muted"></i>
                Durée de location : 30 jours
              </li>
              <li className="mb-1">
                <i className="fas fa-euro-sign me-2 text-muted"></i>
                Amende en cas de retard : 1,50€ par jour
              </li>
              <li>
                <i className="fas fa-undo me-2 text-muted"></i>
                Retour possible depuis votre espace personnel
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      {/* Section des avis */}
      <Row className="mt-5">
        <Col>
          <div className="border-top pt-5">
            <h3 className="mb-4">
              <i className="fas fa-comments me-2 text-primary"></i>
              Avis des lecteurs
              {reviews.length > 0 && (
                <Badge bg="secondary" className="ms-2">{reviews.length}</Badge>
              )}
            </h3>

            {/* Formulaire d'ajout d'avis */}
            {isAuthenticated && (
              <div className="card p-4 mb-4 bg-light border-0">
                <h5 className="mb-3">Laissez votre avis</h5>
                <Form>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Note :</Form.Label>
                        <Form.Select 
                          value={rating} 
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((val) => (
                            <option key={val} value={val}>
                              {val} étoile{val > 1 ? "s" : ""} {"⭐".repeat(val)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={9}>
                      <Form.Group className="mb-3">
                        <Form.Label>Commentaire :</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Partagez votre opinion sur ce livre..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button 
                    onClick={handleSubmitComment}
                    variant="primary"
                    disabled={!commentInput.trim()}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Publier mon avis
                  </Button>
                </Form>
              </div>
            )}

            {/* Liste des avis */}
            {reviews.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-comment-slash text-muted mb-3" style={{ fontSize: "3rem" }}></i>
                <h5 className="text-muted">Aucun avis pour ce livre</h5>
                <p className="text-muted">Soyez le premier à donner votre opinion !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center flex-shrink-0"
                          style={{ width: "50px", height: "50px", fontWeight: "bold", fontSize: "1rem" }}
                        >
                          {getInitials(review.user?.name)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0 fw-bold">{review.user?.name || "Utilisateur"}</h6>
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                              </small>
                            </div>
                            <div className="text-warning fw-bold">
                              {"⭐".repeat(review.rating)}
                              <span className="text-muted ms-1">({review.rating}/5)</span>
                            </div>
                          </div>
                          <p className="mb-0 text-muted">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal de confirmation de location */}
      <Modal show={showRentModal} onHide={() => setShowRentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-shopping-cart me-2 text-success"></i>
            Confirmer la location
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center gap-3 mb-3">
            <img
              src={book.coverImage || "https://via.placeholder.com/60x90"}
              alt={book.title}
              style={{ width: "60px", height: "90px", objectFit: "cover" }}
              className="rounded"
            />
            <div>
              <h6 className="mb-1">{book.title}</h6>
              <p className="text-muted mb-0">{book.author}</p>
            </div>
          </div>
          
          <div className="bg-light p-3 rounded mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Prix de location :</span>
              <span className="fw-bold">{book.price?.toFixed(2)}€</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Durée :</span>
              <span>30 jours</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total :</span>
              <span className="text-success">{book.price?.toFixed(2)}€</span>
            </div>
          </div>

          <Alert variant="info" className="mb-0">
            <i className="fas fa-info-circle me-2"></i>
            Vous allez être redirigé vers Stripe pour effectuer le paiement sécurisé.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRentModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleRent}>
            <i className="fas fa-credit-card me-2"></i>
            Procéder au paiement
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookDetails;