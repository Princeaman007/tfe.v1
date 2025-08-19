// src/components/BookFormModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookCreateSchema, bookUpdateSchema } from "../schemas/bookSchema";
import axios from "axios";
import { API_BASE_URL } from '../config.js';

const BookFormModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  initialData = null, 
  title,
  mode = "create" // "create" ou "edit"
}) => {
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Choisir le bon schéma selon le mode
  const schema = mode === "edit" ? bookUpdateSchema : bookCreateSchema;
  const isEditMode = mode === "edit" && initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genre: "",
      publishedYear: "",
      price: "",
      availableCopies: "",
      coverImage: ""
    }
  });

  // Observer l'image pour la prévisualisation
  const watchedCoverImage = watch("coverImage");

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const res = await axios.get(`${API_BASE_URL}/api/books/genres`, {
          withCredentials: true,
        });

        let genresList = [];
        if (Array.isArray(res.data.genres)) {
          genresList = res.data.genres;
        } else if (Array.isArray(res.data)) {
          genresList = res.data;
        } else {
          console.warn("Format inattendu pour les genres :", res.data);
        }
        
        setGenres(genresList);
      } catch (err) {
        console.error("Erreur chargement genres:", err);
        setGenres([]);
      } finally {
        setLoadingGenres(false);
      }
    };

    if (show) {
      fetchGenres();
      setSubmitError("");
    }
  }, [show]);

  // Populate form with initial data
  useEffect(() => {
    if (show) {
      if (initialData) {
        // Mode édition - populate avec les données existantes
        reset({
          title: initialData.title || "",
          author: initialData.author || "",
          description: initialData.description || "",
          genre: initialData.genre || "",
          publishedYear: initialData.publishedYear ? String(initialData.publishedYear) : "",
          price: initialData.price ? String(initialData.price) : "",
          availableCopies: initialData.availableCopies ? String(initialData.availableCopies) : "",
          coverImage: initialData.coverImage || ""
        });
      } else {
        // Mode création - formulaire vide
        reset({
          title: "",
          author: "",
          description: "",
          genre: "",
          publishedYear: "",
          price: "",
          availableCopies: "",
          coverImage: ""
        });
      }
    }
  }, [initialData, show, reset]);

  // Reset error when modal closes
  useEffect(() => {
    if (!show) {
      setSubmitError("");
    }
  }, [show]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      let preparedData;

      if (isEditMode) {
        // Mode édition - préparer seulement les champs modifiés
        preparedData = {};
        
        if (data.title !== initialData.title) preparedData.title = data.title;
        if (data.author !== initialData.author) preparedData.author = data.author;
        if (data.description !== (initialData.description || "")) {
          preparedData.description = data.description || undefined;
        }
        if (data.genre !== initialData.genre) preparedData.genre = data.genre;
        if (String(data.publishedYear) !== String(initialData.publishedYear || "")) {
          preparedData.publishedYear = data.publishedYear ? Number(data.publishedYear) : undefined;
        }
        if (String(data.price) !== String(initialData.price || "")) {
          preparedData.price = Number(data.price);
        }
        if (String(data.availableCopies) !== String(initialData.availableCopies || "")) {
          preparedData.availableCopies = data.availableCopies ? Number(data.availableCopies) : undefined;
        }
        if (data.coverImage !== (initialData.coverImage || "")) {
          preparedData.coverImage = data.coverImage || undefined;
        }

        // Vérifier qu'il y a des modifications
        if (Object.keys(preparedData).length === 0) {
          setSubmitError("Aucune modification détectée");
          return;
        }
      } else {
        // Mode création - préparer toutes les données
        preparedData = {
          title: data.title,
          author: data.author,
          description: data.description || undefined,
          genre: data.genre,
          publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
          price: Number(data.price),
          availableCopies: data.availableCopies ? Number(data.availableCopies) : undefined,
          coverImage: data.coverImage || undefined
        };
      }

      await onSubmit(preparedData);
      
      // Si succès, le parent fermera le modal
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitError(
        error.response?.data?.message || 
        "Une erreur est survenue lors de l'opération"
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  // Déterminer si le bouton submit doit être actif
  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (mode === "create") return !isValid;
    if (mode === "edit") return !isDirty;
    return false;
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      backdrop={isSubmitting ? "static" : true} 
      size="lg"
      centered
    >
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {submitError}
            </Alert>
          )}

          {/* Contexte pour le mode édition */}
          {isEditMode && (
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-2">
                <i className="fas fa-book me-2"></i>
                Livre en cours de modification
              </h6>
              <div className="row">
                <div className="col-md-8">
                  <strong>{initialData.title}</strong> par {initialData.author}
                  {initialData.genre && <span className="badge bg-secondary ms-2">{initialData.genre}</span>}
                </div>
                <div className="col-md-4 text-end">
                  {initialData.price && <span className="text-success fw-bold">{initialData.price}€</span>}
                </div>
              </div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Titre {mode === "create" && "*"}</Form.Label>
            <Form.Control
              {...register("title")}
              isInvalid={!!errors.title}
              placeholder="Entrez le titre du livre"
            />
            <Form.Control.Feedback type="invalid">
              {errors.title?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Auteur {mode === "create" && "*"}</Form.Label>
            <Form.Control
              {...register("author")}
              isInvalid={!!errors.author}
              placeholder="Entrez le nom de l'auteur"
            />
            <Form.Control.Feedback type="invalid">
              {errors.author?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register("description")}
              isInvalid={!!errors.description}
              placeholder="Entrez une description du livre (optionnel)"
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Genre {mode === "create" && "*"}</Form.Label>
                {loadingGenres ? (
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Chargement des genres...</span>
                  </div>
                ) : (
                  <>
                    <Form.Select
                      {...register("genre")}
                      isInvalid={!!errors.genre}
                    >
                      <option value="">Choisir un genre</option>
                      {genres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.genre?.message}
                    </Form.Control.Feedback>
                  </>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Année de publication</Form.Label>
                <Form.Control
                  type="number"
                  {...register("publishedYear")}
                  isInvalid={!!errors.publishedYear}
                  placeholder="ex: 2023"
                  min="1000"
                  max={new Date().getFullYear()}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.publishedYear?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prix (€) {mode === "create" && "*"}</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  {...register("price")}
                  isInvalid={!!errors.price}
                  placeholder="ex: 19.99"
                  min="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock disponible</Form.Label>
                <Form.Control
                  type="number"
                  {...register("availableCopies")}
                  isInvalid={!!errors.availableCopies}
                  placeholder="ex: 10"
                  min="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.availableCopies?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Image de couverture (URL)</Form.Label>
            <Form.Control
              type="url"
              {...register("coverImage")}
              isInvalid={!!errors.coverImage}
              placeholder="https://exemple.com/image.jpg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.coverImage?.message}
            </Form.Control.Feedback>
            
            {/* Prévisualisation de l'image */}
            {watchedCoverImage && !errors.coverImage && (
              <div className="mt-2">
                <small className="text-muted">Aperçu :</small>
                <br />
                <img 
                  src={watchedCoverImage} 
                  alt="Aperçu" 
                  style={{ maxWidth: "100px", maxHeight: "150px" }}
                  className="border rounded"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </Form.Group>

          {/* Indicateur de modifications pour le mode édition */}
          {isEditMode && isDirty && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Des modifications ont été détectées
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            <i className="fas fa-times me-2"></i>
            Annuler
          </Button>
          <Button 
            variant={isEditMode ? "warning" : "primary"} 
            type="submit" 
            disabled={isSubmitDisabled()}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isEditMode ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <i className={`fas ${isEditMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
                {isEditMode ? "Mettre à jour" : "Ajouter"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookFormModal;