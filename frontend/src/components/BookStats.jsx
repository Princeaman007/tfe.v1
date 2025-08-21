// src/components/BookStats.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";
import { useAuth } from '../context/AuthContext';

const BookStats = () => {
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    rentedBooks: 0,
    returnedBooks: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
        
      try {
        console.log("📦 stats:", stats);
        const res = await axios.get(`${API_BASE_URL}/api/books/stats`, {
  headers: getAuthHeaders()
});
        setStats(res.data);
        console.log("📦 stats fetched:", res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="py-4 px-3">
      <h2 className="fw-bold text-primary mb-3">📊 Statistiques des Livres</h2>
      <Row>
        <Col md={2}><Card body className="text-center"><h6>Total Livres</h6><h4>{stats.totalBooks}</h4></Card></Col>
        <Col md={2}><Card body className="text-center"><h6>Copies dispo.</h6><h4>{stats.availableCopies}</h4></Card></Col>
        <Col md={2}><Card body className="text-center"><h6>Loués</h6><h4>{stats.rentedBooks}</h4></Card></Col>
        <Col md={2}><Card body className="text-center"><h6>Retournés</h6><h4>{stats.returnedBooks}</h4></Card></Col>
        <Col md={2}><Card body className="text-center"><h6>Likes</h6><h4>{stats.totalLikes}</h4></Card></Col>
      </Row>
    </div>
  );
};

export default BookStats;
