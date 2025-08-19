// src/components/CreateRental.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickRentalSchema } from "../schemas/rentalSchema";
import { Modal, Button, Form, Alert, Spinner, Card, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";

const CreateRental = ({ show, onHide, bookId, book, onSuccess }) => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [rentalPrice, setRentalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    resolver: zodResolver(quickRentalSchema),
    mode: "onChange",
    defaultValues: {
      bookId: bookId || "",
      duration: 14
    }
  });

  // Observer la durée pour calculer le prix
  const watchedDuration = watch("duration");

  // Mettre à jour le bookId quand il change
  useEffect(() => {
    if (bookId) {
      setValue("bookId", bookId);
    }
  }, [bookId, setValue]);

  // Calculer le prix selon la durée
  useEffect(() => {
    if (book && watchedDuration) {
      // Prix de base + durée * prix par jour
      const basePrice = book.rentalPrice || book.price * 0.1 || 2; // 10% du prix ou 2€ minimum
      const dailyRate = 0.5; // 0.50€ par jour
      const calculatedPrice = basePrice + (watchedDuration - 7) * dailyRate;
      setRentalPrice(Math.max(calculatedPrice, basePrice));
    }
  }, [book, watchedDuration]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setSubmitError("");
      reset({
        bookId: bookId || "",
        duration: 14
      });
    }
  }, [show, bookId, reset]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      setLoading(true);
      
      console.log("📚 Création d'une location...", data);

      // Calculer la date d'échéance
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + data.duration);

      const rentalData = {
        book: data.bookId,
        dueDate: dueDate.toISOString()
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/rentals`,
        rentalData,
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Location créée:", response.data);
      
      // Si paiement requis
      if (response.data.paymentUrl) {
        toast.info("Redirection vers le paiement...");
        window.location.href = response.data.paymentUrl;
        return;
      }

      toast.success("Livre emprunté avec succès !");
      
      // Fermer le modal et reset
      onHide();
      reset();
      
      // Callback de succès
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error("❌ Erreur création location:", error);
      
      if (error.response?.data?.errors) {
        // Erreurs de validation express-validator
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        setSubmitError(errorMessages);
      } else if (error.response?.status === 409) {
        setSubmitError("Ce livre n'est pas disponible pour le moment.");
      } else if (error.response?.status === 402) {
        setSubmitError("Paiement requis pour emprunter ce livre.");
      } else if (error.response?.status === 403) {
        setSubmitError("Vous avez atteint votre limite d'emprunts simultanés.");
      } else if (error.response?.status === 401) {
        setSubmitError("Vous devez être connecté pour emprunter un livre.");
      } else {
        setSubmitError(
          error.response?.data?.message || 
          "Erreur lors de l'emprunt du livre."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getDurationOptions = () => {
    return [
      { value: 7, label: "1 semaine", price: rentalPrice - 3.5 },
      { value: 14, label: "2 semaines (recommandé)", price: rentalPrice },
      { value: 21, label: "3 semaines", price: rentalPrice + 3.5 },
      { value: 30, label: "1 mois", price: rentalPrice + 8 }
    ];
  };

  const formatPrice = (price) => {
    return `${Math.max(price, 1).toFixed(2)}€`;
  };

  const calculateReturnDate = (duration) => {
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + duration);
    return returnDate.toLocaleDateString("fr-FR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-book-reader text-primary me-2"></i>
          Emprunter le livre
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
                        width: "80px", 
                        height: "120px", 
                        objectFit: "cover",
                        borderRadius: "0.375rem"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{book.title}</h5>
                    {book.author && <p className="text-muted mb-2">par {book.author}</p>}
                    <div className="d-flex gap-2 flex-wrap">
                      {book.genre && <Badge bg="secondary">{book.genre}</Badge>}
                      {book.availableCopies !== undefined && (
                        <Badge bg={book.availableCopies > 0 ? "success" : "danger"}>
                          {book.availableCopies > 0 ? `${book.availableCopies} disponible(s)` : "Non disponible"}
                        </Badge>
                      )}
                      {book.price && <Badge bg="info">{book.price}€</Badge>}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Informations utilisateur */}
          {user && (
            <Card className="border-primary mb-4">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-2">
                  <i className="fas fa-user me-2"></i>
                  Informations d'emprunt
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Emprunteur :</strong> {user.name}
                  </div>
                  <div className="col-md-6">
                    <strong>Email :</strong> {user.email}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Sélection de la durée */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              Durée d'emprunt <span className="text-danger">*</span>
            </Form.Label>
            
            <div className="row g-3">
              {getDurationOptions().map((option) => (
                <div key={option.value} className="col-md-6">
                  <div className={`border rounded p-3 cursor-pointer ${
                    watchedDuration === option.value ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                  }`}>
                    <Form.Check
                      type="radio"
                      {...register("duration", { valueAsNumber: true })}
                      value={option.value}
                      id={`duration-${option.value}`}
                      className="d-none"
                    />
                    <label 
                      htmlFor={`duration-${option.value}`}
                      className="w-100 cursor-pointer"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{option.label}</strong>
                          <div className="small text-muted">
                            Retour le {calculateReturnDate(option.value)}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            {formatPrice(option.price)}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {errors.duration && (
              <div className="text-danger small mt-2">
                {errors.duration.message}
              </div>
            )}
          </Form.Group>

          {/* Résumé de la commande */}
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">
                <i className="fas fa-shopping-cart me-2"></i>
                Résumé de l'emprunt
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Durée sélectionnée :</span>
                <strong>{watchedDuration} jours</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Date de retour :</span>
                <strong>{calculateReturnDate(watchedDuration)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5">
                <span><strong>Total à payer :</strong></span>
                <strong className="text-success">{formatPrice(rentalPrice)}</strong>
              </div>
              
              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Conditions :</strong> Retour en retard = 1,50€/jour d'amende.
                  Prolongation possible selon disponibilité.
                </small>
              </Alert>
            </Card.Body>
          </Card>

          {/* Champ caché pour bookId */}
          <input type="hidden" {...register("bookId")} />
          {errors.bookId && (
            <Alert variant="danger" className="mt-3">
              {errors.bookId.message}
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button 
            variant="secondary" 
            onClick={onHide}
            disabled={isSubmitting || loading}
          >
            <i className="fas fa-times me-2"></i>
            Annuler
          </Button>
          
          <Button 
            variant="success" 
            type="submit"
            disabled={isSubmitting || loading || !isValid || (book && book.availableCopies <= 0)}
            size="lg"
          >
            {isSubmitting || loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Traitement...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card me-2"></i>
                Emprunter pour {formatPrice(rentalPrice)}
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateRental;