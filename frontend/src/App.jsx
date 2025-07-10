// frontend/src/App.jsx - Structure de routes corrigée
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

// 📦 Contexts & Wrappers
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AdminRentals from "./pages/AdminRentals";


// 🎨 Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import 'react-toastify/dist/ReactToastify.css';

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
          {/* 🌍 Pages accessibles à tous (sans Layout) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/success" element={<Success />} />

          {/* 📚 Catalogue de livres (accessible à tous, sans Layout) */}
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/:id" element={<BookDetails />} />

          {/* 🔐 Routes protégées avec Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* 👤 Routes utilisateur standard */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="my-reviews" element={<MyReviews />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />

            {/* 🛠 Routes Admin */}
            <Route path="add-book" element={<ProtectedRoute role="admin"><AddBook /></ProtectedRoute>} />
            <Route path="manage-books" element={<ProtectedRoute role="admin"><ManageBooks /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

            {/* 🔥 Routes Super Admin */}
            <Route path="manage-users" element={<ProtectedRoute role="superAdmin"><ManageUsers /></ProtectedRoute>} />
            <Route path="security-logs" element={<ProtectedRoute role="superAdmin"><SecurityLogs /></ProtectedRoute>} />
            <Route path="admin-rentals" element={<ProtectedRoute role="superAdmin"><AdminRentals /></ProtectedRoute>} />

          </Route>
        </Routes>

        {/* ✅ Configuration des toasts */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
};

export default App;