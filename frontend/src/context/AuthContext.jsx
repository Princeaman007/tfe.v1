import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../../config.js';


const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  getAuthHeaders: () => ({}),
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper pour configurer les headers avec token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Vérification côté client si le token JWT est expiré
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      console.log(" Vérification expiration token:", { 
        exp: new Date(payload.exp * 1000), 
        now: new Date(), 
        isExpired 
      });
      return isExpired;
    } catch (error) {
      console.error(" Erreur parsing token:", error);
      return true;
    }
  };

  // Vérification du token et récupération de l'utilisateur
  const verifyToken = async () => {
    try {
      console.log("Vérification du token...");
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Aucun token trouvé");
        clearAuthData();
        return false;
      }

      // Vérification côté client d'abord
      if (isTokenExpired()) {
        console.log(" Token expiré côté client");
        clearAuthData();
        return false;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: getAuthHeaders()
      });

      console.log("Token vérifié :", response.data);

      if (response.status === 200 && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return true;
      } else {
        console.log("Token invalide ou utilisateur non trouvé");
        clearAuthData();
        return false;
      }
    } catch (error) {
      const status = error?.response?.status;
      console.error(
        "Erreur lors de la vérification du token :",
        status,
        error.response?.data?.message || error.message
      );
      // ❗️Ne déconnecter que si le serveur confirme que le token est invalide/expiré
      if (status === 401 || status === 403) {
        console.log(" Token rejeté par le serveur");
        clearAuthData();
        return false;
      }
      // Erreur réseau/5xx/CORS temporaire → conserver la session
      console.log("Erreur réseau temporaire, conservation de la session");
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour nettoyer les données d'authentification
  const clearAuthData = () => {
    console.log(" Nettoyage des données d'authentification");
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Vérification intelligente de l'authentification
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log(" Token ou utilisateur manquant");
      return false;
    }
    
    if (isTokenExpired()) {
      console.log(" Token expiré");
      clearAuthData();
      return false;
    }
    
    console.log(" Authentification valide");
    return true;
  };

  // Vérification périodique du token pour auto-refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkTokenPeriodically = setInterval(async () => {
      if (isTokenExpiringSoon() && !isTokenExpired()) {
        console.log(" Vérification périodique: rafraîchissement du token");
        await autoRefreshToken();
      } else if (isTokenExpired()) {
        console.log(" Token expiré détecté lors de la vérification périodique");
        clearAuthData();
        navigate('/login');
        clearInterval(checkTokenPeriodically);
      }
    }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
    
    return () => clearInterval(checkTokenPeriodically);
  }, [isAuthenticated, navigate]);

  // Initialisation avec vérification systématique du token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          // Vérification côté client d'abord
          if (isTokenExpired()) {
            console.log(" Token expiré au démarrage, suppression");
            clearAuthData();
            setLoading(false);
            return;
          }

          const parsedUser = JSON.parse(storedUser);
          console.log("Utilisateur stocké trouvé :", parsedUser);

          // Initialisation optimiste pour éviter de "flasher" déconnecté
          setIsAuthenticated(true);
          setUser(parsedUser);
          
          // Vérification du token côté serveur
          const isValid = await verifyToken();
          
          if (!isValid) {
            console.log("Token invalide, suppression des données stockées");
          }
        } catch (error) {
          console.error("Erreur parsing utilisateur stocké :", error);
          clearAuthData();
          setLoading(false);
        }
      } else {
        console.log("Aucun utilisateur/token stocké");
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Connexion avec gestion des tokens JWT
  const login = async (credentials) => {
    try {
      console.log("Tentative de connexion...");
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);

      console.log("Connexion réussie :", response.data);

      if (response.status === 200 && response.data.token && response.data.user) {
        // Stocker le TOKEN JWT
        localStorage.setItem("token", response.data.token);
        console.log("Token stocké");
        
        // Stocker l'utilisateur
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        setIsAuthenticated(true);
        setUser(response.data.user);

        // Redirection intelligente
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
        
        return { success: true };
      } else {
        throw new Error("Token ou utilisateur manquant dans la réponse");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error.response?.data?.message || error.message);
      const message = error.response?.data?.message || "Identifiants incorrects !";
      
      return { success: false, message };
    }
  };

  // Mise à jour de l'utilisateur après un changement de profil
  const updateUserProfile = (updatedUser) => {
    console.log("Mise à jour du profil utilisateur :", updatedUser);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Fonction pour vérifier si le token expire bientôt (dans les 10 minutes)
  const isTokenExpiringSoon = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const timeUntilExpiry = (payload.exp * 1000) - Date.now();
      const tenMinutes = 10 * 60 * 1000;
      
      console.log(" Temps avant expiration:", Math.floor(timeUntilExpiry / 1000 / 60), "minutes");
      return timeUntilExpiry < tenMinutes;
    } catch {
      return true;
    }
  };

  // Fonction pour rafraîchir automatiquement le token
  const autoRefreshToken = async () => {
    if (!isTokenExpiringSoon() || isTokenExpired()) {
      return false;
    }
    
    try {
      console.log(" Rafraîchissement automatique du token...");
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {}, {
        headers: getAuthHeaders()
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log(" Token rafraîchi automatiquement");
        return true;
      }
    } catch (error) {
      console.error(" Échec du rafraîchissement automatique:", error);
      if (error.response?.status === 401) {
        clearAuthData();
      }
    }
    
    return false;
  };

  // Fonction pour forcer la mise à jour des données utilisateur
  const refreshUser = async () => {
    console.log("Actualisation des données utilisateur...");
    
    // Tentative de rafraîchissement automatique si nécessaire
    if (isTokenExpiringSoon() && !isTokenExpired()) {
      await autoRefreshToken();
    }
    
    // Vérification côté client d'abord
    if (!checkAuthStatus()) {
      console.log(" Échec de la vérification d'authentification côté client");
      return false;
    }
    
    // Puis vérification côté serveur
    return await verifyToken();
  };

  // Déconnexion avec suppression des données stockées
  const logout = async () => {
    try {
      console.log("Déconnexion en cours...");
      
      // Même si le token est expiré, essayez de notifier le serveur
      if (!isTokenExpired()) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { 
          headers: getAuthHeaders()
        });
      }

      clearAuthData();
      navigate("/");
      
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      // Même en cas d'erreur, on déconnecte localement
      clearAuthData();
      navigate("/");
    }
  };

  // Fonction utilitaire pour vérifier les permissions
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    
    const userRole = user.role.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    console.log(`Vérification rôle: ${userRole} vs ${required}`);
    
    if (required === 'superadmin') {
      return userRole === 'superadmin';
    }
    if (required === 'admin') {
      return userRole === 'admin' || userRole === 'superadmin';
    }
    if (required === 'user') {
      return userRole === 'user' || userRole === 'admin' || userRole === 'superadmin';
    }
    
    return userRole === required;
  };

  // Helper pour faire des requêtes authentifiées
  const authAxios = axios.create({
    baseURL: API_BASE_URL
  });

  // Intercepteur pour ajouter automatiquement le token
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isTokenExpired()) {
      console.log(" Token expiré détecté dans l'intercepteur");
      clearAuthData();
      // Optionnel: rediriger vers login
      // navigate('/login');
    }
    return config;
  });

  // Intercepteur pour gérer les réponses d'erreur d'authentification
  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log(" Token rejeté par le serveur dans intercepteur");
        clearAuthData();
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  // Debug function
  const debugAuth = () => {
    console.log("=== DEBUG AUTH CONTEXT ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user.role:", user?.role);
    console.log("loading:", loading);
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("localStorage token:", localStorage.getItem("token")?.substring(0, 20) + '...');
    console.log("Token expired?:", isTokenExpired());
    console.log("========================");
  };

  // Éviter le rendu avant que l'authentification soit vérifiée
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Vérification de l'authentification...</p>
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
      authAxios,
      getAuthHeaders,
      isTokenExpired,
      checkAuthStatus,
      isTokenExpiringSoon,
      autoRefreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth avec vérification de sécurité
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Vérification critique pour éviter l'erreur null
  if (context === undefined || context === null) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  
  return context;
};