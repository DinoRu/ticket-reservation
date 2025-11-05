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

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
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
