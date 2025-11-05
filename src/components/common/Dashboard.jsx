import React, { useState, useEffect } from "react";
import { statsAPI } from "../../services/api";
import { useAuth } from "../../contexts/Authcontext";
import Navbar from "./Navbar";
import {
  Loader2,
  Ticket,
  ScanLine,
  DollarSign,
  TrendingUp,
  Package,
  List,
} from "lucide-react";
import CreateTickets from "./CreateTickets";
import AllTickets from "./AllTickets";
import StatsCard from "./StatCard";

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list"); // Commencer sur "list"

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await statsAPI.getGlobal();
        setStats(response.data.data);
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const refreshStats = () => {
    setLoading(true);
    statsAPI.getGlobal().then((res) => {
      setStats(res.data.data);
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin() ? "Dashboard Administrateur" : "Dashboard Vendeur"}
          </h1>
          <p className="text-gray-500 mt-2">
            Gérez vos billets et consultez les statistiques
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={Ticket}
                title="Total Billets"
                value={stats.total || 0}
                subtitle={`${stats.used || 0} utilisés`}
                color="blue"
              />
              <StatsCard
                icon={DollarSign}
                title="Revenus"
                value={`${(stats.revenue || 0).toLocaleString()} ₽`}
                subtitle={`${stats.orders || 0} commandes`}
                color="green"
              />
              <StatsCard
                icon={TrendingUp}
                title="Taux d'utilisation"
                value={`${stats.usageRate || 0}%`}
                subtitle={`${stats.available || 0} disponibles`}
                color="purple"
              />
              <StatsCard
                icon={Package}
                title="Envoyés"
                value={stats.sent || 0}
                subtitle={`${stats.sentRate || 0}% des billets`}
                color="yellow"
              />
            </div>
          )
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("list")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <List className="w-5 h-5 inline mr-2" />
                Mes Billets
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Ticket className="w-5 h-5 inline mr-2" />
                Créer des Billets
              </button>

              <button
                onClick={() => setActiveTab("scan")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "scan"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ScanLine className="w-5 h-5 inline mr-2" />
                Scanner
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "list" && <AllTickets />}

        {activeTab === "create" && <CreateTickets onSuccess={refreshStats} />}

        {activeTab === "scan" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <ScanLine className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">Scanner un Billet</h2>
            </div>
            <p className="text-gray-600 text-center py-12">
              Fonctionnalité de scan à venir...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
