import axios from "axios";

// Configuration de l'URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 🔹 Ajout du token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Gestion refresh token automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 mais pas le refresh lui-même
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const newToken = res.data?.data?.token;
        const newRefresh = res.data?.data?.refreshToken;

        localStorage.setItem("token", newToken);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Export APIs
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
};

// ==================== TICKETS API ====================
export const ticketsAPI = {
  // Créer des billets
  create: (data) => api.post("/tickets", data),

  // Obtenir la liste des billets
  getAll: (params) => api.get("/tickets", { params }),

  // Obtenir un billet par ID
  getById: (id) => api.get(`/tickets/${id}`),

  // Obtenir les billets d'une commande
  getByOrder: (orderId) => api.get(`/tickets/order/${orderId}`),

  // Scanner un billet
  scan: (id) => api.post(`/tickets/${id}/scan`),

  // Marquer un billet comme envoyé
  markAsSent: (id) => api.post(`/tickets/${id}/sent`),

  // Marquer plusieurs billets comme envoyés
  markMultipleAsSent: (ticketIds) =>
    api.post("/tickets/bulk/sent", { ticketIds }),

  // Supprimer un billet (admin seulement)
  delete: (id) => api.delete(`/tickets/${id}`),

  // Télécharger le PDF d'un billet
  downloadPDF: (id) => api.get(`/tickets/${id}/pdf`, { responseType: "blob" }),
};

// ==================== STATS API ====================
export const statsAPI = {
  // Statistiques globales
  getGlobal: () => api.get("/stats"),

  // Statistiques par catégorie
  getByCategory: () => api.get("/stats/categories"),

  // Statistiques par vendeur (admin seulement)
  getBySeller: () => api.get("/stats/sellers"),

  // Rapport de ventes (admin seulement)
  getSalesReport: (params) => api.get("/stats/sales", { params }),
};

// ==================== USERS API (Admin) ====================
export const usersAPI = {
  // Liste des utilisateurs
  getAll: () => api.get("/users"),

  // Créer un utilisateur
  create: (data) => api.post("/users", data),

  // Mettre à jour un utilisateur
  update: (id, data) => api.put(`/users/${id}`, data),

  // Supprimer un utilisateur
  delete: (id) => api.delete(`/users/${id}`),

  // Changer le mot de passe
  changePassword: (id, data) => api.post(`/users/${id}/password`, data),
};

// ==================== AUDIT API (Admin) ====================
export const auditAPI = {
  // Logs d'audit
  getLogs: (params) => api.get("/audit", { params }),

  // Logs d'un utilisateur
  getUserLogs: (userId, params) => api.get(`/audit/user/${userId}`, { params }),
};

export default api;
