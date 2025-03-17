import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Vérification du token
  const verifyToken = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/verify", {
        withCredentials: true, // ✅ Envoie bien les cookies sécurisés
      });

      console.log("🟢 Token vérifié :", response.data); // 🔍 Debug

      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("🔴 Erreur lors de la vérification du token :", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  // ✅ Connexion
  const login = async (credentials) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", credentials, {
        withCredentials: true, // ✅ Envoie bien les cookies
      });

      console.log("🟢 Réponse du serveur après login :", response.data); // 🔍 Debug

      if (response.status === 200) {
        await verifyToken(); // 🔄 Vérification après connexion
        navigate("/dashboard"); // ✅ Redirige uniquement si l'auth est confirmée
      }
    } catch (error) {
      console.error("🔴 Erreur de connexion :", error.response?.data?.message || "Erreur inconnue");
    }
  };

  // ✅ Déconnexion
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setIsAuthenticated(false);
      setUser(null);
      navigate("/"); // ✅ Redirige vers l'accueil après déconnexion
    } catch (error) {
      console.error("🔴 Erreur lors de la déconnexion :", error);
    }
  };

  // ✅ Éviter le rendu avant que l'authentification soit vérifiée
  if (loading) {
    return <p className="text-center mt-5">🔄 Chargement en cours...</p>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
