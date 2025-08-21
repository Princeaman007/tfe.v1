// frontend/src/App.jsx — version corrigée
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Wrappers / Layout
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Styles (option : garde-les dans main.jsx pour éviter les doublons)
import "react-toastify/dist/ReactToastify.css";

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Success from "./pages/Success";
import Contact from "./pages/Contact";

// Catalogue public
import BooksList from "./components/BooksList";
import BookDetails from "./components/BookDetails";

// Utilisateur
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import MyRentals from "./pages/MyRentals";
import MyReviews from "./pages/MyReviews";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";

// Admin / Super Admin
import AddBook from "./pages/AddBook";
import ManageBooks from "./pages/ManageBooks";
import Analytics from "./pages/Analytics";
import ManageUsers from "./pages/ManageUsers";
import SecurityLogs from "./pages/SecurityLogs";
import AdminRentals from "./pages/AdminRentals";

export default function App() {
  return (
    <>
      <Routes>
        {/* Publique */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/contact" element={<Contact />} />

        {/* Catalogue public */}
        <Route path="/books" element={<BooksList />} />
        <Route path="/books/:id" element={<BookDetails />} />

        {/* Protégé + Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* User */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin */}
          <Route
            path="/add-book"
            element={<ProtectedRoute role="admin"><AddBook /></ProtectedRoute>}
          />
          <Route
            path="/manage-books"
            element={<ProtectedRoute role="admin"><ManageBooks /></ProtectedRoute>}
          />
          <Route
            path="/analytics"
            element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>}
          />

          {/* Super Admin */}
          <Route
            path="/manage-users"
            element={<ProtectedRoute role="superAdmin"><ManageUsers /></ProtectedRoute>}
          />
          <Route
            path="/security-logs"
            element={<ProtectedRoute role="superAdmin"><SecurityLogs /></ProtectedRoute>}
          />
          <Route
            path="/admin-rentals"
            element={
              <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
                <AdminRentals />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
