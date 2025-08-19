// src/components/CreateReview.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewSchema } from "../schemas/reviewSchema";
import { Modal, Button, Form, Alert, Spinner, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaStar, FaBook } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";

const CreateReview = ({ show, onHide, bookId, book, onSuccess }) => {
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    resolver: zodResolver(createReviewSchema),
    mode: "onChange",
    defaultValues: {
      bookId: bookId || "",
      rating: 5,
      comment: ""
    }
  });

  // Observer la note pour l'affichage des étoiles
  const watchedRating = watch("rating");

  // Mettre à jour le bookId quand il change
  useEffect(() => {
    if (bookId) {
      setValue("bookId", bookId);
    }
  }, [bookId, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setSubmitError("");
      reset({
        bookId: bookId || "",
        rating: 5,
        comment: ""
      });
    }
  }, [show, bookId, reset]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      console.log("📝 Création d'un nouvel avis...", data);

      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        {
          bookId: data.bookId,
          rating: Number(data.rating),
          comment: data.comment.trim()
        },
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Avis créé:", response.data);
      toast.success("Votre avis a été publié avec succès !");
      
      // Fermer le modal et reset
      onHide();
      reset();
      
      // Callback de succès
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error("❌ Erreur création avis:", error);
      
      if (error.response?.data?.errors) {
        // Erreurs de validation express-validator
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        setSubmitError(errorMessages);
      } else if (error.response?.status === 409) {
        setSubmitError("Vous avez déjà posté un avis pour ce livre.");
      } else if (error.response?.status === 403) {
        setSubmitError("Vous devez avoir emprunté ce livre pour pouvoir donner un avis.");
      } else if (error.response?.status === 401) {
        setSubmitError("Vous devez être connecté pour publier un avis.");
      } else {
        setSubmitError(
          error.response?.data?.message || 
          "Erreur lors de la publication de votre avis."
        );
      }
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`${index < rating ? "text-warning" : "text-muted"} ${interactive ? "cursor-pointer" : ""}`}
        style={{ cursor: interactive ? "pointer" : "default", fontSize: "1.2rem" }}
        onClick={interactive && onStarClick ? () => onStarClick(index + 1) : undefined}
      />
    ));
  };

  const handleStarClick = (rating) => {
    setValue("rating", rating, { shouldValidate: true });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBook className="text-primary me-2" />
          Écrire un avis
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {submitError}
            </Alert>
          )}

          {/* Informations du livre */}
          {book && (
            <Card className="bg-light border-0 mb-4">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  {book.coverImage && (
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="me-3"
                      style={{ 
                        width: "60px", 
                        height: "80px", 
                        objectFit: "cover",
                        borderRadius: "0.375rem"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h6 className="mb-1">{book.title}</h6>
                    {book.author && <p className="text-muted small mb-0">par {book.author}</p>}
                    {book.genre && <span className="badge bg-secondary small">{book.genre}</span>}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Sélection de la note */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              Note <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex gap-1">
                {renderStars(watchedRating, true, handleStarClick)}
              </div>
              <span className="fw-bold text-warning fs-5">
                {watchedRating}/5
              </span>
            </div>
            <input type="hidden" {...register("rating")} />
            {errors.rating && (
              <div className="text-danger small mt-1">
                {errors.rating.message}
              </div>
            )}
            <Form.Text className="text-muted">
              Cliquez sur les étoiles pour noter ce livre
            </Form.Text>
          </Form.Group>

          {/* Commentaire */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              Votre commentaire <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              {...register("comment")}
              isInvalid={!!errors.comment}
              placeholder="Partagez votre opinion sur ce livre, ce que vous avez aimé ou moins aimé..."
              disabled={isSubmitting}
            />
            {errors.comment && (
              <Form.Control.Feedback type="invalid">
                {errors.comment.message}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Minimum 10 caractères, maximum 1000 caractères
            </Form.Text>
          </Form.Group>

          {/* Preview de l'avis */}
          {watchedRating && watch("comment") && watch("comment").length >= 10 && (
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white">
                <small><i className="fas fa-eye me-2"></i>Aperçu de votre avis</small>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Votre nom</strong>
                  <div className="d-flex align-items-center gap-2">
                    {renderStars(watchedRating)}
                    <span className="small text-muted">{watchedRating}/5</span>
                  </div>
                </div>
                <p className="text-muted fst-italic mb-0">
                  "{watch("comment")}"
                </p>
                <small className="text-muted">
                  <i className="fas fa-calendar me-1"></i>
                  {new Date().toLocaleDateString("fr-FR")}
                </small>
              </Card.Body>
            </Card>
          )}

          {/* Champ caché pour bookId */}
          <input type="hidden" {...register("bookId")} />
          {errors.bookId && (
            <Alert variant="danger">
              {errors.bookId.message}
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button 
            variant="secondary" 
            onClick={onHide}
            disabled={isSubmitting}
          >
            <i className="fas fa-times me-2"></i>
            Annuler
          </Button>
          
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Publication...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Publier mon avis
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateReview;