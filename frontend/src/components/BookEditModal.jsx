// src/components/BookEditModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

const BookEditModal = ({ show, onHide, onSubmit, book }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    publishedYear: "",
    price: "",
    availableCopies: "",
    coverImage: ""
  });

  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/books/genres", { withCredentials: true });
        setGenres(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        genre: book.genre || "",
        publishedYear: book.publishedYear || "",
        price: book.price || "",
        availableCopies: book.availableCopies || "",
        coverImage: book.coverImage || ""
      });
    }
  }, [book]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier le Livre</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Auteur</Form.Label>
            <Form.Control name="author" value={formData.author} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Select name="genre" value={formData.genre} onChange={handleChange} required>
                  <option value="">Choisir un genre</option>
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Année</Form.Label>
                <Form.Control name="publishedYear" type="number" value={formData.publishedYear} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Prix (€)</Form.Label>
                <Form.Control name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control name="availableCopies" type="number" value={formData.availableCopies} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Image (URL)</Form.Label>
            <Form.Control name="coverImage" type="url" value={formData.coverImage} onChange={handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="warning" type="submit">Mettre à jour</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookEditModal;
