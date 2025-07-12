import React, { useState, useEffect } from "react";

const Library = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Exemple d'appel API (remplace avec ta vraie API)
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
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
