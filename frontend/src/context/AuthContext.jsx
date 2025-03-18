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

  // ✅ Vérification du token et récupération de l'utilisateur
  const verifyToken = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/verify", {
        withCredentials: true,
      });

      console.log("🟢 Token vérifié :", response.data);

      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ Stockage persistant
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("🔴 Erreur lors de la vérification du token :", error);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      verifyToken();
    }
  }, []);

  // ✅ Connexion avec gestion des rôles et redirection
  const login = async (credentials) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", credentials, {
        withCredentials: true,
      });

      console.log("🟢 Connexion réussie :", response.data);

      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ Stocker les infos utilisateur

        // 🔀 Redirection intelligente : dernière page visitée ou dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
      }
    } catch (error) {
      console.error("🔴 Erreur de connexion :", error.response?.data?.message || "Erreur inconnue");
      alert(error.response?.data?.message || "Identifiants incorrects !");
    }
  };

  // ✅ Mise à jour de l'utilisateur après un changement de profil
  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // ✅ Déconnexion avec suppression des données stockées
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user"); // ✅ Suppression du stockage utilisateur
      navigate("/"); // ✅ Retour à l'accueil
    } catch (error) {
      console.error("🔴 Erreur lors de la déconnexion :", error);
      alert("Erreur lors de la déconnexion, veuillez réessayer.");
    }
  };

  // ✅ Éviter le rendu avant que l'authentification soit vérifiée
  if (loading) {
    return <p className="text-center mt-5">🔄 Chargement en cours...</p>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
