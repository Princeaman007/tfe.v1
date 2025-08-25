import React from "react";
import BooksList from "../components/BooksList"; 

const Dashboard = () => {
  return (
    <div className="container mt-4">
     
      {/* ✅ Liste des livres */}
      <BooksList />
    </div>
  );
};

export default Dashboard;

