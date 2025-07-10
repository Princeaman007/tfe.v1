// src/pages/ManageBooks.jsx
import React, { useState, useEffect } from "react";
import { Container, Button, Spinner, Pagination } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

import BookStats from "../components/BookStats";
import BookFilters from "../components/BookFilters";
import BookTable from "../components/BookTable";
import BookFormModal from "../components/BookFormModal";
import BookDeleteModal from "../components/BookDeleteModal";

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [genres, setGenres] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, search, genreFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/books", {
        params: {
          page: currentPage,
          limit: 10,
          search,
          genre: genreFilter,
          sortBy,
          sortOrder,
        },
        withCredentials: true,
      });
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error("Erreur lors du chargement des livres");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/books/genres", {
        withCredentials: true,
      });
      setGenres(res.data.genres || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des genres");
      setGenres([]);
    }
  };

  const handleCreate = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/books", data, {
        withCredentials: true,
      });
      toast.success("Livre ajouté avec succès !");
      setShowCreateModal(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${editBook._id}`, data, {
        withCredentials: true,
      });
      toast.success("Livre modifié avec succès !");
      setEditBook(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${deleteBook._id}`, {
        withCredentials: true,
      });
      toast.success("Livre supprimé avec succès !");
      setDeleteBook(null);
      fetchBooks();
    } catch (err) {
      toast.error("Erreur lors de la suppression du livre");
    }
  };

  return (
    <Container fluid className="py-4">
      <BookStats />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">📚 Gestion des Livres</h3>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          <i className="fas fa-plus me-2"></i> Ajouter un livre
        </Button>
      </div>

      <BookFilters
        search={search}
        onSearchChange={setSearch}
        genreFilter={genreFilter}
        onGenreChange={setGenreFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onReset={() => {
          setSearch("");
          setGenreFilter("");
          setSortBy("");
          setSortOrder("asc");
          setCurrentPage(1);
        }}
        genres={genres}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <BookTable
          books={books}
          onEdit={setEditBook}
          onDelete={setDeleteBook}
        />
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            <Pagination.Item active>{currentPage}</Pagination.Item>
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* 🔧 Modales de création et modification */}
      <BookFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        initialData={null}
        title="Ajouter un Livre"
        genres={genres}
      />

      <BookFormModal
        show={!!editBook}
        onHide={() => setEditBook(null)}
        onSubmit={handleUpdate}
        initialData={editBook}
        title="Modifier le Livre"
        genres={genres}
      />

      <BookDeleteModal
        show={!!deleteBook}
        onHide={() => setDeleteBook(null)}
        onConfirm={handleDelete}
        bookTitle={deleteBook?.title}
      />
    </Container>
  );
};

export default ManageBooks;