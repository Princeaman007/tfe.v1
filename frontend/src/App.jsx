import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 📦 Contexts & Wrappers
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// 🎨 Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

// 🌍 Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Success from "./pages/Success";

// 📚 Catalogue livres (public)
import BooksList from "./components/BooksList";
import BookDetails from "./components/BookDetails";

// 👤 Pages Utilisateur
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import MyRentals from "./pages/MyRentals";
import MyReviews from "./pages/MyReviews";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";

// 🔧 Pages Admin
import AddBook from "./pages/AddBook";
import ManageBooks from "./pages/ManageBooks";
import Analytics from "./pages/Analytics";

// 🔥 Pages Super Admin
import ManageUsers from "./pages/ManageUsers";
import SecurityLogs from "./pages/SecurityLogs";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* 🌍 Pages accessibles à tous */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 📚 Catalogue de livres (accessible à tous) */}
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/success" element={<Success />} />

          {/* 🔐 Routes nécessitant une connexion */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* 👤 Utilisateur (Accès Standard) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="my-reviews" element={<MyReviews />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />

            {/* 🛠 Admin (Accès Restreint) */}
            <Route path="add-book" element={<ProtectedRoute role="admin"><AddBook /></ProtectedRoute>} />
            <Route path="manage-books" element={<ProtectedRoute role="admin"><ManageBooks /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

            {/* 🔥 Super Admin (Accès Très Restreint) */}
            <Route path="manage-users" element={<ProtectedRoute role="superadmin"><ManageUsers /></ProtectedRoute>} />
            <Route path="security-logs" element={<ProtectedRoute role="superadmin"><SecurityLogs /></ProtectedRoute>} />

          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
