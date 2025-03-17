import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Bienvenue dans la Bibliothèque 📚</h1>
      <Link to="/login" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Se Connecter
      </Link>
      <Link to="/register" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        register
      </Link>
    </div>
  );
};

export default Home;
