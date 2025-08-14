// src/components/BookCreateModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookCreateSchema } from "../schemas/bookSchema";
import axios from "axios";

const BookCreateModal = ({ show, onHide, onSubmit }) => {
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm({
    resolver: zodResolver(bookCreateSchema),
    mode: "onChange", // Validation en temps réel
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

  // Observer les changements pour la prévisualisation (optionnel)
  const watchedCoverImage = watch("coverImage");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const res = await axios.get("http://localhost:5000/api/books/genres", {
          withCredentials: true,
        });
        setGenres(res.data);
      } catch (err) {
        console.error("Erreur chargement genres:", err);
      } finally {
        setLoadingGenres(false);
      }
    };

    if (show) {
      fetchGenres();
      setSubmitError(""); // Reset error when modal opens
    }
  }, [show]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      reset();
      setSubmitError("");
    }
  }, [show, reset]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      // Transform data to match backend expectations
      const transformedData = {
        ...data,
        publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
        price: Number(data.price),
        availableCopies: data.availableCopies ? Number(data.availableCopies) : undefined,
        // Remove empty strings
        description: data.description || undefined,
        coverImage: data.coverImage || undefined
      };

      await onSubmit(transformedData);
      
      // If successful, the parent component should close the modal
      // and the reset will happen via the useEffect above
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setSubmitError(
        error.response?.data?.message || 
        "Une erreur est survenue lors de la création du livre"
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un Livre</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Titre *</Form.Label>
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
            <Form.Label>Auteur *</Form.Label>
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
                <Form.Label>Genre *</Form.Label>
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
                <Form.Label>Prix (€) *</Form.Label>
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
            
            {/* Prévisualisation de l'image (optionnel) */}
            {watchedCoverImage && !errors.coverImage && (
              <div className="mt-2">
                <img 
                  src={watchedCoverImage} 
                  alt="Aperçu" 
                  style={{ maxWidth: "100px", maxHeight: "150px" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
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
                Création...
              </>
            ) : (
              "Ajouter"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookCreateModal;