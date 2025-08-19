// src/pages/ManageBooks.jsx
import React, { useState, useEffect } from "react";
import { Container, Button, Spinner, Pagination, Row, Col, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

import BookStats from "../components/BookStats";
import BookFilters from "../components/BookFilters";
import BookTable from "../components/BookTable";
import BookFormModal from "../components/BookFormModal";
import BookDeleteModal from "../components/BookDeleteModal";
import { API_BASE_URL } from '../config.js';

const ManageBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [genres, setGenres] = useState([]);

  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  // Chargement initial
  useEffect(() => {
    fetchBooks();
  }, [currentPage, search, genreFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📚 Chargement des livres...", {
        page: currentPage,
        search,
        genre: genreFilter,
        sortBy,
        sortOrder
      });

      const response = await axios.get(`${API_BASE_URL}/api/books`, {
        params: {
          page: currentPage,
          limit: 10,
          search: search.trim(),
          genre: genreFilter,
          sortBy,
          sortOrder,
        },
        withCredentials: true,
        timeout: 15000, // 15 secondes de timeout
      });

      console.log("✅ Livres chargés:", response.data);

      setBooks(response.data.books || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalBooks(response.data.totalBooks || 0);

    } catch (err) {
      console.error("❌ Erreur fetchBooks:", err);

      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        toast.error("Session expirée");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas les permissions pour accéder aux livres.");
        toast.error("Permissions insuffisantes");
      } else if (err.code === 'ECONNABORTED') {
        setError("Timeout de connexion. Vérifiez votre réseau.");
        toast.error("Connexion lente ou interrompue");
      } else {
        setError("Erreur lors du chargement des livres.");
        toast.error(err.response?.data?.message || "Erreur lors du chargement des livres");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      console.log("🏷️ Chargement des genres...");

      const response = await axios.get(`${API_BASE_URL}/api/books/genres`, {
        withCredentials: true,
        timeout: 10000,
      });

      console.log("✅ Genres chargés:", response.data);

      // Gérer différents formats de réponse
      let genresList = [];
      if (Array.isArray(response.data.genres)) {
        genresList = response.data.genres;
      } else if (Array.isArray(response.data)) {
        genresList = response.data;
      } else {
        console.warn("Format de genres inattendu:", response.data);
      }

      setGenres(genresList);
    } catch (err) {
      console.error("❌ Erreur fetchGenres:", err);
      setGenres([]);

      if (err.response?.status !== 401) {
        toast.error("Erreur lors du chargement des genres");
      }
    }
  };

  const handleCreate = async (data) => {
    try {
      console.log("📝 Création livre avec données:", { ...data, password: data.password ? '***' : undefined });

      const response = await axios.post(`${API_BASE_URL}/api/books`, data, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Livre créé:", response.data);
      toast.success("Livre ajouté avec succès !");
      setShowCreateModal(false);

      // Rafraîchir la liste
      await fetchBooks();

    } catch (err) {
      console.error("❌ Erreur création livre:", err);
      console.error("📋 Détails erreur:", err.response?.data);

      // L'erreur sera gérée par BookFormModal
      throw err;
    }
  };

  const handleUpdate = async (bookId, data) => {
    try {
      console.log("📝 Modification livre ID:", bookId, "avec données:", data);

      const response = await axios.put(`${API_BASE_URL}/api/books/${bookId}`, data, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Livre modifié:", response.data);
      toast.success("Livre modifié avec succès !");
      setEditBook(null);

      // Rafraîchir la liste
      await fetchBooks();

    } catch (err) {
      console.error("❌ Erreur modification livre:", err);
      console.error("📋 Détails erreur:", err.response?.data);

      // 🔍 AJOUTEZ CES LIGNES
      console.error("🚨 Erreurs de validation:", err.response?.data?.errors);
      console.error("📤 Données envoyées:", data);
      console.error("🆔 Book ID:", bookId);

      // L'erreur sera gérée par BookFormModal
      throw err;
    }
  };

  const handleDelete = async (bookId) => {
    try {
      console.log("🗑️ Suppression livre ID:", bookId);

      // Vérification de sécurité
      if (!bookId) {
        throw new Error("ID du livre manquant");
      }

      const response = await axios.delete(`${API_BASE_URL}/api/books/${bookId}`, {
        withCredentials: true,
        timeout: 15000, // Plus de temps pour la suppression
      });

      console.log("✅ Livre supprimé:", response.data);
      toast.success("Livre supprimé avec succès !");
      setDeleteBook(null);

      // Rafraîchir la liste
      await fetchBooks();

    } catch (err) {
      console.error("❌ Erreur suppression livre:", err);
      console.error("📋 Détails erreur:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });

      // L'erreur sera gérée par BookDeleteModal
      throw err;
    }
  };

  const handleReset = () => {
    setSearch("");
    setGenreFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Pagination avancée
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    return (
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

          {startPage > 1 && (
            <>
              <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>
              {startPage > 2 && <Pagination.Ellipsis />}
            </>
          )}

          {[...Array(endPage - startPage + 1)].map((_, idx) => {
            const pageNumber = startPage + idx;
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

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <Pagination.Ellipsis />}
              <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </Pagination.Item>
            </>
          )}

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
          Page {currentPage} sur {totalPages} • {totalBooks} livre{totalBooks > 1 ? 's' : ''} au total
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-primary mb-1">
                <i className="fas fa-books me-2"></i>
                Gestion des Livres
              </h2>
              <p className="text-muted mb-0">Gérer le catalogue de la bibliothèque</p>
            </div>
            {(user?.role === "admin" || user?.role === "superAdmin") && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                className="d-flex align-items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Ajouter un livre
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Statistiques */}
      <BookStats />

      {/* Filtres */}
      <BookFilters
        search={search}
        onSearchChange={setSearch}
        genreFilter={genreFilter}
        onGenreChange={setGenreFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onReset={handleReset}
        genres={genres}
      />

      {/* Contenu principal */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {error ? (
            <div className="p-4">
              <Alert variant="danger" className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-3"
                  onClick={() => {
                    setError("");
                    fetchBooks();
                  }}
                >
                  <i className="fas fa-redo me-1"></i>
                  Réessayer
                </Button>
              </Alert>
            </div>
          ) : loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des livres...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-book-open text-muted mb-3" style={{ fontSize: "3rem" }}></i>
              <h5 className="text-muted">Aucun livre trouvé</h5>
              {search || genreFilter ? (
                <div>
                  <p className="text-muted">Aucun résultat pour vos critères de recherche</p>
                  <Button variant="outline-secondary" onClick={handleReset}>
                    <i className="fas fa-times me-2"></i>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted">Commencez par ajouter votre premier livre</p>
                  {(user?.role === "admin" || user?.role === "superAdmin") && (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                      <i className="fas fa-plus me-2"></i>
                      Ajouter un livre
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <BookTable
              books={books}
              onEdit={setEditBook}
              onDelete={setDeleteBook}
              currentUserRole={user?.role}
            />
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {renderPagination()}

      {/* Modals avec validation */}

      {/* Modal de création */}
      <BookFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Ajouter un Livre"
        mode="create"
        initialData={null}
      />

      {/* Modal de modification */}
      <BookFormModal
        show={!!editBook}
        onHide={() => setEditBook(null)}
        onSubmit={(data) => handleUpdate(editBook._id, data)}  // ← Changez cette ligne
        title="Modifier le Livre"
        mode="edit"
        initialData={editBook}
      />

      {/* Modal de suppression */}
      <BookDeleteModal
        show={!!deleteBook}
        onHide={() => setDeleteBook(null)}
        onDelete={handleDelete}
        book={deleteBook}
      />
    </Container>
  );
};

export default ManageBooks;