import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );
  const [loading, setLoading] = useState(true);

  // Initialisation au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRefresh = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedRefresh && savedUser) {
      setToken(savedToken);
      setRefreshToken(savedRefresh);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // Synchronisation automatique quand l’interceptor rafraîchit les tokens
  useEffect(() => {
    const syncAuth = () => {
      const newToken = localStorage.getItem("token");
      const newRefresh = localStorage.getItem("refreshToken");
      const newUser = localStorage.getItem("user");

      if (newToken && newUser) {
        setToken(newToken);
        setUser(JSON.parse(newUser));
      }

      if (newRefresh) {
        setRefreshToken(newRefresh);
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Connexion
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const {
        token: newToken,
        refreshToken: newRefresh,
        user: userData,
      } = response.data.data;

      // Stockage
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefresh);
      localStorage.setItem("user", JSON.stringify(userData));

      // Mise à jour de l'état
      setToken(newToken);
      setRefreshToken(newRefresh);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Erreur login:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Erreur de connexion",
      };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === "admin";
  const isVendor = () => user?.role === "vendeur";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

export default AuthContext;
