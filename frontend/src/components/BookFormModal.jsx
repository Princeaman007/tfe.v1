import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";

const BookFormModal = ({ show, onHide, onSubmit, initialData, title }) => {
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
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        author: initialData.author || "",
        description: initialData.description || "",
        genre: initialData.genre || "",
        publishedYear: initialData.publishedYear || "",
        price: initialData.price || "",
        availableCopies: initialData.availableCopies || "",
        coverImage: initialData.coverImage || ""
      });
    } else {
      setFormData({
        title: "",
        author: "",
        description: "",
        genre: "",
        publishedYear: "",
        price: "",
        availableCopies: "",
        coverImage: ""
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/books/genres", {
          withCredentials: true,
        });

        if (Array.isArray(res.data.genres)) {
          setGenres(res.data.genres);
        } else if (Array.isArray(res.data)) {
          setGenres(res.data);
        } else {
          console.warn("Format inattendu pour les genres :", res.data);
          setGenres([]);
        }
      } catch (err) {
        console.error("Erreur chargement genres:", err);
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
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
                  {(Array.isArray(genres) ? genres : []).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Année</Form.Label>
                <Form.Control type="number" name="publishedYear" value={formData.publishedYear} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Prix (€)</Form.Label>
                <Form.Control type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" name="availableCopies" value={formData.availableCopies} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Image (URL)</Form.Label>
            <Form.Control type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit">Enregistrer</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookFormModal;
