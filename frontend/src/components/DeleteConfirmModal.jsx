import React from 'react';
import Modal from './Modal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, book }) => {
  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
      <div>
        <p className="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer le livre <strong>"{book.title}"</strong> de {book.author} ?
        </p>
        <p className="text-sm text-red-600 mb-6">Cette action est irréversible.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
