
import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const BookDeleteModal = ({ show, onHide, onDelete, book }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!show) {
      setDeleteError("");
      setIsDeleting(false);
    }
  }, [show]);

  const handleDelete = async () => {
    if (!book) {
      setDeleteError("Aucun livre sélectionné pour la suppression");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");
      
      await onDelete(book._id || book.id);
      
      // Si la suppression réussit, le parent fermera le modal
      // Le reset se fera via l'useEffect ci-dessus
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(
        error.response?.data?.message || 
        error.message ||
        "Une erreur est survenue lors de la suppression du livre"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop={isDeleting ? "static" : true}>
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title className="text-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Supprimer le Livre
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {deleteError && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {deleteError}
          </Alert>
        )}

        <div className="text-center">
          <i className="fas fa-trash-alt text-danger mb-3" style={{ fontSize: "3rem" }}></i>
          
          <p className="mb-3">
            Êtes-vous sûr de vouloir supprimer définitivement le livre :
          </p>
          
          <div className="bg-light p-3 rounded mb-3">
            <h5 className="mb-2 text-primary">{book?.title || "Titre non disponible"}</h5>
            {book?.author && (
              <p className="mb-1 text-muted">
                <strong>Auteur :</strong> {book.author}
              </p>
            )}
            {book?.genre && (
              <p className="mb-1 text-muted">
                <strong>Genre :</strong> {book.genre}
              </p>
            )}
            {book?.price && (
              <p className="mb-0 text-muted">
                <strong>Prix :</strong> {book.price}€
              </p>
            )}
          </div>
          
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Attention :</strong> Cette action est irréversible !
          </div>

          {/* Informations supplémentaires si le livre a des emprunts */}
          {book?.borrowedCount > 0 && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Ce livre a été emprunté <strong>{book.borrowedCount}</strong> fois.
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-center">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          disabled={isDeleting}
          className="px-4"
        >
          <i className="fas fa-times me-2"></i>
          Annuler
        </Button>
        
        <Button 
          variant="danger" 
          onClick={handleDelete}
          disabled={isDeleting || !book}
          className="px-4"
        >
          {isDeleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Suppression...
            </>
          ) : (
            <>
              <i className="fas fa-trash-alt me-2"></i>
              Supprimer définitivement
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookDeleteModal;