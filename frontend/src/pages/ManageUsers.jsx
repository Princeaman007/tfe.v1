import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Row, Col, Card, Table, Button, Modal, Form, Badge,
  Spinner, Alert, Pagination, InputGroup, Dropdown
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Données du formulaire
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    isVerified: true
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/users", {
        params: {
          page: currentPage,
          limit: 10,
          search,
          role: roleFilter
        },
        withCredentials: true
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/stats", {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users", formData, {
        withCredentials: true
      });
      
      toast.success("Utilisateur créé avec succès!");
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isVerified: formData.isVerified
      }, {
        withCredentials: true
      });
      
      toast.success("Utilisateur mis à jour avec succès!");
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
        withCredentials: true
      });
      
      toast.success("Utilisateur supprimé avec succès!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}/password`, {
        newPassword
      }, {
        withCredentials: true
      });
      
      toast.success("Mot de passe mis à jour avec succès!");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${userId}/verify`, {}, {
        withCredentials: true
      });
      
      toast.success("Statut de vérification mis à jour!");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
      isVerified: true
    });
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const getRoleBadge = (role) => {
    const variants = {
      user: "secondary",
      admin: "primary",
      superAdmin: "danger"
    };
    return <Badge bg={variants[role] || "secondary"}>{role}</Badge>;
  };

  const getVerificationBadge = (isVerified) => {
    return (
      <Badge bg={isVerified ? "success" : "warning"}>
        {isVerified ? "Vérifié" : "Non vérifié"}
      </Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">👥 Gestion des Utilisateurs</h2>
          <p className="text-muted mb-0">Créer, modifier et gérer les utilisateurs</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Créer un utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-primary mb-1">{stats.totalUsers || 0}</h4>
              <p className="text-muted mb-0">Total utilisateurs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-success mb-1">{stats.verifiedUsers || 0}</h4>
              <p className="text-muted mb-0">Vérifiés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-warning mb-1">{stats.unverifiedUsers || 0}</h4>
              <p className="text-muted mb-0">Non vérifiés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <h4 className="text-info mb-1">{stats.newUsersThisMonth || 0}</h4>
              <p className="text-muted mb-0">Nouveaux ce mois</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
            <option value="superAdmin">Super Admin</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setCurrentPage(1);
            }}
          >
            <i className="fas fa-times me-2"></i>
            Réinitialiser
          </Button>
        </Col>
      </Row>

      {/* Table des utilisateurs */}
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <h5 className="text-muted">Aucun utilisateur trouvé</h5>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2"
                          style={{ width: "35px", height: "35px", fontSize: "0.8rem" }}
                        >
                          {userItem.name.charAt(0).toUpperCase()}
                        </div>
                        {userItem.name}
                      </div>
                    </td>
                    <td>{userItem.email}</td>
                    <td>{getRoleBadge(userItem.role)}</td>
                    <td>{getVerificationBadge(userItem.isVerified)}</td>
                    <td>{new Date(userItem.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <i className="fas fa-ellipsis-v"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openEditModal(userItem)}>
                            <i className="fas fa-edit me-2"></i>
                            Modifier
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => openPasswordModal(userItem)}>
                            <i className="fas fa-key me-2"></i>
                            Changer mot de passe
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleToggleVerification(userItem._id)}>
                            <i className="fas fa-check-circle me-2"></i>
                            {userItem.isVerified ? "Marquer non vérifié" : "Marquer vérifié"}
                          </Dropdown.Item>
                          {user?.role === "superAdmin" && userItem.role !== "superAdmin" && (
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => openDeleteModal(userItem)}
                            >
                              <i className="fas fa-trash me-2"></i>
                              Supprimer
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

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
              onClick={() => setCurrentPage(prev => prev - 1)}
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
              onClick={() => setCurrentPage(prev => prev + 1)}
            />
            <Pagination.Last
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            />
          </Pagination>
        </div>
      )}

      {/* Modal Créer Utilisateur */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus me-2 text-primary"></i>
            Créer un utilisateur
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Minimum 6 caractères
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    {user?.role === "superAdmin" && (
                      <option value="superAdmin">Super Admin</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Compte vérifié"
                checked={formData.isVerified}
                onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>
              Créer l'utilisateur
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Modifier Utilisateur */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2 text-warning"></i>
            Modifier l'utilisateur
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    disabled={selectedUser?.role === "superAdmin" && user?.role !== "superAdmin"}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    {user?.role === "superAdmin" && (
                      <option value="superAdmin">Super Admin</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut de vérification</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Compte vérifié"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                    className="mt-2"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button variant="warning" type="submit">
              <i className="fas fa-save me-2"></i>
              Sauvegarder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Changer Mot de Passe */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-key me-2 text-info"></i>
            Changer le mot de passe
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePassword}>
          <Modal.Body>
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              Vous changez le mot de passe de <strong>{selectedUser?.name}</strong>
            </Alert>
            
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Form.Text className="text-muted">
                Minimum 6 caractères
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Annuler
            </Button>
            <Button variant="info" type="submit">
              <i className="fas fa-save me-2"></i>
              Changer le mot de passe
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Supprimer Utilisateur */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2 text-danger"></i>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="fas fa-warning me-2"></i>
            <strong>Attention !</strong> Cette action est irréversible.
          </Alert>
          
          <p>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.name}</strong> ?
          </p>
          
          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Email :</strong> {selectedUser?.email}<br />
              <strong>Rôle :</strong> {selectedUser?.role}<br />
              <strong>Créé le :</strong> {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            <i className="fas fa-trash me-2"></i>
            Supprimer définitivement
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageUsers;