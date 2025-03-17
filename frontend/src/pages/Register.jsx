import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { name, email, password });
      navigate("/login");
    } catch (error) {
      console.error("Erreur d'inscription :", error.response?.data?.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Inscription</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
        <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 mb-2" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 mb-2" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 mb-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;
