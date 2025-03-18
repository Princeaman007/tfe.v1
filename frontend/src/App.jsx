import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// 📌 Importation des pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";

// 📌 Pages Utilisateur
import Library from "./pages/Library";
import MyRentals from "./pages/MyRentals";
import MyReviews from "./pages/MyReviews";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";  // ✅ Ajout de la page Profil

// 📌 Pages Admin
import AddBook from "./pages/AddBook";
import ManageBooks from "./pages/ManageBooks";

// 📌 Pages Super Admin
import ManageUsers from "./pages/ManageUsers";
import SecurityLogs from "./pages/SecurityLogs";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ✅ Pages accessibles sans connexion */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ✅ Routes protégées (Nécessitent une connexion) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* 📚 Utilisateur : Accès aux fonctionnalités de base */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="my-reviews" element={<MyReviews />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />  {/* ✅ Ajout de /profile */}

            {/* 🛠 Admin : Ajout et gestion des livres */}
            <Route path="add-book" element={<ProtectedRoute role="admin"><AddBook /></ProtectedRoute>} />
            <Route path="manage-books" element={<ProtectedRoute role="admin"><ManageBooks /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

            {/* 🔥 Super Admin : Gestion des utilisateurs et logs */}
            <Route path="manage-users" element={<ProtectedRoute role="superadmin"><ManageUsers /></ProtectedRoute>} />
            <Route path="security-logs" element={<ProtectedRoute role="superadmin"><SecurityLogs /></ProtectedRoute>} />

          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
