import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";

const Favorites = () => {
  const [likedBooks, setLikedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedBooks();
  }, []);

  const fetchLikedBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/books/liked/me", {
        withCredentials: true,
      });
      setLikedBooks(res.data);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des livres likés :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center fw-bold text-danger mb-4">❤️ Favoris</h2>
      <p className="text-center text-muted">Liste des livres que vous avez likés.</p>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : likedBooks.length === 0 ? (
        <p className="text-center text-muted">Tu n’as pas encore liké de livre.</p>
      ) : (
        <Row className="gy-4">
          {likedBooks.map((book) => (
            <Col md={4} key={book._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={book.coverImage || "https://via.placeholder.com/150"}
                  style={{ height: "220px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Subtitle className="text-muted">{book.author}</Card.Subtitle>
                  {/* Tu peux ajouter un lien vers les détails si tu veux */}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Favorites;
