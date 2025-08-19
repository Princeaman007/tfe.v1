// src/pages/MyRentals.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { returnBookSchema, extendDueDateSchema, rentalSearchSchema } from "../schemas/rentalSchema";
import axios from "axios";
import {
  Container, Row, Col, Card, Spinner, Alert, Button, Badge,
  Nav, Tab, Modal, Form, InputGroup, Pagination
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from '../../config.js';; 

const MyRentals = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // États principaux
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({});

  // Pagination et filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRentals, setTotalRentals] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    overdue: "",
    startDate: "",
    endDate: ""
  });

  // États des modals
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // ✅ FONCTIONS UTILITAIRES
  
  // Calculer les jours restants avec gestion robuste
  const calculateDaysRemaining = (dueDate, returnedAt = null) => {
    try {
      const due = new Date(dueDate);
      const now = returnedAt ? new Date(returnedAt) : new Date();
      
      // Vérifier que les dates sont valides
      if (isNaN(due.getTime()) || isNaN(now.getTime())) {
        console.warn("Date invalide pour le calcul des jours restants:", { dueDate, returnedAt });
        return 0;
      }
      
      // Réinitialiser les heures pour comparer seulement les dates
      due.setHours(23, 59, 59, 999);
      now.setHours(0, 0, 0, 0);
      
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error("Erreur calcul jours restants:", error);
      return 0;
    }
  };

  // Obtenir les jours restants avec fallback
  const getDaysRemaining = (rental) => {
    // Priorité : daysRemaining du backend, sinon calcul frontend
    if (rental.daysRemaining !== undefined && rental.daysRemaining !== null) {
      return rental.daysRemaining;
    }
    return calculateDaysRemaining(rental.dueDate);
  };

  // Vérifier si en retard avec fallback
  const isRentalOverdue = (rental) => {
    if (rental.status === 'returned') return false;
    if (rental.overdue !== undefined) return rental.overdue;
    return getDaysRemaining(rental) < 0;
  };

  // Calcul d'amende robuste
  const calculateFine = (rental, finePerDay = 1.5) => {
    const daysRemaining = getDaysRemaining(rental);
    if (daysRemaining >= 0) return 0;
    return Math.abs(daysRemaining) * finePerDay;
  };

  // Formater date pour datetime-local
  const formatDateForInput = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return '';
    }
  };

  // Form pour le retour de livre
  const {
    register: registerReturn,
    handleSubmit: handleSubmitReturn,
    formState: { errors: returnErrors, isSubmitting: isReturning }
  } = useForm({
    resolver: zodResolver(returnBookSchema),
    mode: "onChange"
  });

  // Form pour l'extension de date
  const {
    register: registerExtend,
    handleSubmit: handleSubmitExtend,
    setValue: setExtendValue,
    formState: { errors: extendErrors, isSubmitting: isExtending }
  } = useForm({
    resolver: zodResolver(extendDueDateSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour voir vos locations");
      navigate("/login");
      return;
    }

    fetchRentals();
  }, [isAuthenticated, navigate, currentPage, activeTab, filters]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📚 Chargement des locations...");

      const params = {
        page: currentPage,
        limit: 6,
        sortBy: "borrowedAt",
        sortOrder: "desc"
      };

      // Ajouter les filtres selon l'onglet actif
      if (activeTab === "active") {
        params.status = "borrowed";
      } else if (activeTab === "returned") {
        params.status = "returned";
      } else if (activeTab === "overdue") {
        params.overdue = true;
      }

      // Ajouter les filtres personnalisés
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await axios.get(`${API_BASE_URL}/api/rentals`, {
        params,
        withCredentials: true,
        timeout: 15000
      });

      console.log("✅ Locations chargées:", response.data);

      // Adapter selon la structure de votre API
      if (response.data.rentals) {
        setRentals(response.data.rentals);
        setTotalPages(response.data.totalPages || 1);
        setTotalRentals(response.data.totalCount || 0);
        setStats({
          total: response.data.totalCount || 0,
          active: response.data.activeRentals || 0,
          overdue: response.data.overdueRentals || 0
        });
      } else if (Array.isArray(response.data)) {
        setRentals(response.data);
        setTotalPages(1);
        setTotalRentals(response.data.length);
      } else {
        setRentals([]);
      }

    } catch (err) {
      console.error("❌ Erreur chargement locations:", err);

      if (err.response?.status === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/login");
        return;
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas les permissions pour voir vos locations.");
      } else {
        setError("Impossible de charger vos locations.");
      }

      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit retour corrigé
  const onReturnSubmit = async (data) => {
    try {
      console.log("📤 Retour de livre:", selectedRental._id, data);

      // Le schéma Zod gère la transformation
      const response = await axios.post(
        `${API_BASE_URL}/api/rentals/return`,
        {
          rentalId: selectedRental._id,
          returnedAt: data.returnedAt,
          fineAmount: data.fineAmount || 0
        },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      console.log("✅ Livre retourné:", response.data);
      toast.success(response.data.message || "Livre retourné avec succès !");

      setShowReturnModal(false);
      setSelectedRental(null);
      await fetchRentals();

    } catch (error) {
      console.error("❌ Erreur retour livre:", error);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg || err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || "Erreur lors du retour du livre");
      }
    }
  };

  // ✅ Submit extension corrigé
  const onExtendSubmit = async (data) => {
    try {
      console.log("📅 Extension de date:", selectedRental._id, data);

      // Le schéma Zod transforme déjà en ISO string
      const response = await axios.put(
        `${API_BASE_URL}/api/rentals/${selectedRental._id}/extend`,
        { newDueDate: data.newDueDate },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      console.log("✅ Date étendue:", response.data);
      toast.success("Date d'échéance prolongée avec succès !");

      setShowExtendModal(false);
      setSelectedRental(null);
      await fetchRentals();

    } catch (error) {
      console.error("❌ Erreur extension date:", error);
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg || err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de l'extension");
      }
    }
  };

  const handlePayFine = async (rentalId) => {
    try {
      console.log("💳 Paiement amende pour:", rentalId);

      const response = await axios.post(
        `${API_BASE_URL}/api/payment/pay-fine`,
        { rentalId },
        { withCredentials: true }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.success("Amende payée avec succès !");
        await fetchRentals();
      }
    } catch (error) {
      console.error("❌ Erreur paiement amende:", error);
      toast.error("Erreur lors du paiement de l'amende");
    }
  };

  // ✅ Modal de retour corrigé
  const openReturnModal = (rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
  };

  // ✅ Modal d'extension corrigé
  const openExtendModal = (rental) => {
    setSelectedRental(rental);

    // Calculer la nouvelle date (7 jours supplémentaires)
    const currentDueDate = new Date(rental.dueDate);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);
    
    // S'assurer que la date est dans le futur
    const now = new Date();
    if (newDueDate <= now) {
      newDueDate.setTime(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 jours à partir de maintenant
    }

    // Format pour datetime-local
    const formattedDate = formatDateForInput(newDueDate);
    
    setExtendValue("newDueDate", formattedDate);
    setShowExtendModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      overdue: "",
      startDate: "",
      endDate: ""
    });
    setCurrentPage(1);
  };

  // ✅ Badge de statut robuste
  const getStatusBadge = (rental) => {
    if (rental.status === 'returned') {
      return <Badge bg="success">Retourné</Badge>;
    }

    const daysRemaining = getDaysRemaining(rental);
    const overdue = isRentalOverdue(rental);

    if (overdue || daysRemaining < 0) {
      return <Badge bg="danger">En retard</Badge>;
    }

    if (daysRemaining <= 3) {
      return <Badge bg="warning" text="dark">Échéance proche</Badge>;
    }

    return <Badge bg="primary">En cours</Badge>;
  };

  // ✅ Texte des jours restants robuste
  const getDaysRemainingText = (rental) => {
    if (rental.status === 'returned') return 'Retourné';

    const daysRemaining = getDaysRemaining(rental);
    
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} jour(s) de retard`;
    }
    if (daysRemaining === 0) {
      return 'Échéance aujourd\'hui';
    }
    if (daysRemaining === 1) {
      return '1 jour restant';
    }
    return `${daysRemaining} jours restants`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Si pas connecté, ne rien afficher
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement de vos locations...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="fas fa-book-reader me-2"></i>
            Mes Locations
          </h2>
          <p className="text-muted mb-0">
            Gérez vos livres loués et vos retours • {totalRentals} location{totalRentals > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary">
          <i className="fas fa-arrow-left me-2"></i>
          Retour à la bibliothèque
        </Link>
      </div>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-primary mb-2">
                <i className="fas fa-book" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-primary mb-1">{stats.total || 0}</h3>
              <p className="text-muted mb-0 small">Total locations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-success mb-2">
                <i className="fas fa-clock" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-success mb-1">{stats.active || 0}</h3>
              <p className="text-muted mb-0 small">En cours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-danger mb-2">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-danger mb-1">{stats.overdue || 0}</h3>
              <p className="text-muted mb-0 small">En retard</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-info mb-2">
                <i className="fas fa-check-circle" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-info mb-1">
                {rentals.filter(r => r.status === 'returned').length}
              </h3>
              <p className="text-muted mb-0 small">Retournés</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Label className="small text-muted">STATUT</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="borrowed">En cours</option>
                <option value="returned">Retournés</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="small text-muted">RETARD</Form.Label>
              <Form.Select
                value={filters.overdue}
                onChange={(e) => handleFilterChange("overdue", e.target.value)}
              >
                <option value="">Tous</option>
                <option value="true">En retard</option>
                <option value="false">À jour</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="small text-muted">DATE DÉBUT</Form.Label>
              <Form.Control
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Label className="small text-muted">DATE FIN</Form.Label>
              <Form.Control
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </Col>

            <Col md={1}>
              <Button variant="outline-secondary" onClick={resetFilters} title="Réinitialiser">
                <i className="fas fa-times"></i>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Onglets */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="all">
              <i className="fas fa-list me-2"></i>
              Toutes ({totalRentals})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="active">
              <i className="fas fa-clock me-2"></i>
              En cours ({stats.active || 0})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="overdue">
              <i className="fas fa-exclamation-triangle me-2"></i>
              En retard ({stats.overdue || 0})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="returned">
              <i className="fas fa-check-circle me-2"></i>
              Retournés ({rentals.filter(r => r.status === 'returned').length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
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
                  fetchRentals();
                }}
              >
                Réessayer
              </Button>
            </Alert>
          ) : rentals.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-book-open text-muted" style={{ fontSize: "4rem" }}></i>
              </div>
              <h4 className="text-muted">Aucune location trouvée</h4>
              <p className="text-muted mb-4">
                {activeTab === 'all'
                  ? "Vous n'avez pas encore loué de livre."
                  : `Aucune location dans la catégorie "${activeTab}".`
                }
              </p>
              <Link to="/dashboard" className="btn btn-primary">
                <i className="fas fa-book me-2"></i>
                Explorer les livres
              </Link>
            </div>
          ) : (
            <>
              <Row className="g-4">
                {rentals.map((rental) => (
                  <Col lg={6} key={rental._id}>
                    <Card className="h-100 shadow-sm border-0 hover-shadow">
                      <Card.Body>
                        <div className="d-flex align-items-start gap-3">
                          <img
                            src={rental.book?.coverImage || "https://via.placeholder.com/80x120?text=Livre"}
                            alt={rental.book?.title}
                            style={{ width: "60px", height: "90px", objectFit: "cover" }}
                            className="rounded shadow-sm"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80x120?text=Livre";
                            }}
                          />

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-1 fw-bold">
                                {rental.book?.title || "Livre inconnu"}
                              </h6>
                              {getStatusBadge(rental)}
                            </div>

                            <p className="text-muted mb-1 small">
                              <i className="fas fa-user me-1"></i>
                              {rental.book?.author || "Auteur inconnu"}
                            </p>

                            <div className="mb-2">
                              <small className="text-muted">
                                <i className="fas fa-calendar me-1"></i>
                                Emprunté le {formatDate(rental.borrowedAt)}
                              </small>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted">
                                <i className="fas fa-calendar-check me-1"></i>
                                Échéance: {formatDate(rental.dueDate)}
                              </small>
                            </div>

                            {/* ✅ Affichage des jours restants corrigé */}
                            <div className="mb-3">
                              <small className={`fw-bold ${(() => {
                                const daysRemaining = getDaysRemaining(rental);
                                if (daysRemaining < 0) return 'text-danger';
                                if (daysRemaining <= 3) return 'text-warning';
                                return 'text-success';
                              })()}`}>
                                <i className="fas fa-clock me-1"></i>
                                {getDaysRemainingText(rental)}
                              </small>
                            </div>

                            {rental.fineAmount > 0 && (
                              <div className="mb-3">
                                <Badge bg={rental.finePaid ? "success" : "warning"} text="dark">
                                  <i className={`fas ${rental.finePaid ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-1`}></i>
                                  Amende: {rental.fineAmount.toFixed(2)}€
                                  {rental.finePaid ? " (payée)" : " (à payer)"}
                                </Badge>
                              </div>
                            )}

                            {rental.status === 'returned' && rental.returnedAt && (
                              <div className="mb-3">
                                <small className="text-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Retourné le {formatDate(rental.returnedAt)}
                                </small>
                              </div>
                            )}

                            {/* ✅ Boutons d'action corrigés */}
                            <div className="d-flex gap-2 flex-wrap">
                              {rental.status === 'borrowed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => openReturnModal(rental)}
                                  >
                                    <i className="fas fa-undo me-1"></i>
                                    Retourner
                                  </Button>

                                  {/* <Button
                                    size="sm"
                                    variant="info"
                                    onClick={() => openExtendModal(rental)}
                                    disabled={getDaysRemaining(rental) < -7} 
                                  >
                                    <i className="fas fa-calendar-plus me-1"></i>
                                    Prolonger
                                  </Button> */}
                                </>
                              )}

                              {rental.fineAmount > 0 && !rental.finePaid && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => handlePayFine(rental._id)}
                                >
                                  <i className="fas fa-credit-card me-1"></i>
                                  Payer l'amende
                                </Button>
                              )}

                              <Link
                                to={`/books/${rental.book?._id}`}
                                className="btn btn-outline-secondary btn-sm"
                              >
                                <i className="fas fa-eye me-1"></i>
                                Voir le livre
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <Pagination className="mb-0">
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

                  <div className="ms-3 text-muted small">
                    Page {currentPage} sur {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </Tab.Content>
      </Tab.Container>

      {/* ✅ Modal de retour corrigé */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-undo me-2 text-success"></i>
            Retourner le livre
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmitReturn(onReturnSubmit)}>
          <Modal.Body>
            {selectedRental && (
              <>
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-3">
                  <img
                    src={selectedRental.book?.coverImage || "https://via.placeholder.com/60x90"}
                    alt={selectedRental.book?.title}
                    style={{ width: "50px", height: "75px", objectFit: "cover" }}
                    className="rounded"
                  />
                  <div>
                    <h6 className="mb-1">{selectedRental.book?.title}</h6>
                    <p className="text-muted mb-0 small">{selectedRental.book?.author}</p>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Date de retour</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...registerReturn("returnedAt")}
                    isInvalid={!!returnErrors.returnedAt}
                    disabled={isReturning}
                    defaultValue={formatDateForInput(new Date())}
                    max={formatDateForInput(new Date())} // Empêcher dates futures
                  />
                  {returnErrors.returnedAt && (
                    <Form.Control.Feedback type="invalid">
                      {returnErrors.returnedAt.message}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Par défaut: maintenant
                  </Form.Text>
                </Form.Group>

                {getDaysRemaining(selectedRental) < 0 && (
                  <>
                    <Alert variant="warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Attention :</strong> Ce livre est en retard de {Math.abs(getDaysRemaining(selectedRental))} jour(s).
                    </Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>Montant de l'amende (€)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        {...registerReturn("fineAmount")}
                        isInvalid={!!returnErrors.fineAmount}
                        disabled={isReturning}
                        defaultValue={calculateFine(selectedRental).toFixed(2)}
                      />
                      {returnErrors.fineAmount && (
                        <Form.Control.Feedback type="invalid">
                          {returnErrors.fineAmount.message}
                        </Form.Control.Feedback>
                      )}
                      <Form.Text className="text-muted">
                        Calculé automatiquement : {Math.abs(getDaysRemaining(selectedRental))} jour(s) × 1,50€
                      </Form.Text>
                    </Form.Group>
                  </>
                )}

                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>
                  Le retour sera confirmé immédiatement après validation.
                </Alert>
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowReturnModal(false)}
              disabled={isReturning}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button
              variant="success"
              type="submit"
              disabled={isReturning}
            >
              {isReturning ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Retour en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  Confirmer le retour
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* ✅ Modal d'extension corrigé */}
      <Modal show={showExtendModal} onHide={() => setShowExtendModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-plus me-2 text-info"></i>
            Prolonger la location
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmitExtend(onExtendSubmit)}>
          <Modal.Body>
            {selectedRental && (
              <>
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-3">
                  <img
                    src={selectedRental.book?.coverImage || "https://via.placeholder.com/60x90"}
                    alt={selectedRental.book?.title}
                    style={{ width: "50px", height: "75px", objectFit: "cover" }}
                    className="rounded"
                  />
                  <div>
                    <h6 className="mb-1">{selectedRental.book?.title}</h6>
                    <p className="text-muted mb-0 small">{selectedRental.book?.author}</p>
                    <small className="text-info">
                      Échéance actuelle: {formatDate(selectedRental.dueDate)}
                    </small>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Nouvelle date d'échéance <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...registerExtend("newDueDate")}
                    isInvalid={!!extendErrors.newDueDate}
                    disabled={isExtending}
                    min={formatDateForInput(new Date())} // Empêcher les dates passées
                  />
                  {extendErrors.newDueDate && (
                    <Form.Control.Feedback type="invalid">
                      {extendErrors.newDueDate.message}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    La nouvelle échéance doit être dans le futur
                  </Form.Text>
                </Form.Group>

                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note :</strong> L'extension peut entraîner des frais supplémentaires selon les conditions de location.
                </Alert>

                {getDaysRemaining(selectedRental) < -3 && (
                  <Alert variant="warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Ce livre est déjà en retard. L'extension peut ne pas être autorisée.
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowExtendModal(false)}
              disabled={isExtending}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button
              variant="info"
              type="submit"
              disabled={isExtending}
            >
              {isExtending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Extension...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-plus me-2"></i>
                  Prolonger
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

export default MyRentals;