import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import axios from "axios";
import { API_BASE_URL } from '../../config.js';;

const Analytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/rentals/admin/monthly`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur chargement stats mensuelles :", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Analyse des Locations</h2>
      <div className="card p-4 shadow">
        <h5 className="text-center">Évolution des locations (12 derniers mois)</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ventes" stroke="#007bff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
