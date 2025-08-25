
import React from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";

const BookFilters = ({ search, onSearchChange, genreFilter, onGenreChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, onReset }) => {
  const genres = [
    "", "Fiction", "Non-fiction", "Mystère", "Romance", "Science-fiction",
    "Fantasy", "Biographie", "Histoire", "Philosophie", "Science",
    "Technologie", "Art", "Cuisine", "Voyage", "Développement personnel"
  ];

  return (
    <Row className="mb-3">
      <Col md={4}>
        <InputGroup>
          <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
          <Form.Control
            placeholder="Rechercher un livre..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </Col>

      <Col md={3}>
        <Form.Select value={genreFilter} onChange={(e) => onGenreChange(e.target.value)}>
          {genres.map((g, i) => (
            <option key={i} value={g}>{g || "Tous les genres"}</option>
          ))}
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
          <option value="">Trier par</option>
          <option value="title">Titre</option>
          <option value="author">Auteur</option>
          <option value="publishedYear">Année</option>
          <option value="price">Prix</option>
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
          <option value="asc">⬆️ Croissant</option>
          <option value="desc">⬇️ Décroissant</option>
        </Form.Select>
      </Col>

      <Col md={1}>
        <Button variant="outline-secondary" onClick={onReset}>
          <i className="fas fa-times"></i>
        </Button>
      </Col>
    </Row>
  );
};

export default BookFilters;
