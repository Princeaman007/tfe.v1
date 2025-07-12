import React, { useState } from "react";

const AddBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ajout du livre :", title, author);
  };

  return (
    <div>
      <h2> Ajouter un Livre</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Auteur" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AddBook;
