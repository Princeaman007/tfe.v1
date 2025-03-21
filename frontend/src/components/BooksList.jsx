import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Pagination
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const BooksList = () => {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");

  useEffect(() => {
    fetchBooks(1, true);
  }, [search, genre, sortByPrice]);

  const fetchBooks = async (pageNumber = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/books", {
        params: { page: pageNumber, limit: 8, search, genre, sortByPrice },
      });
      const { books: fetchedBooks, totalPages: serverTotalPages } = response.data;
      setBooks(reset ? fetchedBooks : [...books, ...fetchedBooks]);
      setTotalPages(serverTotalPages || 1);
    } catch (err) {
      console.error("Erreur lors du chargement des livres :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (bookId) => {
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour liker un livre.");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/books/${bookId}/like`, {}, { withCredentials: true });
      fetchBooks(page, true);
    } catch (error) {
      console.error("Erreur lors du like :", error);
    }
  };

  const handleRent = async (bookId) => {
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour louer un livre.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payment/create-checkout-session",
        { bookId },
        { withCredentials: true }
      );
      const { url } = res.data;
      window.location.href = url;
    } catch (err) {
      console.error("❌ Erreur Stripe BooksList:", err);
      alert("Erreur lors de la création du paiement. Veuillez réessayer.");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 fw-bold text-primary">
        📚 Nos Livres Disponibles à la Location
      </h2>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            placeholder="Recherche par titre, auteur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">Tous les genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="fantasy">Fantasy</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={sortByPrice} onChange={e => setSortByPrice(e.target.value)}>
            <option value="">Trier par prix</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="gy-4">
        {books.map(book => (
          <Col key={book._id} md={3}>
            <Card className="shadow-sm h-100">
  <Card.Img
    variant="top"
    src={book.coverImage || "https://via.placeholder.com/150"}
    style={{ height: "250px", objectFit: "cover" }}
  />
  <Card.Body className="d-flex flex-column p-2">
    <Card.Title style={{ fontSize: "1rem" }}>{book.title}</Card.Title>
    <Card.Subtitle className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>
      {book.author}
    </Card.Subtitle>
    <Card.Text className="small mb-1">{book.genre}</Card.Text>

    <Card.Text className="fw-bold text-success mb-2" style={{ fontSize: "0.9rem" }}>
      Prix : {typeof book.price === "number" ? `${book.price.toFixed(2)}€` : <span className="text-danger">Non défini</span>}
    </Card.Text>

    <div className="mt-auto d-flex flex-wrap gap-1">
      <Button variant="outline-primary" size="sm" onClick={() => handleLike(book._id)}>
        ❤️ {book.likes?.length || 0}
      </Button>
      <Button variant="success" size="sm" onClick={() => handleRent(book._id)}>
        📖 Louer
      </Button>
      <Link to={`/books/${book._id}`} className="btn btn-info btn-sm">
        Détails
      </Link>
    </div>
  </Card.Body>
</Card>

          </Col>
        ))}
      </Row>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center my-4">
          <Pagination>
            <Pagination.First
              disabled={page === 1}
              onClick={() => {
                setPage(1);
                fetchBooks(1, true);
              }}
            />
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => {
                setPage(prev => prev - 1);
                fetchBooks(page - 1, true);
              }}
            />

            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === page}
                  onClick={() => {
                    setPage(pageNumber);
                    fetchBooks(pageNumber, true);
                  }}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => {
                setPage(prev => prev + 1);
                fetchBooks(page + 1, true);
              }}
            />
            <Pagination.Last
              disabled={page === totalPages}
              onClick={() => {
                setPage(totalPages);
                fetchBooks(totalPages, true);
              }}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default BooksList;
