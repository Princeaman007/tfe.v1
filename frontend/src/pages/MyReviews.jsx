// src/components/ReviewList.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateReviewSchema } from "../schemas/reviewSchema";
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
  InputGroup,
  Pagination
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FaStar, FaSyncAlt, FaBook, FaTrash, FaEdit, FaSearch, FaFilter } from "react-icons/fa";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination et filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // États des modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Form de modification avec validation
  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(updateReviewSchema),
    mode: "onChange"
  });

  useEffect(() => {
    fetchReviews();
  }, [currentPage, ratingFilter, sortBy, sortOrder]);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("📖 Chargement des avis utilisateur...");
      
      const params = {
        page: currentPage,
        limit: 6,
        sortBy,
        sortOrder
      };

      if (ratingFilter) {
        params.rating = ratingFilter;
      }

      const response = await axios.get("http://localhost:5000/api/reviews/me", {
        params,
        withCredentials: true,
        timeout: 10000
      });

      console.log("✅ Avis chargés:", response.data);

      // Adapter selon la structure de votre API
      if (response.data.reviews) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages || 1);
        setTotalReviews(response.data.totalReviews || 0);
      } else if (Array.isArray(response.data)) {
        setReviews(response.data);
        setTotalPages(1);
        setTotalReviews(response.data.length);
      } else {
        setReviews([]);
      }

    } catch (err) {
      console.error("❌ Erreur chargement avis:", err);
      
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas les permissions pour voir vos avis.");
      } else {
        setError("Erreur lors du chargement de vos avis.");
      }
      
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("🗑️ Suppression avis:", selectedReviewId);
      
      await axios.delete(
        `http://localhost:5000/api/reviews/${selectedReviewId}`,
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      toast.success("Avis supprimé avec succès !");
      setShowDeleteModal(false);
      setSelectedReviewId(null);
      
      // Recharger la liste
      await fetchReviews();
      
    } catch (err) {
      console.error("❌ Erreur suppression avis:", err);
      
      if (err.response?.status === 404) {
        toast.error("Avis non trouvé.");
      } else if (err.response?.status === 403) {
        toast.error("Vous ne pouvez pas supprimer cet avis.");
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  const openEditModal = (review) => {
    setSelectedReview(review);
    
    // Pré-remplir le formulaire
    setValue("rating", review.rating);
    setValue("comment", review.comment || "");
    
    setShowEditModal(true);
  };

  const onEditSubmit = async (data) => {
    try {
      console.log("📝 Modification avis:", selectedReview._id, data);
      
      // Préparer les données modifiées
      const updateData = {};
      if (data.rating !== selectedReview.rating) {
        updateData.rating = data.rating;
      }
      if (data.comment !== (selectedReview.comment || "")) {
        updateData.comment = data.comment;
      }

      // Vérifier qu'il y a des modifications
      if (Object.keys(updateData).length === 0) {
        toast.info("Aucune modification détectée.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/reviews/${selectedReview._id}`,
        updateData,
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      toast.success("Avis modifié avec succès !");
      setShowEditModal(false);
      setSelectedReview(null);
      resetForm();
      
      // Recharger la liste
      await fetchReviews();
      
    } catch (err) {
      console.error("❌ Erreur modification avis:", err);
      
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors.map(error => error.msg).join(', ');
        toast.error(errorMessages);
      } else if (err.response?.status === 403) {
        toast.error("Vous ne pouvez pas modifier cet avis.");
      } else {
        toast.error(err.response?.data?.message || "Erreur lors de la modification.");
      }
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setRatingFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-warning" : "text-muted"}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <FaBook className="me-2" />
            Mes Avis
          </h2>
          <p className="text-muted mb-0">
            {totalReviews} avis au total
          </p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={fetchReviews} 
          disabled={loading}
        >
          <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Filtres et tri */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted">FILTRER PAR NOTE</Form.Label>
              <Form.Select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <Form.Label className="small text-muted">TRIER PAR</Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date de création</option>
                <option value="rating">Note</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Label className="small text-muted">ORDRE</Form.Label>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <Button variant="outline-secondary" onClick={handleReset} className="w-100">
                <FaFilter className="me-2" />
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Contenu principal */}
      {error ? (
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
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
      ) : loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement de vos avis...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <FaBook className="mb-3" style={{ fontSize: "3rem" }} />
          <h5>Aucun avis trouvé</h5>
          {ratingFilter ? (
            <p>Aucun avis avec cette note. Essayez d'autres filtres.</p>
          ) : (
            <p>Vous n'avez pas encore posté d'avis sur des livres.</p>
          )}
        </Alert>
      ) : (
        <>
          <Row className="gy-4">
            {reviews.map((review) => (
              <Col lg={6} key={review._id}>
                <Card className="shadow-sm border-0 h-100 hover-shadow">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <Card.Title className="mb-2">
                          {review.book?.title || "📚 Livre inconnu"}
                        </Card.Title>
                        {review.book?.author && (
                          <Card.Subtitle className="text-muted small">
                            par {review.book.author}
                          </Card.Subtitle>
                        )}
                      </div>
                      <Badge bg="warning" text="dark" className="ms-2">
                        <div className="d-flex align-items-center">
                          {renderStars(review.rating)}
                          <span className="ms-2">{review.rating}/5</span>
                        </div>
                      </Badge>
                    </div>

                    {review.comment && (
                      <Card.Text className="text-muted fst-italic">
                        "{review.comment}"
                      </Card.Text>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(review.createdAt)}
                      </small>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openEditModal(review)}
                          title="Modifier l'avis"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedReviewId(review._id);
                            setShowDeleteModal(true);
                          }}
                          title="Supprimer l'avis"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />

                {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                  const pageNumber = idx + Math.max(1, currentPage - 2);
                  if (pageNumber > totalPages) return null;

                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal de suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrash className="text-danger me-2" />
            Supprimer l'avis
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="fas fa-times me-2"></i>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" />
            Supprimer définitivement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de modification avec validation */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="text-primary me-2" />
            Modifier l'avis
          </Modal.Title>
        </Modal.Header>
        
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <Modal.Body>
            {selectedReview && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>{selectedReview.book?.title}</strong>
                {selectedReview.book?.author && (
                  <div className="small text-muted">par {selectedReview.book.author}</div>
                )}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Note <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register("rating")}
                isInvalid={!!errors.rating}
                disabled={isSubmitting}
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val} étoile{val > 1 ? "s" : ""} - {renderStars(val)}
                  </option>
                ))}
              </Form.Select>
              {errors.rating && (
                <Form.Control.Feedback type="invalid">
                  {errors.rating.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register("comment")}
                isInvalid={!!errors.comment}
                placeholder="Partagez votre opinion sur ce livre... (minimum 10 caractères)"
                disabled={isSubmitting}
              />
              {errors.comment && (
                <Form.Control.Feedback type="invalid">
                  {errors.comment.message}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                Entre 10 et 1000 caractères
              </Form.Text>
            </Form.Group>

            {errors.root && (
              <Alert variant="danger">
                {errors.root.message}
              </Alert>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Enregistrer
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transition: box-shadow 0.15s ease-in-out;
        }
      `}</style>
    </Container>
  );
};

export default ReviewList;