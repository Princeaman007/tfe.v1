import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../config.js';

const Library = () => {
  const { getAuthHeaders } = useAuth();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
      }
    };
    
    fetchBooks();
  }, []);

  return (
    <div>
      <h2>Bibliothèque</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title} - {book.author}</li>
        ))}
      </ul>
    </div>
  );
};

export default Library;