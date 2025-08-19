// src/components/BookReviews.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert, Badge, Button, ProgressBar } from "react-bootstrap";
import { FaStar, FaUser, FaCalendar, FaEdit, FaFlag } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import CreateReview from "./CreateReview";
import axios from "axios";
import { API_BASE_URL } from '../../config.js';;

const BookReviews = ({ bookId, book }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    if (bookId) {
      fetchReviews();
      fetchStats();
    }
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log("📖 Chargement des avis pour le livre:", bookId);

      const response = await axios.get(`${API_BASE_URL}/api/reviews`, {
        params: {
          book: bookId,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc"
        },
        withCredentials: true,
        timeout: 10000
      });

      console.log("✅ Avis chargés:", response.data);

      const reviewsData = response.data.reviews || response.data || [];
      setReviews(reviewsData);

      // Trouver l'avis de l'utilisateur connecté
      if (user) {
        const currentUserReview = reviewsData.find(
          review => review.user?._id === user.id || review.user?.id === user.id
        );
        setUserReview(currentUserReview);
      }

    } catch (err) {
      console.error("❌ Erreur chargement avis:", err);
      setError("Erreur lors du chargement des avis.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("📊 Chargement statistiques avis pour:", bookId);

      const response = await axios.get(`${API_BASE_URL}/api/reviews/stats/${bookId}`, {
        withCredentials: true,
        timeout: 5000
      });

      console.log("✅ Statistiques chargées:", response.data);
      setStats(response.data);

    } catch (err) {
      console.error("❌ Erreur chargement stats:", err);
      // Les stats ne sont pas critiques, on continue sans
    }
  };

  const handleReviewCreated = () => {
    fetchReviews();
    fetchStats();
    setShowCreateModal(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-warning" : "text-muted"}
        style={{ fontSize: "0.9rem" }}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats || !stats.ratingDistribution) return null;

    return (
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3">Répartition des notes</h6>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={rating} className="d-flex align-items-center mb-2">
                <span className="me-2" style={{ minWidth: "20px" }}>
                  {rating}★
                </span>
                <ProgressBar 
                  now={percentage} 
                  className="flex-grow-1 me-2"
                  style={{ height: "8px" }}
                />
                <span className="small text-muted" style={{ minWidth: "30px" }}>
                  {count}
                </span>
              </div>
            );
          })}
        </Card.Body>
      </Card>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReportReview = async (reviewId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/reviews/${reviewId}/report`, {
        reason: "inappropriate"
      }, {
        withCredentials: true
      });
      
      toast.success("Avis signalé. Merci pour votre contribution.");
    } catch (error) {
      toast.error("Erreur lors du signalement.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec statistiques */}
      {stats && (
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4} className="text-center">
                <div className="display-4 fw-bold text-warning">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
                </div>
                <div className="mb-2">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
                <small className="text-muted">
                  {stats.totalReviews} avis
                </small>
              </Col>
              <Col md={8}>
                {renderRatingDistribution()}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Actions utilisateur */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>Avis des lecteurs</h5>
        {user && !userReview && (
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            <FaEdit className="me-2" />
            Écrire un avis
          </Button>
        )}
        {userReview && (
          <Badge bg="info">
            Vous avez déjà donné votre avis
          </Badge>
        )}
      </div>

      {/* Liste des avis */}
      {error ? (
        <Alert variant="danger">
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={() => {
              setError("");
              fetchReviews();
            }}
          >
            Réessayer
          </Button>
        </Alert>
      ) : reviews.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaStar className="mb-2" style={{ fontSize: "2rem" }} />
          <h6>Aucun avis pour le moment</h6>
          <p className="mb-0">Soyez le premier à donner votre opinion sur ce livre !</p>
        </Alert>
      ) : (
        <Row className="gy-3">
          {reviews.map((review) => (
            <Col key={review._id} xs={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: "40px", height: "40px" }}>
                        <FaUser />
                      </div>
                      <div>
                        <h6 className="mb-0">
                          {review.user?.name || "Utilisateur anonyme"}
                        </h6>
                        <div className="d-flex align-items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="small text-muted">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">
                        <FaCalendar className="me-1" />
                        {formatDate(review.createdAt)}
                      </small>
                      
                      {user && review.user?._id !== user.id && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleReportReview(review._id)}
                          title="Signaler cet avis"
                        >
                          <FaFlag />
                        </Button>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-muted mb-0">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Badge pour l'avis de l'utilisateur connecté */}
                  {user && review.user?._id === user.id && (
                    <Badge bg="success" className="mt-2">
                      Votre avis
                    </Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de création d'avis */}
      <CreateReview
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        bookId={bookId}
        book={book}
        onSuccess={handleReviewCreated}
      />
    </div>
  );
};

export default BookReviews;