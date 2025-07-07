// frontend/src/pages/MyRentals.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, Spinner, Alert, Button, Badge, 
  Nav, Tab, Modal
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const MyRentals = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour voir vos locations");
      navigate("/login");
      return;
    }
    
    fetchRentals();
  }, [isAuthenticated, navigate]);

  const fetchRentals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rentals/detailed", {
        withCredentials: true,
      });
      console.log("✅ Locations récupérées:", res.data);
      setRentals(res.data.rentals);
      setStats({
        total: res.data.totalCount,
        active: res.data.activeRentals,
        overdue: res.data.overdueRentals
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des locations:", error);
      
      // Si erreur 401, rediriger vers login
      if (error.response?.status === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/login");
        return;
      }
      
      setError("Impossible de charger vos locations.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!selectedRental) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/rentals/return",
        { rentalId: selectedRental._id },
        { withCredentials: true }
      );

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 3000,
      });

      // Recharger les données
      fetchRentals();
      setShowReturnModal(false);
      setSelectedRental(null);
    } catch (error) {
      console.error("❌ Erreur lors du retour:", error);
      toast.error(error.response?.data?.message || "Erreur lors du retour du livre");
    }
  };

  const handlePayFine = async (rentalId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/pay-fine",
        { rentalId },
        { withCredentials: true }
      );
      const { url } = res.data;
      window.location.href = url;
    } catch (error) {
      console.error("❌ Erreur lors du paiement de l'amende:", error);
      toast.error("Erreur lors du paiement de l'amende");
    }
  };

  const getStatusBadge = (rental) => {
    switch (rental.detailedStatus) {
      case 'overdue':
        return <Badge bg="danger">En retard</Badge>;
      case 'due_soon':
        return <Badge bg="warning" text="dark">Échéance proche</Badge>;
      case 'returned':
        return <Badge bg="success">Retourné</Badge>;
      default:
        return <Badge bg="primary">En cours</Badge>;
    }
  };

  const getDaysRemainingText = (rental) => {
    if (rental.status === 'returned') return 'Retourné';
    
    const days = rental.daysRemaining;
    if (days < 0) return `${Math.abs(days)} jour(s) de retard`;
    if (days === 0) return 'Échéance aujourd\'hui';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  };

  const filterRentals = (rentals, filter) => {
    switch (filter) {
      case 'active':
        return rentals.filter(r => r.status === 'borrowed');
      case 'returned':
        return rentals.filter(r => r.status === 'returned');
      case 'overdue':
        return rentals.filter(r => r.detailedStatus === 'overdue');
      default:
        return rentals;
    }
  };

  // Si pas connecté, ne rien afficher (la redirection se fait dans useEffect)
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </Container>
    );
  }

  const filteredRentals = filterRentals(rentals, activeTab);

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">📚 Mes Locations</h2>
          <p className="text-muted mb-0">
            Gérez vos livres loués et vos retours
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
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-primary mb-1">{stats.total || 0}</h4>
              <p className="text-muted mb-0">Total</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-success mb-1">{stats.active || 0}</h4>
              <p className="text-muted mb-0">En cours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-danger mb-1">{stats.overdue || 0}</h4>
              <p className="text-muted mb-0">En retard</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-info mb-1">
                {rentals.filter(r => r.status === 'returned').length}
              </h4>
              <p className="text-muted mb-0">Retournés</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Onglets de filtrage */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="all">
              Toutes ({rentals.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="active">
              En cours ({stats.active || 0})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="overdue">
              En retard ({stats.overdue || 0})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="returned">
              Retournés ({rentals.filter(r => r.status === 'returned').length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {filteredRentals.length === 0 ? (
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
            <Row className="g-4">
              {filteredRentals.map((rental) => (
                <Col lg={6} key={rental._id}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex align-items-start gap-3">
                        <img
                          src={rental.book?.coverImage || "https://via.placeholder.com/80x120"}
                          alt={rental.book?.title}
                          style={{ width: "60px", height: "90px", objectFit: "cover" }}
                          className="rounded"
                        />
                        
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1 fw-bold">
                              {rental.book?.title || "Livre inconnu"}
                            </h6>
                            {getStatusBadge(rental)}
                          </div>
                          
                          <p className="text-muted mb-1 small">
                            {rental.book?.author}
                          </p>
                          
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              Loué le {new Date(rental.borrowedAt).toLocaleDateString('fr-FR')}
                            </small>
                          </div>

                          <div className="mb-2">
                            <small className={`fw-bold ${rental.daysRemaining < 0 ? 'text-danger' : rental.daysRemaining <= 3 ? 'text-warning' : 'text-success'}`}>
                              <i className="fas fa-clock me-1"></i>
                              {getDaysRemainingText(rental)}
                            </small>
                          </div>

                          {rental.fineAmount > 0 && (
                            <div className="mb-2">
                              <Badge bg="warning" text="dark">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Amende: {rental.fineAmount.toFixed(2)}€
                              </Badge>
                            </div>
                          )}

                          <div className="d-flex gap-2 mt-3">
                            {rental.canReturn && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => {
                                  setSelectedRental(rental);
                                  setShowReturnModal(true);
                                }}
                              >
                                <i className="fas fa-undo me-1"></i>
                                Retourner
                              </Button>
                            )}

                            {rental.needsFinePaid && (
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
                              className="btn btn-outline-info btn-sm"
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
          )}
        </Tab.Content>
      </Tab.Container>

      {/* Modal de confirmation de retour */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-undo me-2 text-success"></i>
            Retourner le livre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRental && (
            <div>
              <p>Vous êtes sur le point de retourner :</p>
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
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
              
              {selectedRental.daysRemaining < 0 && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Attention :</strong> Ce livre est en retard de {Math.abs(selectedRental.daysRemaining)} jour(s).
                  Une amende de {(Math.abs(selectedRental.daysRemaining) * 1.5).toFixed(2)}€ sera appliquée.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleReturnBook}>
            <i className="fas fa-check me-2"></i>
            Confirmer le retour
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyRentals;