import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import { API_BASE_URL } from '../config.js';
import { API_BASE_URL } from "../../config.js"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Vérification du token et récupération de l'utilisateur
  const verifyToken = async () => {
    try {
      console.log("🔍 Vérification du token...");
      
      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        withCredentials: true,
      });

      console.log("🟢 Token vérifié :", response.data);
      console.log("🔑 Utilisateur récupéré :", response.data.user);
      console.log("👤 Rôle de l'utilisateur :", response.data.user?.role);

      if (response.status === 200 && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return true;
      } else {
        console.log("❌ Token invalide ou utilisateur non trouvé");
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error("🔴 Erreur lors de la vérification du token :", error);
      console.error("🔴 Status :", error.response?.status);
      console.error("🔴 Message :", error.response?.data?.message);
      
      clearAuthData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour nettoyer les données d'authentification
  const clearAuthData = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  // ✅ Initialisation avec vérification systématique du token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("📦 Utilisateur stocké trouvé :", parsedUser);
          console.log("👤 Rôle stocké :", parsedUser.role);
          
          // Même s'il y a un utilisateur stocké, on vérifie le token
          const isValid = await verifyToken();
          
          if (!isValid) {
            console.log("⚠️ Token expiré, suppression des données stockées");
          }
        } catch (error) {
          console.error("❌ Erreur parsing utilisateur stocké :", error);
          clearAuthData();
          setLoading(false);
        }
      } else {
        console.log("🔍 Aucun utilisateur stocké, vérification du token...");
        await verifyToken();
      }
    };

    initializeAuth();
  }, []);

  // ✅ Connexion avec gestion des rôles et redirection
  const login = async (credentials) => {
    try {
      console.log("🔐 Tentative de connexion...");
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials, {
        withCredentials: true,
      });

      console.log("🟢 Connexion réussie :", response.data);
      console.log("👤 Utilisateur connecté :", response.data.user);
      console.log("🔑 Rôle :", response.data.user?.role);

      if (response.status === 200 && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // 🔀 Redirection intelligente
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
        
        return { success: true };
      }
    } catch (error) {
      console.error("🔴 Erreur de connexion :", error.response?.data?.message || "Erreur inconnue");
      const message = error.response?.data?.message || "Identifiants incorrects !";
      
      return { success: false, message };
    }
  };

  // ✅ Mise à jour de l'utilisateur après un changement de profil
  const updateUserProfile = (updatedUser) => {
    console.log("📝 Mise à jour du profil utilisateur :", updatedUser);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // ✅ Fonction pour forcer la mise à jour des données utilisateur
  const refreshUser = async () => {
    console.log("🔄 Actualisation des données utilisateur...");
    await verifyToken();
  };

  // ✅ Déconnexion avec suppression des données stockées
  const logout = async () => {
    try {
      console.log("🚪 Déconnexion en cours...");
      
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { 
        withCredentials: true 
      });

      clearAuthData();
      navigate("/");
      
      console.log("✅ Déconnexion réussie");
    } catch (error) {
      console.error("🔴 Erreur lors de la déconnexion :", error);
      // Même en cas d'erreur, on déconnecte localement
      clearAuthData();
      navigate("/");
    }
  };

  // ✅ Fonction utilitaire pour vérifier les permissions
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    
    const userRole = user.role.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    console.log(`🔐 Vérification rôle: ${userRole} vs ${required}`);
    
    if (required === 'superAdmin') {
      return userRole === 'superAdmin';
    }
    if (required === 'admin') {
      return userRole === 'admin' || userRole === 'superAdmin';
    }
    if (required === 'user') {
      return userRole === 'user' || userRole === 'admin' || userRole === 'superAdmin';
    }
    
    return userRole === required;
  };

  // ✅ Debug function
  const debugAuth = () => {
    console.log("=== DEBUG AUTH CONTEXT ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user.role:", user?.role);
    console.log("loading:", loading);
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("========================");
  };

  // ✅ Éviter le rendu avant que l'authentification soit vérifiée
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">🔄 Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      updateUserProfile,
      refreshUser,
      hasRole,
      debugAuth,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};