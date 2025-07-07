// frontend/src/pages/Favorites.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour voir vos favoris");
      navigate("/login");
      return;
    }
    
    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/favorites", {
        withCredentials: true,
      });
      console.log("✅ Favoris récupérés:", res.data);
      setFavorites(res.data.favorites);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des favoris:", error);
      
      // Si erreur 401, rediriger vers login
      if (error.response?.status === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/login");
        return;
      }
      
      setError("Impossible de charger vos favoris.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (bookId) => {
    try {
      await axios.post("http://localhost:5000/api/favorites/toggle", 
        { bookId }, 
        { withCredentials: true }
      );
      
      // Retirer le livre de la liste locale
      setFavorites(prevFavorites => 
        prevFavorites.filter(book => book._id !== bookId)
      );
      
      toast.success("Livre retiré des favoris", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du favori");
    }
  };

  const handleRentBook = async (bookId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/create-checkout-session",
        { bookId },
        { withCredentials: true }
      );
      const { url } = res.data;
      window.location.href = url;
    } catch (err) {
      console.error("❌ Erreur lors de la location:", err);
      toast.error("Erreur lors de la création du paiement");
    }
  };

  // Si pas connecté, ne rien afficher (la redirection se fait dans useEffect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3">Chargement de vos favoris...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-danger mb-1">❤️ Mes Favoris</h2>
          <p className="text-muted mb-0">
            {favorites.length} livre{favorites.length !== 1 ? 's' : ''} dans vos favoris
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary">
          <i className="fas fa-arrow-left me-2"></i>
          Retour à la bibliothèque
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-heart-broken text-muted" style={{ fontSize: "4rem" }}></i>
          </div>
          <h4 className="text-muted">Aucun livre dans vos favoris</h4>
          <p className="text-muted mb-4">
            Découvrez notre collection et ajoutez vos livres préférés !
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <i className="fas fa-book me-2"></i>
            Explorer les livres
          </Link>
        </div>
      ) : (
        <Row className="g-4">
          {favorites.map((book) => (
            <Col lg={4} md={6} key={book._id}>
              <Card className="h-100 shadow-sm border-0 position-relative">
                {/* Badge favori */}
                <div className="position-absolute" style={{ top: "10px", right: "10px", zIndex: 2 }}>
                  <Button
                    variant="danger"
                    size="sm"
                    className="rounded-circle p-2"
                    onClick={() => handleRemoveFromFavorites(book._id)}
                    title="Retirer des favoris"
                  >
                    <i className="fas fa-heart"></i>
                  </Button>
                </div>

                <Card.Img
                  variant="top"
                  src={book.coverImage || "https://via.placeholder.com/300x400"}
                  style={{ height: "250px", objectFit: "cover" }}
                />
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate" title={book.title}>
                    {book.title}
                  </Card.Title>
                  
                  <Card.Subtitle className="text-muted mb-2">
                    {book.author}
                  </Card.Subtitle>

                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">{book.genre}</Badge>
                    {book.publishedYear && (
                      <Badge bg="light" text="dark">{book.publishedYear}</Badge>
                    )}
                  </div>

                  {book.description && (
                    <Card.Text className="text-muted small">
                      {book.description.length > 100 
                        ? `${book.description.substring(0, 100)}...` 
                        : book.description
                      }
                    </Card.Text>
                  )}

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="fw-bold text-success">
                        {typeof book.price === "number" 
                          ? `${book.price.toFixed(2)}€` 
                          : "Prix non défini"
                        }
                      </div>
                      <div className="text-muted small">
                        <i className="fas fa-heart text-danger me-1"></i>
                        {book.likes?.length || 0} likes
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        onClick={() => handleRentBook(book._id)}
                        disabled={!book.price}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        Louer maintenant
                      </Button>
                      
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/books/${book._id}`} 
                          className="btn btn-outline-info flex-fill"
                        >
                          <i className="fas fa-eye me-2"></i>
                          Détails
                        </Link>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleRemoveFromFavorites(book._id)}
                          className="flex-fill"
                        >
                          <i className="fas fa-trash me-2"></i>
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Favorites;