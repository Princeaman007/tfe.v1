
import React from "react";
import { Table, Badge, Button, Spinner } from "react-bootstrap";

const BookTable = ({ books, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-4">
        <h5 className="text-muted">Aucun livre trouvé</h5>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>Titre</th>
          <th>Auteur</th>
          <th>Genre</th>
          <th>Année</th>
          <th>Prix</th>
          <th>Stock</th>
          <th>Likes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book._id}>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.genre}</td>
            <td>{book.publishedYear}</td>
            <td>{book.price} €</td>
            <td>
              <Badge bg={book.availableCopies > 0 ? "success" : "danger"}>
                {book.availableCopies}
              </Badge>
            </td>
            <td>
              <i className="fas fa-heart text-danger"></i> {book.likes?.length || 0}
            </td>
            <td>
              <Button
                size="sm"
                variant="outline-warning"
                className="me-2"
                onClick={() => onEdit(book)}
              >
                <i className="fas fa-edit"></i>
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => onDelete(book)}
              >
                <i className="fas fa-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default BookTable;
