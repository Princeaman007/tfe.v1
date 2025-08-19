
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookCreateSchema } from "../schemas/bookSchema";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";

const AddBook = () => {
  const navigate = useNavigate();
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

  // Charger les genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const response = await axios.get(`${API_BASE_URL}/api/books/genres`, {
          withCredentials: true,
        });

        let genresList = [];
        if (Array.isArray(response.data.genres)) {
          genresList = response.data.genres;
        } else if (Array.isArray(response.data)) {
          genresList = response.data;
        }
        
        setGenres(genresList);
      } catch (err) {
        console.error("Erreur chargement genres:", err);
        toast.error("Erreur lors du chargement des genres");
        setGenres([]);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");
      
      console.log("📚 Ajout d'un nouveau livre...");
      
      // Préparer les données selon votre validation backend
      const bookData = {
        title: data.title.trim(),
        author: data.author.trim(),
        description: data.description ? data.description.trim() : undefined,
        genre: data.genre,
        publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
        price: Number(data.price),
        availableCopies: data.availableCopies ? Number(data.availableCopies) : undefined,
        coverImage: data.coverImage ? data.coverImage.trim() : undefined
      };

      console.log("📋 Données envoyées:", bookData);

      const response = await axios.post(
        `http://localhost:5000/api/books`, 
        bookData, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Livre créé:", response.data);
      toast.success("Livre ajouté avec succès !");
      
      // Reset du formulaire
      reset();
      
      // Redirection vers la gestion des livres
      navigate("/admin/books");
      
    } catch (error) {
      console.error("❌ Erreur création livre:", error);
      
      if (error.response?.data?.errors) {
        // Erreurs de validation express-validator
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        setSubmitError(errorMessages);
      } else if (error.response?.status === 403) {
        setSubmitError("Vous n'avez pas les droits pour ajouter des livres.");
      } else if (error.response?.status === 401) {
        setSubmitError("Session expirée. Veuillez vous reconnecter.");
      } else {
        setSubmitError(
          error.response?.data?.message || 
          "Erreur lors de l'ajout du livre. Veuillez réessayer."
        );
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ? Toutes les données seront perdues.")) {
      navigate(-1); // Retour à la page précédente
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-primary mb-1">
                <i className="fas fa-plus-circle me-2"></i>
                Ajouter un Livre
              </h2>
              <p className="text-muted mb-0">Enrichissez votre catalogue avec un nouveau livre</p>
            </div>
            <Button variant="outline-secondary" onClick={handleCancel}>
              <i className="fas fa-arrow-left me-2"></i>
              Retour
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {submitError && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {submitError}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onFormSubmit)}>
                {/* Informations principales */}
                <div className="mb-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations principales
                  </h5>

                  <Row>
                    <Col md={6} className="mb-3">
                      <label className="form-label">
                        Titre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        placeholder="Entrez le titre du livre"
                        {...register("title")}
                        disabled={isSubmitting}
                      />
                      {errors.title && (
                        <div className="invalid-feedback">
                          {errors.title.message}
                        </div>
                      )}
                    </Col>

                    <Col md={6} className="mb-3">
                      <label className="form-label">
                        Auteur <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.author ? 'is-invalid' : ''}`}
                        placeholder="Nom de l'auteur"
                        {...register("author")}
                        disabled={isSubmitting}
                      />
                      {errors.author && (
                        <div className="invalid-feedback">
                          {errors.author.message}
                        </div>
                      )}
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      rows={3}
                      placeholder="Description du livre (optionnel)"
                      {...register("description")}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Détails du livre */}
                <div className="mb-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="fas fa-book me-2"></i>
                    Détails du livre
                  </h5>

                  <Row>
                    <Col md={6} className="mb-3">
                      <label className="form-label">
                        Genre <span className="text-danger">*</span>
                      </label>
                      {loadingGenres ? (
                        <div className="d-flex align-items-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          <span className="text-muted">Chargement des genres...</span>
                        </div>
                      ) : (
                        <>
                          <select
                            className={`form-select ${errors.genre ? 'is-invalid' : ''}`}
                            {...register("genre")}
                            disabled={isSubmitting}
                          >
                            <option value="">Choisir un genre</option>
                            {genres.map((genre) => (
                              <option key={genre} value={genre}>
                                {genre}
                              </option>
                            ))}
                          </select>
                          {errors.genre && (
                            <div className="invalid-feedback">
                              {errors.genre.message}
                            </div>
                          )}
                        </>
                      )}
                    </Col>

                    <Col md={6} className="mb-3">
                      <label className="form-label">Année de publication</label>
                      <input
                        type="number"
                        className={`form-control ${errors.publishedYear ? 'is-invalid' : ''}`}
                        placeholder="ex: 2023"
                        min="1000"
                        max={new Date().getFullYear()}
                        {...register("publishedYear")}
                        disabled={isSubmitting}
                      />
                      {errors.publishedYear && (
                        <div className="invalid-feedback">
                          {errors.publishedYear.message}
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <label className="form-label">
                        Prix (€) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                          placeholder="19.99"
                          min="0"
                          {...register("price")}
                          disabled={isSubmitting}
                        />
                        <span className="input-group-text">€</span>
                        {errors.price && (
                          <div className="invalid-feedback">
                            {errors.price.message}
                          </div>
                        )}
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <label className="form-label">Stock disponible</label>
                      <input
                        type="number"
                        className={`form-control ${errors.availableCopies ? 'is-invalid' : ''}`}
                        placeholder="ex: 10"
                        min="0"
                        {...register("availableCopies")}
                        disabled={isSubmitting}
                      />
                      {errors.availableCopies && (
                        <div className="invalid-feedback">
                          {errors.availableCopies.message}
                        </div>
                      )}
                      <small className="text-muted">
                        Laissez vide si non applicable
                      </small>
                    </Col>
                  </Row>
                </div>

                {/* Image de couverture */}
                <div className="mb-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="fas fa-image me-2"></i>
                    Image de couverture
                  </h5>

                  <div className="mb-3">
                    <label className="form-label">URL de l'image</label>
                    <input
                      type="url"
                      className={`form-control ${errors.coverImage ? 'is-invalid' : ''}`}
                      placeholder="https://exemple.com/image.jpg"
                      {...register("coverImage")}
                      disabled={isSubmitting}
                    />
                    {errors.coverImage && (
                      <div className="invalid-feedback">
                        {errors.coverImage.message}
                      </div>
                    )}
                    <small className="text-muted">
                      Optionnel - URL d'une image de couverture
                    </small>
                  </div>

                  {/* Prévisualisation de l'image */}
                  {watchedCoverImage && !errors.coverImage && (
                    <div className="text-center">
                      <p className="small text-muted mb-2">Aperçu :</p>
                      <img 
                        src={watchedCoverImage} 
                        alt="Aperçu de la couverture" 
                        style={{ 
                          maxWidth: "150px", 
                          maxHeight: "200px",
                          objectFit: "cover",
                          border: "1px solid #dee2e6",
                          borderRadius: "0.375rem"
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-times me-2"></i>
                    Annuler
                  </Button>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting || !isValid}
                    className="px-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Ajouter le livre
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddBook;