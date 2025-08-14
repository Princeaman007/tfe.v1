// src/components/BookEditModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookUpdateSchema } from "../schemas/bookSchema";
import axios from "axios";

const BookEditModal = ({ show, onHide, onSubmit, book }) => {
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    watch
  } = useForm({
    resolver: zodResolver(bookUpdateSchema),
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

  // Observer les changements pour la prévisualisation
  const watchedCoverImage = watch("coverImage");

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const res = await axios.get("http://localhost:5000/api/books/genres", {
          withCredentials: true,
        });
        setGenres(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
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

  // Populate form when book changes
  useEffect(() => {
    if (book && show) {
      // Reset form and populate with book data
      reset({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        genre: book.genre || "",
        publishedYear: book.publishedYear ? String(book.publishedYear) : "",
        price: book.price ? String(book.price) : "",
        availableCopies: book.availableCopies ? String(book.availableCopies) : "",
        coverImage: book.coverImage || ""
      });
    }
  }, [book, show, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setSubmitError("");
    }
  }, [show]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      // Prepare data - only include changed fields
      const changedData = {};
      
      // Compare with original book data and only include changed fields
      if (data.title !== book.title) changedData.title = data.title;
      if (data.author !== book.author) changedData.author = data.author;
      if (data.description !== (book.description || "")) changedData.description = data.description || undefined;
      if (data.genre !== book.genre) changedData.genre = data.genre;
      if (String(data.publishedYear) !== String(book.publishedYear || "")) {
        changedData.publishedYear = data.publishedYear ? Number(data.publishedYear) : undefined;
      }
      if (String(data.price) !== String(book.price || "")) changedData.price = Number(data.price);
      if (String(data.availableCopies) !== String(book.availableCopies || "")) {
        changedData.availableCopies = data.availableCopies ? Number(data.availableCopies) : undefined;
      }
      if (data.coverImage !== (book.coverImage || "")) {
        changedData.coverImage = data.coverImage || undefined;
      }

      // Only submit if there are changes
      if (Object.keys(changedData).length === 0) {
        setSubmitError("Aucune modification détectée");
        return;
      }

      await onSubmit(book._id || book.id, changedData);
      
      // If successful, the parent component should close the modal
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setSubmitError(
        error.response?.data?.message || 
        "Une erreur est survenue lors de la modification du livre"
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop={isSubmitting ? "static" : true} size="lg">
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Modifier le Livre
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

          {/* Affichage du livre en cours de modification */}
          {book && (
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-2">
                <i className="fas fa-book me-2"></i>
                Livre en cours de modification
              </h6>
              <div className="row">
                <div className="col-md-8">
                  <strong>{book.title}</strong> par {book.author}
                  {book.genre && <span className="badge bg-secondary ms-2">{book.genre}</span>}
                </div>
                <div className="col-md-4 text-end">
                  {book.price && <span className="text-success fw-bold">{book.price}€</span>}
                </div>
              </div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
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
            <Form.Label>Auteur</Form.Label>
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
              placeholder="Entrez une description du livre"
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
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
                <Form.Label>Prix (€)</Form.Label>
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

          {/* Indicateur de modifications */}
          {isDirty && (
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
            variant="warning" 
            type="submit" 
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Mise à jour...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Mettre à jour
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookEditModal;