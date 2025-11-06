import React, { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api";
import { useAuth } from "../../contexts/Authcontext";
import {
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import TicketsList from "./TicketList";

const AllTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [currentPage, category, status]);

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        limit: 20,
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
      };

      const response = await ticketsAPI.getAll(params);
      setTickets(response.data.data.tickets);
      setPagination(response.data.data.pagination);
    } catch (err) {
      console.error("Erreur chargement billets:", err);
      setError(err.response?.data?.message || "Erreur chargement des billets");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTickets();
  };

  const handleMarkAsSent = (ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) => (t.id === ticketId ? { ...t, sent: true } : t))
    );
  };

  const categories = [
    { value: "", label: "Toutes les catégories" },
    { value: "standard", label: "Standard" },
    { value: "vip", label: "VIP" },
    // { value: "vvip", label: "VVIP" },
  ];

  const statuses = [
    { value: "", label: "Tous les statuts" },
    { value: "used", label: "Utilisés" },
    { value: "available", label: "Disponibles" },
    { value: "sent", label: "Envoyés" },
    { value: "not-sent", label: "Non envoyés" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Billets</h2>
          <p className="text-gray-600 mt-1">
            {pagination?.total || 0} billet(s) au total
          </p>
        </div>

        <button
          onClick={loadTickets}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Actualiser
            </>
          )}
        </button>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, téléphone, ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Rechercher
          </button>
        </form>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Liste des billets */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Chargement des billets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-24 h-24 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun billet trouvé
          </h3>
          <p className="text-gray-600">
            {search || category || status
              ? "Essayez de modifier vos filtres de recherche"
              : "Créez votre premier billet pour commencer"}
          </p>
        </div>
      ) : (
        <>
          {/* Grille de billets */}
          <TicketsList tickets={tickets} onMarkAsSent={handleMarkAsSent} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-md px-6 py-4">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} sur {pagination.totalPages}
                <span className="ml-2 text-gray-400">
                  ({pagination.total} billet(s) au total)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            pageNum === pagination.currentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats rapides */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination?.total || tickets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Envoyés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t) => t.sent).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t) => t.used).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t) => !t.used).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTickets;
