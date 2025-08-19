import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Badge,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { FaStar, FaSyncAlt, FaBook, FaEdit, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config.js";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reviews/me`, {
        withCredentials: true,
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des avis :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        withCredentials: true,
      });
      fetchReviews();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const openEditModal = (review) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
  if (!selectedReview) return;

  try {
    console.log("🔁 Envoi de la mise à jour :", {
      reviewId: selectedReview._id,
      rating: editRating,
      comment: editComment,
    });

    const res = await axios.put(
      `${API_BASE_URL}/api/reviews/${selectedReview._id}`,
      {
        rating: editRating,
        comment: editComment,
      },
      {
        withCredentials: true,
      }
    );

    console.log("✅ Mise à jour réussie :", res.data);

    setShowEditModal(false);
    setSelectedReview(null);
    fetchReviews();
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour :", err.response?.data || err.message);
    alert(err.response?.data?.message || "Erreur lors de la mise à jour de l'avis.");
  }
};


  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">📝 Mes Avis</h2>
        <Button variant="outline-primary" onClick={fetchReviews} disabled={loading}>
          <FaSyncAlt className="me-2" />
          Recharger
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement de vos avis...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaBook className="me-2" />
          Tu n’as pas encore posté d’avis.
        </Alert>
      ) : (
        <Row className="gy-4">
          {reviews.map((review) => (
            <Col md={6} key={review._id}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0">
                      {review.book?.title || "📚 Livre inconnu"}
                    </Card.Title>
                    <Badge bg="warning" text="dark">
                      <FaStar className="me-1" />
                      {review.rating}/5
                    </Badge>
                  </div>
                  <Card.Text className="text-muted fst-italic">
                    {review.comment || "Aucun commentaire."}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Posté le{" "}
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("fr-FR")
                        : "date inconnue"}
                    </small>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditModal(review)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(review._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal édition */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l’avis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Select
                value={editRating}
                onChange={(e) => setEditRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val} étoile{val > 1 ? "s" : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewList;
