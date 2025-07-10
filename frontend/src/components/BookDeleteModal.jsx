// src/components/BookDeleteModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const BookDeleteModal = ({ show, onHide, onDelete, book }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Supprimer le Livre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Êtes-vous sûr de vouloir supprimer le livre <strong>{book?.title}</strong> ?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookDeleteModal;
