import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mois: "Jan", ventes: 400 },
  { mois: "Fév", ventes: 800 },
  { mois: "Mar", ventes: 600 },
  { mois: "Avr", ventes: 1200 },
  { mois: "Mai", ventes: 900 },
  { mois: "Juin", ventes: 1500 },
];

const Analytics = () => {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📊 Analyse des Ventes</h2>

      <div className="card p-4 shadow">
        <h5 className="text-center">Évolution des ventes (6 derniers mois)</h5>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ventes" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
