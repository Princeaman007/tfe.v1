import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../../config.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Helper pour configurer les headers avec token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // ✅ Vérification du token et récupération de l'utilisateur
  const verifyToken = async () => {
    try {
      console.log("🔍 Vérification du token...");
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("❌ Aucun token trouvé");
        clearAuthData();
        return false;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: getAuthHeaders()
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
      console.error("🔴 Erreur lors de la vérification du token :", error.response?.data?.message || error.message);
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
    localStorage.removeItem("token"); // ✅ Supprime aussi le token
  };

  // ✅ Initialisation avec vérification systématique du token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("📦 Utilisateur stocké trouvé :", parsedUser);
          console.log("🔑 Token trouvé :", storedToken.substring(0, 20) + '...');
          console.log("👤 Rôle stocké :", parsedUser.role);
          
          // Vérification du token
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
        console.log("🔍 Aucun utilisateur/token stocké");
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Connexion avec gestion des tokens JWT
  const login = async (credentials) => {
    try {
      console.log("🔐 Tentative de connexion...");
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);

      console.log("🟢 Connexion réussie :", response.data);
      console.log("👤 Utilisateur connecté :", response.data.user);
      console.log("🔑 Rôle :", response.data.user?.role);

      // ✅ CORRECTION PRINCIPALE : Stocker le token JWT
      if (response.status === 200 && response.data.token && response.data.user) {
        // Stocker le TOKEN JWT
        localStorage.setItem("token", response.data.token);
        console.log("🔑 Token stocké :", response.data.token.substring(0, 30) + '...');
        
        // Stocker l'utilisateur
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        setIsAuthenticated(true);
        setUser(response.data.user);

        // 🔀 Redirection intelligente
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
        
        return { success: true };
      } else {
        throw new Error("Token ou utilisateur manquant dans la réponse");
      }
    } catch (error) {
      console.error("🔴 Erreur de connexion :", error.response?.data?.message || error.message);
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
        headers: getAuthHeaders()
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

  // ✅ Helper pour faire des requêtes authentifiées
  const authAxios = axios.create({
    baseURL: API_BASE_URL
  });

  // Intercepteur pour ajouter automatiquement le token
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ✅ Debug function
  const debugAuth = () => {
    console.log("=== DEBUG AUTH CONTEXT ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user.role:", user?.role);
    console.log("loading:", loading);
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("localStorage token:", localStorage.getItem("token")?.substring(0, 20) + '...');
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
      loading,
      authAxios, // ✅ Axios configuré avec auth automatique
      getAuthHeaders // ✅ Helper pour les headers
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