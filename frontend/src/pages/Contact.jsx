import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Container, Row, Col, Card, Button, Alert, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Schéma de validation renforcé
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim(),

  email: z
    .string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .transform(email => email.toLowerCase().trim()),

  subject: z
    .string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(100, "Le sujet ne peut pas dépasser 100 caractères")
    .trim(),

  message: z
    .string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères")
    .trim(),

  category: z
    .string()
    .min(1, "Veuillez sélectionner une catégorie"),

  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[0-9\s\-\(\)]{10,15}$/.test(val), {
      message: "Format de téléphone invalide"
    }),

  urgent: z.boolean().optional(),
  newsletter: z.boolean().optional()
});

const Contact = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const FORM_URL = import.meta.env.VITE_FORMSPREE_URL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    watch,
    trigger
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "",
      phone: "",
      urgent: false,
      newsletter: false
    }
  });

  const watchedMessage = watch("message");
  const watchedCategory = watch("category");

const onFormSubmit = async (data) => {
  try {
    if (!FORM_URL) {
      throw new Error("VITE_FORMSPREE_URL est manquant. Ajoute-le dans frontend/.env et sur Render.");
    }

    console.log("📧 Envoi du formulaire de contact via Formspree :", data);

    const response = await fetch(FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        category: data.category,
        phone: data.phone || "",
        urgent: data.urgent || false,
        newsletter: data.newsletter || false,
        // Métadonnées utiles
        _subject: `[Bibliothèque] ${data.subject}`,
        _replyto: data.email,
        _next: window.location.origin + "/contact?success=true",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Erreur HTTP: ${response.status} ${text}`);
    }

    const result = await response.json().catch(() => ({}));
    console.log("✅ Réponse Formspree :", result);

    toast.success("Message envoyé avec succès ! Nous vous répondrons sous 24h.", {
      position: "top-right",
      autoClose: 5000,
    });

    setIsSuccess(true);
    reset();
    setTimeout(() => setIsSuccess(false), 8000);
  } catch (error) {
    console.error("❌ Erreur envoi contact :", error);
    toast.error("Erreur lors de l'envoi. Veuillez réessayer ou nous contacter directement.", {
      position: "top-right",
      autoClose: 7000,
    });
  }
};


  const categories = [
    { value: "", label: "Sélectionnez une catégorie", description: "" },
    { value: "general", label: "Question générale", description: "Informations sur nos services" },
    { value: "support", label: "Support technique", description: "Problème avec votre compte ou l'application" },
    { value: "book_request", label: "Demande de livre", description: "Suggérer l'ajout d'un livre spécifique" },
    { value: "feedback", label: "Retour d'expérience", description: "Votre avis pour améliorer nos services" },
    { value: "partnership", label: "Partenariat", description: "Collaboration commerciale ou institutionnelle" },
    { value: "billing", label: "Facturation", description: "Questions liées aux paiements et abonnements" },
    { value: "other", label: "Autre", description: "Sujet non listé ci-dessus" }
  ];

  const getEstimatedResponseTime = (category) => {
    const times = {
      support: "2-4 heures",
      billing: "1-2 heures",
      partnership: "2-3 jours ouvrés",
      book_request: "1-2 jours ouvrés",
      default: "24 heures"
    };
    return times[category] || times.default;
  };

  return (
    <>
      {/* Navigation de retour */}
      <div className="bg-white border-bottom">
        <Container>
          <div className="py-3">
            <Link to="/" className="btn btn-outline-secondary btn-sm">
              <i className="fas fa-arrow-left me-2"></i>
              Retour à l'accueil
            </Link>
          </div>
        </Container>
      </div>

      <div style={{ 
        background: "linear-gradient(135deg, #f8fafe 0%, #f0f4ff 100%)", 
        minHeight: "100vh", 
        paddingTop: "3rem", 
        paddingBottom: "3rem" 
      }}>
        <Container>
          {/* Header avec breadcrumb */}
          <Row className="mb-5">
            <Col className="text-center">
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb justify-content-center bg-transparent">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-decoration-none">Accueil</Link>
                  </li>
                  <li className="breadcrumb-item active">Contact</li>
                </ol>
              </nav>
              
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" 
                     style={{ width: "80px", height: "80px" }}>
                  <i className="fas fa-envelope fa-2x text-primary"></i>
                </div>
              </div>
              
              <h1 className="fw-bold text-dark mb-3 display-5">
                Contactez notre équipe
              </h1>
              <p className="lead text-muted col-lg-8 mx-auto">
                Nous sommes là pour vous accompagner. Choisissez le mode de contact qui vous convient le mieux.
              </p>
            </Col>
          </Row>

          {/* Indicateurs de réponse rapide */}
          <Row className="mb-5">
            <Col>
              <div className="bg-white rounded-4 shadow-sm p-4">
                <Row className="text-center">
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-success mb-2">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                    <h6 className="fw-bold">Réponse rapide</h6>
                    <small className="text-muted">Sous 24h en moyenne</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-info mb-2">
                      <i className="fas fa-shield-alt fa-2x"></i>
                    </div>
                    <h6 className="fw-bold">Données sécurisées</h6>
                    <small className="text-muted">Protection RGPD</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-warning mb-2">
                      <i className="fas fa-user-tie fa-2x"></i>
                    </div>
                    <h6 className="fw-bold">Équipe dédiée</h6>
                    <small className="text-muted">Experts à votre service</small>
                  </Col>
                  <Col md={3}>
                    <div className="text-primary mb-2">
                      <i className="fas fa-headset fa-2x"></i>
                    </div>
                    <h6 className="fw-bold">Support 7j/7</h6>
                    <small className="text-muted">Assistance continue</small>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Message de succès amélioré */}
          {isSuccess && (
            <Row className="mb-4">
              <Col>
                <Alert variant="success" className="border-0 shadow-sm rounded-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="fas fa-check-circle fa-2x text-success"></i>
                    </div>
                    <div>
                      <h5 className="alert-heading mb-1">Message envoyé avec succès !</h5>
                      <p className="mb-0">
                        Nous avons bien reçu votre message et vous répondrons sous 24h. 
                        Un email de confirmation a été envoyé à votre adresse.
                      </p>
                    </div>
                  </div>
                </Alert>
              </Col>
            </Row>
          )}

          <Row className="justify-content-center">
            {/* Informations de contact améliorées */}
            <Col lg={4} className="mb-4">
              <div className="sticky-top" style={{ top: "2rem" }}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="bg-primary text-white p-4">
                    <h4 className="mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Nos coordonnées
                    </h4>
                  </div>
                  
                  <Card.Body className="p-4">
                    <div className="mb-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Adresse</h6>
                          <p className="text-muted mb-0 small">
                            Avenue de lille 4<br />
                            4020 Liege, Belgique
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Téléphone</h6>
                          <p className="text-muted mb-0">
                            <a href="tel:+32467620878" className="text-decoration-none">+32 467 620 878</a>
                          </p>
                          <small className="text-success">
                            <i className="fas fa-circle me-1" style={{ fontSize: "6px" }}></i>
                            Disponible maintenant
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Email</h6>
                          <p className="text-muted mb-0">
                            <a href="mailto:info@princeaman.dev" className="text-decoration-none">
                              info@princeaman.dev
                            </a>
                          </p>
                          <small className="text-muted">Réponse sous 2h</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>

            {/* Formulaire de contact amélioré */}
            <Col lg={8}>
              <Card className="border-0 shadow rounded-4">
                <Card.Body className="p-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-dark mb-0">
                      <i className="fas fa-paper-plane text-primary me-2"></i>
                      Envoyez-nous un message
                    </h4>
                    {watchedCategory && (
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                        Réponse estimée : {getEstimatedResponseTime(watchedCategory)}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSubmit(onFormSubmit)}>
                    {/* Étape 1 : Informations personnelles */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">
                        <span className="badge bg-primary rounded-circle me-2">1</span>
                        Vos informations
                      </h6>
                      
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label className="fw-semibold">
                            Nom complet <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Votre nom complet"
                            {...register("name")}
                            isInvalid={!!errors.name}
                            isValid={dirtyFields.name && !errors.name}
                            disabled={isSubmitting}
                            className="rounded-3"
                          />
                          {errors.name && (
                            <Form.Control.Feedback type="invalid">
                              {errors.name.message}
                            </Form.Control.Feedback>
                          )}
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label className="fw-semibold">
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="votre@email.com"
                            {...register("email")}
                            isInvalid={!!errors.email}
                            isValid={dirtyFields.email && !errors.email}
                            disabled={isSubmitting}
                            className="rounded-3"
                          />
                          {errors.email && (
                            <Form.Control.Feedback type="invalid">
                              {errors.email.message}
                            </Form.Control.Feedback>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label className="fw-semibold">Téléphone</Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder="+32 467 630 978"
                            {...register("phone")}
                            isInvalid={!!errors.phone}
                            isValid={dirtyFields.phone && !errors.phone}
                            disabled={isSubmitting}
                            className="rounded-3"
                          />
                          {errors.phone && (
                            <Form.Control.Feedback type="invalid">
                              {errors.phone.message}
                            </Form.Control.Feedback>
                          )}
                          <Form.Text className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Optionnel - pour un retour plus rapide
                          </Form.Text>
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label className="fw-semibold">
                            Catégorie <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("category")}
                            isInvalid={!!errors.category}
                            isValid={dirtyFields.category && !errors.category}
                            disabled={isSubmitting}
                            className="rounded-3"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.category && (
                            <Form.Control.Feedback type="invalid">
                              {errors.category.message}
                            </Form.Control.Feedback>
                          )}
                          {watchedCategory && categories.find(c => c.value === watchedCategory)?.description && (
                            <Form.Text className="text-muted">
                              <i className="fas fa-lightbulb me-1"></i>
                              {categories.find(c => c.value === watchedCategory)?.description}
                            </Form.Text>
                          )}
                        </Col>
                      </Row>
                    </div>

                    <hr className="my-4" />

                    {/* Étape 2 : Votre message */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">
                        <span className="badge bg-primary rounded-circle me-2">2</span>
                        Votre message
                      </h6>

                      <div className="mb-3">
                        <Form.Label className="fw-semibold">
                          Sujet <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Résumez votre demande en quelques mots"
                          {...register("subject")}
                          isInvalid={!!errors.subject}
                          isValid={dirtyFields.subject && !errors.subject}
                          disabled={isSubmitting}
                          className="rounded-3"
                        />
                        {errors.subject && (
                          <Form.Control.Feedback type="invalid">
                            {errors.subject.message}
                          </Form.Control.Feedback>
                        )}
                      </div>

                      <div className="mb-4">
                        <Form.Label className="fw-semibold">
                          Message <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          placeholder="Décrivez votre demande en détail. Plus votre message est précis, plus notre réponse sera adaptée à vos besoins..."
                          {...register("message")}
                          isInvalid={!!errors.message}
                          isValid={dirtyFields.message && !errors.message}
                          disabled={isSubmitting}
                          className="rounded-3"
                          style={{ resize: "vertical" }}
                        />
                        {errors.message && (
                          <Form.Control.Feedback type="invalid">
                            {errors.message.message}
                          </Form.Control.Feedback>
                        )}
                        <div className="d-flex justify-content-between mt-2">
                          <Form.Text className="text-muted">
                            <i className="fas fa-pencil-alt me-1"></i>
                            Soyez précis pour une réponse personnalisée
                          </Form.Text>
                          <Form.Text className={`${watchedMessage?.length > 1800 ? 'text-warning' : 'text-muted'}`}>
                            {watchedMessage ? watchedMessage.length : 0} / 2000 caractères
                          </Form.Text>
                        </div>
                      </div>

                      {/* Options supplémentaires */}
                      <div className="bg-light rounded-3 p-3">
                        <Form.Check
                          type="checkbox"
                          id="urgent"
                          label="Demande urgente (réponse prioritaire)"
                          {...register("urgent")}
                          disabled={isSubmitting}
                          className="mb-2"
                        />
                        <Form.Check
                          type="checkbox"
                          id="newsletter"
                          label="Je souhaite recevoir les actualités de la bibliothèque"
                          {...register("newsletter")}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Pied du formulaire */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                      <div className="text-muted small">
                        <i className="fas fa-shield-alt text-success me-2"></i>
                        Vos données sont protégées et chiffrées selon les normes RGPD
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting || !isValid}
                        className="px-5 rounded-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* FAQ améliorée */}
          <Row className="mt-5">
            <Col>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-5">
                  <div className="text-center mb-5">
                    <h4 className="text-dark mb-3">
                      <i className="fas fa-question-circle text-primary me-2"></i>
                      Questions fréquentes
                    </h4>
                    <p className="text-muted">Trouvez rapidement les réponses aux questions les plus courantes</p>
                  </div>

                  <Row>
                    <Col md={6} className="mb-4">
                      <div className="h-100 p-3 bg-light rounded-3">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">
                            <i className="fas fa-book text-primary"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-2">Comment emprunter un livre ?</h6>
                            <p className="text-muted small mb-0">
                              Créez votre compte, parcourez notre catalogue de plus de 10,000 ouvrages et cliquez sur "Louer" pour réserver vos livres préférés instantanément.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-4">
                      <div className="h-100 p-3 bg-light rounded-3">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">
                            <i className="fas fa-calendar text-success"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-2">Durée de location ?</h6>
                            <p className="text-muted small mb-0">
                              30 jours standard avec possibilité de prolongation automatique si le livre n'est pas réservé par un autre utilisateur.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-4">
                      <div className="h-100 p-3 bg-light rounded-3">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">
                            <i className="fas fa-exclamation-triangle text-warning"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-2">Frais de retard ?</h6>
                            <p className="text-muted small mb-0">
                              1,50€ par jour de retard, avec notifications automatiques 3 jours avant l'échéance pour éviter les frais supplémentaires.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-4">
                      <div className="h-100 p-3 bg-light rounded-3">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">
                            <i className="fas fa-plus text-info"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-2">Demander un livre spécifique ?</h6>
                            <p className="text-muted small mb-0">
                              Utilisez notre formulaire avec la catégorie "Demande de livre". Nous évaluons chaque suggestion et ajoutons régulièrement de nouveaux titres.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Contact;