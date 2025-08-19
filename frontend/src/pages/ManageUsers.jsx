import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Row, Col, Card, Table, Button, Modal, Badge,
  Spinner, Alert, Pagination, InputGroup, Dropdown
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import UserFormModal from "../components/UserForm";
import { API_BASE_URL } from '../../config.js';;

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

  // Données sélectionnées
  const [selectedUser, setSelectedUser] = useState(null);

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

      const response = await axios.get(`${API_BASE_URL}/api/users`, {
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

      const response = await axios.get(`${API_BASE_URL}/api/users/stats`, {
        withCredentials: true
      });

      console.log('✅ Statistiques reçues:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des statistiques:", error);

      if (error.response?.status !== 403) {
        toast.error("Erreur lors du chargement des statistiques");
      }
    }
  };

 const handleCreateUser = async (userData) => {
  try {
    console.log("📤 Création utilisateur - userData:", userData);
    console.log("📤 Création utilisateur - JSON:", JSON.stringify(userData));
    
    await axios.post(`${API_BASE_URL}/api/users`, userData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    toast.success("Utilisateur créé avec succès!");
    setShowCreateModal(false);
    fetchUsers();
    fetchStats();
  } catch (error) {
    console.error("❌ Erreur création utilisateur:", error);
    console.error("📋 Détails erreur:", error.response?.data);
    console.error("🚨 Erreurs spécifiques:", JSON.stringify(error.response?.data?.errors, null, 2));
    
    throw error;
  }
};

  const handleUpdateUser = async (userId, userData) => {
    try {
      console.log("📝 AVANT envoi - userId:", userId);
      console.log("📝 AVANT envoi - userData:", userData);
      console.log("📝 AVANT envoi - JSON:", JSON.stringify(userData));

      // ✅ FORCEZ le Content-Type
      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'  // ← Ajoutez ceci
        }
      });

      console.log("✅ Réponse serveur:", response.data);

      toast.success("Utilisateur mis à jour avec succès!");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("❌ Erreur mise à jour utilisateur:", error);

      // L'erreur sera gérée par UserFormModal
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    try {
      console.log("🗑️ Suppression utilisateur:", selectedUser._id);

      await axios.delete(`${API_BASE_URL}/api/users/${selectedUser._id}`, {
        withCredentials: true
      });

      toast.success("Utilisateur supprimé avec succès!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("❌ Erreur suppression utilisateur:", error);

      if (error.response?.status === 403) {
        toast.error("Seul un super admin peut supprimer des utilisateurs");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      console.log("🔄 Basculement vérification pour:", userId);

      await axios.patch(`${API_BASE_URL}/api/users/${userId}/verify`, {}, {
        withCredentials: true
      });

      toast.success("Statut de vérification mis à jour!");
      fetchUsers();
    } catch (error) {
      console.error("❌ Erreur basculement vérification:", error);

      if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les droits pour effectuer cette action");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
      }
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const openDeleteModal = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
  };

  const getRoleBadge = (role) => {
    const variants = {
      user: "secondary",
      admin: "primary",
      superAdmin: "danger"
    };
    const labels = {
      user: "Utilisateur",
      admin: "Admin",
      superAdmin: "Super Admin"
    };
    return <Badge bg={variants[role] || "secondary"}>{labels[role] || role}</Badge>;
  };

  const getVerificationBadge = (isVerified) => {
    return (
      <Badge bg={isVerified ? "success" : "warning"}>
        <i className={`fas ${isVerified ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-1`}></i>
        {isVerified ? "Vérifié" : "Non vérifié"}
      </Badge>
    );
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    return nameParts.map(part => part[0].toUpperCase()).join("").slice(0, 2);
  };

  const getAvatarColor = (role) => {
    switch (role) {
      case 'superAdmin': return '#dc3545';
      case 'admin': return '#fd7e14';
      default: return '#007bff';
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="fas fa-users me-2"></i>
            Gestion des Utilisateurs
          </h2>
          <p className="text-muted mb-0">Créer, modifier et gérer les utilisateurs de la plateforme</p>
        </div>
        {(user?.role === "admin" || user?.role === "superAdmin") && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <i className="fas fa-user-plus"></i>
            Nouvel utilisateur
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-primary mb-2">
                <i className="fas fa-users" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-primary mb-1">{stats.totalUsers || 0}</h3>
              <p className="text-muted mb-0 small">Total utilisateurs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-success mb-2">
                <i className="fas fa-check-circle" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-success mb-1">{stats.verifiedUsers || 0}</h3>
              <p className="text-muted mb-0 small">Comptes vérifiés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-warning mb-2">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-warning mb-1">{stats.unverifiedUsers || 0}</h3>
              <p className="text-muted mb-0 small">Non vérifiés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm bg-gradient">
            <Card.Body className="py-4">
              <div className="text-info mb-2">
                <i className="fas fa-user-plus" style={{ fontSize: "2rem" }}></i>
              </div>
              <h3 className="fw-bold text-info mb-1">{stats.newUsersThisMonth || 0}</h3>
              <p className="text-muted mb-0 small">Nouveaux ce mois</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <label className="form-label small text-muted">RECHERCHER</label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <label className="form-label small text-muted">RÔLE</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">Super Admin</option>
              </select>
            </Col>
            <Col md={3}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("");
                  setCurrentPage(1);
                }}
                className="w-100"
              >
                <i className="fas fa-times me-2"></i>
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table des utilisateurs */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users text-muted mb-3" style={{ fontSize: "3rem" }}></i>
              <h5 className="text-muted">Aucun utilisateur trouvé</h5>
              {search || roleFilter ? (
                <p className="text-muted">Essayez de modifier vos critères de recherche</p>
              ) : (
                <p className="text-muted">Commencez par créer votre premier utilisateur</p>
              )}
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3">Utilisateur</th>
                  <th className="border-0 py-3">Email</th>
                  <th className="border-0 py-3">Rôle</th>
                  <th className="border-0 py-3">Statut</th>
                  <th className="border-0 py-3">Inscription</th>
                  <th className="border-0 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle text-white d-flex justify-content-center align-items-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            fontSize: "0.9rem",
                            backgroundColor: getAvatarColor(userItem.role),
                            fontWeight: "bold"
                          }}
                        >
                          {getInitials(userItem.name)}
                        </div>
                        <div>
                          <div className="fw-semibold">{userItem.name}</div>
                          {userItem.lastLoginAt && (
                            <small className="text-muted">
                              Dernière connexion: {new Date(userItem.lastLoginAt).toLocaleDateString('fr-FR')}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-muted">{userItem.email}</div>
                    </td>
                    <td className="py-3">{getRoleBadge(userItem.role)}</td>
                    <td className="py-3">{getVerificationBadge(userItem.isVerified)}</td>
                    <td className="py-3">
                      <div className="text-muted small">
                        {new Date(userItem.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-3 text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="outline-secondary" size="sm" className="border-0">
                          <i className="fas fa-ellipsis-v"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {/* Modifier */}
                          {(user?.role === "admin" || user?.role === "superAdmin") && (
                            <Dropdown.Item onClick={() => openEditModal(userItem)}>
                              <i className="fas fa-edit me-2 text-warning"></i>
                              Modifier
                            </Dropdown.Item>
                          )}

                          {/* Basculer vérification */}
                          {(user?.role === "admin" || user?.role === "superAdmin") && (
                            <Dropdown.Item onClick={() => handleToggleVerification(userItem._id)}>
                              <i className={`fas ${userItem.isVerified ? 'fa-times-circle' : 'fa-check-circle'} me-2 text-primary`}></i>
                              {userItem.isVerified ? "Retirer vérification" : "Marquer vérifié"}
                            </Dropdown.Item>
                          )}

                          {/* Divider */}
                          {user?.role === "superAdmin" && userItem.role !== "superAdmin" && userItem._id !== user.id && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => openDeleteModal(userItem)}
                              >
                                <i className="fas fa-trash me-2"></i>
                                Supprimer
                              </Dropdown.Item>
                            </>
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
      <UserFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}  // ← Celui-ci est OK (1 paramètre)
        title="Créer un Nouvel Utilisateur"
        mode="create"
        currentUserRole={user?.role}
        initialData={null}
      />

      {/* Modal Modifier Utilisateur */}
      {/* Modal Modifier Utilisateur */}
      <UserFormModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={(userData) => handleUpdateUser(selectedUser._id, userData)}  // ← Changez cette ligne !
        title="Modifier l'Utilisateur"
        mode="edit"
        currentUserRole={user?.role}
        initialData={selectedUser}
      />

      {/* Modal Supprimer Utilisateur */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2 text-danger"></i>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Attention !</strong> Cette action est irréversible et supprimera définitivement toutes les données de l'utilisateur.
          </Alert>

          <div className="text-center mb-4">
            <div
              className="rounded-circle text-white d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{
                width: "60px",
                height: "60px",
                fontSize: "1.5rem",
                backgroundColor: getAvatarColor(selectedUser?.role),
                fontWeight: "bold"
              }}
            >
              {getInitials(selectedUser?.name)}
            </div>
            <h5>Supprimer {selectedUser?.name} ?</h5>
          </div>

          <div className="bg-light p-3 rounded mb-3">
            <div className="row">
              <div className="col-sm-4"><strong>Email:</strong></div>
              <div className="col-sm-8">{selectedUser?.email}</div>
            </div>
            <div className="row">
              <div className="col-sm-4"><strong>Rôle:</strong></div>
              <div className="col-sm-8">{selectedUser && getRoleBadge(selectedUser.role)}</div>
            </div>
            <div className="row">
              <div className="col-sm-4"><strong>Inscription:</strong></div>
              <div className="col-sm-8">{selectedUser && new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          <Alert variant="warning" className="small">
            <i className="fas fa-info-circle me-2"></i>
            Cette action supprimera également tous les emprunts, favoris et autres données associées à cet utilisateur.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="fas fa-times me-2"></i>
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