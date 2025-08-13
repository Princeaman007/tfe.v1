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
      console.log('📋 Récupération utilisateurs...', {
        page: currentPage,
        limit: 10,
        search,
        role: roleFilter
      });

      const response = await axios.get("http://localhost:5000/api/users", {
        params: {
          page: currentPage,
          limit: 10,
          search,
          role: roleFilter
        },
        withCredentials: true
      });

      console.log('✅ Utilisateurs reçus:', response.data);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour accéder à cette fonctionnalité");
      } else if (error.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors du chargement des utilisateurs");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Récupération statistiques...');
      
      const response = await axios.get("http://localhost:5000/api/users/stats", {
        withCredentials: true
      });
      
      console.log('✅ Statistiques reçues:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des statistiques:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.status !== 403) {
        toast.error("Erreur lors du chargement des statistiques");
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validations côté client
    if (!formData.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    
    if (formData.name.length < 2 || formData.name.length > 50) {
      toast.error("Le nom doit contenir entre 2 et 50 caractères");
      return;
    }
    
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(formData.name)) {
      toast.error("Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("L'email est obligatoire");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Format d'email invalide");
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    // Validation du format du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");
      return;
    }
    
    try {
      console.log("📤 Création utilisateur par admin...");
      console.log("📋 Données:", { ...formData, password: '***' });
      
      // ✅ Préparer les données selon la validation serveur
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.password, // ✅ Ajout du champ manquant
        // ✅ Envoyer role et isVerified seulement si votre validation l'autorise
        ...(formData.role && { role: formData.role }),
        ...(typeof formData.isVerified === 'boolean' && { isVerified: formData.isVerified })
      };

      console.log("📋 Données envoyées au serveur:", { ...requestData, password: '***', confirmPassword: '***' });
      
      await axios.post("http://localhost:5000/api/users", requestData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success("Utilisateur créé avec succès!");
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("❌ Erreur création utilisateur:", error);
      console.error("📋 Réponse serveur COMPLÈTE:", JSON.stringify(error.response?.data, null, 2));
      console.error("📋 Status:", error.response?.status);
      console.error("📋 Headers:", error.response?.headers);
      
      // Afficher les détails de l'erreur pour debug
      if (error.response?.data) {
        console.log("🔍 Détails de l'erreur:");
        console.log("- Message:", error.response.data.message);
        console.log("- Errors:", error.response.data.errors);
        console.log("- Success:", error.response.data.success);
      }
      
      if (error.response?.data?.errors) {
        // Erreurs de validation express-validator
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => `${err.path || err.field}: ${err.msg}`).join('\n');
        toast.error(`Erreurs de validation:\n${errorMessages}`);
      } else if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour effectuer cette action");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Données invalides - Vérifiez les logs de la console");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la création");
      }
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Validations côté client
    if (!formData.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("L'email est obligatoire");
      return;
    }
    
    try {
      console.log("📝 Mise à jour utilisateur:", selectedUser._id);
      
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
      console.error("❌ Erreur mise à jour utilisateur:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour effectuer cette action");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
      }
    }
  };

  const handleDeleteUser = async () => {
    try {
      console.log("🗑️ Suppression utilisateur:", selectedUser._id);
      
      await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
        withCredentials: true
      });

      toast.success("Utilisateur supprimé avec succès!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("❌ Erreur suppression utilisateur:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error("Seul un super admin peut supprimer des utilisateurs");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Validation du format du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");
      return;
    }

    try {
      console.log("🔑 Changement de mot de passe pour:", selectedUser.name);
      
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}/reset-password`, {
        newPassword,
        confirmNewPassword: newPassword,
        notifyUser: true
      }, {
        withCredentials: true
      });
      
      toast.success("Mot de passe réinitialisé avec succès! L'utilisateur a été notifié par email.");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      console.error("❌ Erreur changement de mot de passe:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg).join(', ');
        toast.error(errorMessages);
      } else if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour effectuer cette action");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
      }
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      console.log("🔄 Basculement vérification pour:", userId);
      
      await axios.patch(`http://localhost:5000/api/users/${userId}/verify`, {}, {
        withCredentials: true
      });

      toast.success("Statut de vérification mis à jour!");
      fetchUsers();
    } catch (error) {
      console.error("❌ Erreur basculement vérification:", error);
      console.error("📋 Réponse serveur:", error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour effectuer cette action");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
      }
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
    setNewPassword("");
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
          <h2 className="fw-bold text-primary mb-1">Gestion des Utilisateurs</h2>
          <p className="text-muted mb-0">Créer, modifier et gérer les utilisateurs</p>
        </div>
        {(user?.role === "admin" || user?.role === "superAdmin") && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Créer un utilisateur
          </Button>
        )}
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
              <p className="mt-2 text-muted">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <h5 className="text-muted">Aucun utilisateur trouvé</h5>
              {search || roleFilter ? (
                <p className="text-muted">Essayez de modifier vos critères de recherche</p>
              ) : null}
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
                          {/* Modifier - Admin/SuperAdmin */}
                          {(user?.role === "admin" || user?.role === "superAdmin") && (
                            <Dropdown.Item onClick={() => openEditModal(userItem)}>
                              <i className="fas fa-edit me-2"></i>
                              Modifier
                            </Dropdown.Item>
                          )}
                          
                          {/* Changer mot de passe - Admin/SuperAdmin */}
                          {/* {(user?.role === "admin" || user?.role === "superAdmin") && (
                            <Dropdown.Item onClick={() => openPasswordModal(userItem)}>
                              <i className="fas fa-key me-2"></i>
                              Réinitialiser mot de passe
                            </Dropdown.Item>
                          )} */}
                          
                          {/* Basculer vérification - Admin/SuperAdmin */}
                          {(user?.role === "admin" || user?.role === "superAdmin") && (
                            <Dropdown.Item onClick={() => handleToggleVerification(userItem._id)}>
                              <i className="fas fa-check-circle me-2"></i>
                              {userItem.isVerified ? "Marquer non vérifié" : "Marquer vérifié"}
                            </Dropdown.Item>
                          )}
                          
                          {/* Supprimer - SuperAdmin uniquement et pas sur autre SuperAdmin */}
                          {user?.role === "superAdmin" && userItem.role !== "superAdmin" && userItem._id !== user.id && (
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
                  <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom complet"
                    required
                  />
                  <Form.Text className="text-muted">
                    2-50 caractères, lettres uniquement
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemple.com"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mot de passe temporaire"
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Min. 6 caractères avec majuscule, minuscule et chiffre
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                label="Compte vérifié (l'utilisateur recevra un email de bienvenue)"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              />
            </Form.Group>

            <Alert variant="info" className="small">
              <i className="fas fa-info-circle me-2"></i>
              L'utilisateur recevra ses identifiants par email et devra changer son mot de passe lors de sa première connexion.
            </Alert>
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
                  <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={selectedUser?.role === "superAdmin" && user?.role !== "superAdmin"}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    {user?.role === "superAdmin" && (
                      <option value="superAdmin">Super Admin</option>
                    )}
                  </Form.Select>
                  {selectedUser?.role === "superAdmin" && user?.role !== "superAdmin" && (
                    <Form.Text className="text-muted">
                      Seul un super admin peut modifier le rôle d'un autre super admin
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut de vérification</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Compte vérifié"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="mt-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            {selectedUser?._id === user?.id && (
              <Alert variant="warning" className="small">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Vous modifiez votre propre profil. Soyez prudent avec les changements de rôle.
              </Alert>
            )}
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
            Réinitialiser le mot de passe
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePassword}>
          <Modal.Body>
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              Vous réinitialisez le mot de passe de <strong>{selectedUser?.name}</strong>
              <br />
              <small>L'utilisateur sera automatiquement notifié par email avec le nouveau mot de passe temporaire.</small>
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
              <Form.Text className="text-muted">
                Doit contenir au moins une minuscule, une majuscule et un chiffre
              </Form.Text>
            </Form.Group>

            <Alert variant="warning" className="small">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Important :</strong> L'utilisateur devrait changer ce mot de passe lors de sa prochaine connexion pour des raisons de sécurité.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Annuler
            </Button>
            <Button variant="info" type="submit">
              <i className="fas fa-save me-2"></i>
              Réinitialiser le mot de passe
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
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Attention !</strong> Cette action est irréversible.
          </Alert>

          <p>
            Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur <strong>{selectedUser?.name}</strong> ?
          </p>

          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Email :</strong> {selectedUser?.email}<br />
              <strong>Rôle :</strong> {selectedUser?.role}<br />
              <strong>Créé le :</strong> {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
            </small>
          </div>

          <Alert variant="warning" className="mt-3 small">
            <i className="fas fa-info-circle me-2"></i>
            Toutes les données associées à cet utilisateur seront perdues définitivement.
          </Alert>
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