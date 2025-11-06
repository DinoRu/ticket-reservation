import React, { useState } from "react";
import { ticketsAPI } from "../../services/api";
import {
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

const CreateTickets = ({ onSuccess }) => {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [attendees, setAttendees] = useState([
    { name: "", phone: "", category: "standard" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdTickets, setCreatedTickets] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(null);

  const categories = [
    { value: "standard", label: "Standard", price: 5000 },
    { value: "vip", label: "VIP", price: 10000 },
  ];

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", phone: "", category: "standard" }]);
  };

  const removeAttendee = (index) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index, field, value) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const calculateTotal = () => {
    return attendees.reduce((sum, attendee) => {
      const cat = categories.find((c) => c.value === attendee.category);
      return sum + (cat?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (!clientName.trim() || !clientPhone.trim()) {
        throw new Error("Nom et téléphone du client requis");
      }
      const invalidAttendees = attendees.filter(
        (a) => !a.name.trim() || !a.phone.trim()
      );
      if (invalidAttendees.length > 0) {
        throw new Error(
          "Tous les participants doivent avoir un nom et un téléphone"
        );
      }

      // Créer les billets
      const response = await ticketsAPI.create({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          phone: a.phone.trim(),
          category: a.category,
        })),
      });

      console.log("Réponse API:", response);

      // Gestion robuste de la réponse
      const responseData = response.data?.data || response.data || response;
      const tickets = responseData.tickets || [responseData] || [];

      // S'assurer que chaque ticket a une URL PDF
      const ticketsWithPdf = tickets.map((ticket) => ({
        ...ticket,
        pdfUrl:
          ticket.pdfUrl ||
          `/api/tickets/${ticket.id}/pdf` ||
          `/api/tickets/${ticket._id}/pdf`,
      }));

      setSuccess(`${tickets.length} billet(s) créé(s) avec succès !`);
      const newCreatedTickets = {
        tickets: ticketsWithPdf,
        orderId: responseData.orderId || `CMD-${Date.now()}`,
        total: responseData.total || calculateTotal(),
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
      };
      setCreatedTickets(newCreatedTickets);

      // Ouvrir automatiquement le PDF si un seul ticket
      if (ticketsWithPdf.length === 1) {
        handleViewPdf(ticketsWithPdf[0]);
      }

      // Réinitialiser le formulaire
      setClientName("");
      setClientPhone("");
      setAttendees([{ name: "", phone: "", category: "standard" }]);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        document.getElementById("created-tickets")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      console.error("Erreur création:", err);
      setError(
        err.response?.data?.message || err.message || "Erreur création billets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSent = (ticketId) => {
    if (createdTickets) {
      setCreatedTickets({
        ...createdTickets,
        tickets: createdTickets.tickets.map((t) =>
          t.id === ticketId ? { ...t, sent: true } : t
        ),
      });
    }
  };

  const handleWhatsApp = (phone, ticketData) => {
    // Formater le numéro de téléphone
    const formattedPhone = phone.replace(/[\s+]/g, "");

    // Créer le message WhatsApp
    const message =
      `🎫 VOTRE BILLET POUR L'ÉVÉNEMENT 🎫\n\n` +
      `Nom : ${ticketData.attendeeName || ticketData.name}\n` +
      `Téléphone : ${ticketData.attendeePhone || ticketData.phone}\n` +
      `Catégorie : ${ticketData.category.toUpperCase()}\n` +
      `Prix : ${
        ticketData.price ||
        categories.find((c) => c.value === ticketData.category)?.price ||
        0
      } ₽\n` +
      `ID du billet : ${ticketData.id || ticketData._id || "N/A"}\n\n` +
      `📞 Contact : ${createdTickets.clientPhone}\n` +
      `Merci pour votre confiance !`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${formattedPhone}?text=${encodedMessage}`,
      "_blank"
    );
    handleMarkAsSent(ticketData.id || ticketData._id);
  };

  const handleViewPdf = (ticket) => {
    setViewingPdf(ticket);
  };

  const handleClosePdf = () => {
    setViewingPdf(null);
  };

  const handleDownloadPdf = (ticket) => {
    const pdfUrl =
      ticket.pdfUrl ||
      `/api/tickets/${ticket.id}/pdf` ||
      `/api/tickets/${ticket._id}/pdf`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `billet-${ticket.id || ticket._id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour obtenir le prix d'un billet
  const getTicketPrice = (ticket) => {
    return (
      ticket.price ||
      categories.find((c) => c.value === ticket.category)?.price ||
      0
    );
  };

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = (ticket) => {
    return ticket.attendeeName || ticket.name || "Non spécifié";
  };

  // Fonction pour obtenir le téléphone d'affichage
  const getDisplayPhone = (ticket) => {
    return ticket.attendeePhone || ticket.phone || "Non spécifié";
  };

  return (
    <div className="space-y-8">
      {/* Formulaire de création */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Créer des Billets</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && !createdTickets && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations Client */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Informations Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Client *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ivan Petrov"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone Client *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+7 999 999 9999"
                  required
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Participants ({attendees.length})
              </h3>
              <button
                type="button"
                onClick={addAttendee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="space-y-4">
              {attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Participant {index + 1}
                    </span>
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) =>
                          updateAttendee(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom du participant"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={attendee.phone}
                        onChange={(e) =>
                          updateAttendee(index, "phone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+7 999 999 9999"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        value={attendee.category}
                        onChange={(e) =>
                          updateAttendee(index, "category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label} - {cat.price} ₽
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-lg font-semibold text-gray-900">
              Total à payer
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {calculateTotal().toLocaleString()} ₽
            </span>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Créer les Billets
              </>
            )}
          </button>
        </form>
      </div>

      {/* Section d'affichage des billets créés avec PDF */}
      {createdTickets &&
        createdTickets.tickets &&
        createdTickets.tickets.length > 0 && (
          <div
            id="created-tickets"
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Billets Créés avec Succès !
                </h2>
                <p className="text-gray-600 mt-1">
                  Commande:{" "}
                  <span className="font-mono font-semibold">
                    {createdTickets.orderId}
                  </span>
                </p>
                <p className="text-gray-600">
                  Client:{" "}
                  <span className="font-semibold">
                    {createdTickets.clientName}
                  </span>{" "}
                  - Téléphone:{" "}
                  <span className="font-semibold">
                    {createdTickets.clientPhone}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total payé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {createdTickets.total.toLocaleString()} ₽
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📱 Actions disponibles:</strong> Vous pouvez visualiser
                le PDF du billet, le télécharger, ou l'envoyer par WhatsApp au
                participant.
              </p>
            </div>

            {/* Affichage des billets individuels avec PDF */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Billets Générés ({createdTickets.tickets.length})
              </h3>
              {createdTickets.tickets.map((ticket, index) => (
                <div
                  key={ticket.id || ticket._id || index}
                  className="border-2 border-green-200 rounded-lg p-6 bg-green-50"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Informations du billet */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {getDisplayName(ticket)}
                          </h4>
                          <p className="text-gray-600">
                            📞 {getDisplayPhone(ticket)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Catégorie</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {ticket.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prix</p>
                          <p className="font-bold text-blue-600">
                            {getTicketPrice(ticket).toLocaleString()} ₽
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <p
                            className={`font-semibold ${
                              ticket.sent ? "text-green-600" : "text-orange-600"
                            }`}
                          >
                            {ticket.sent ? "✅ Envoyé" : "⏳ En attente"}
                          </p>
                        </div>
                      </div>
                      {/* ID du billet */}
                      {(ticket.id || ticket._id) && (
                        <div className="p-3 bg-gray-100 rounded">
                          <p className="text-xs text-gray-600">ID du billet:</p>
                          <p className="text-sm font-mono font-semibold">
                            {ticket.id || ticket._id}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions PDF et WhatsApp */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPdf(ticket)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Voir PDF
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(ticket)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                      {!ticket.sent ? (
                        <button
                          onClick={() =>
                            handleWhatsApp(getDisplayPhone(ticket), ticket)
                          }
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <span>📱 Envoyer WhatsApp</span>
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300 text-center">
                          <span className="font-semibold">✅ Envoyé</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton pour créer une nouvelle commande */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCreatedTickets(null)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Créer une Nouvelle Commande
              </button>
            </div>
          </div>
        )}

      {/* Modal pour visualiser le PDF */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                PDF du billet - {getDisplayName(viewingPdf)}
              </h3>
              <button
                onClick={handleClosePdf}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <iframe
                src={
                  viewingPdf.pdfUrl ||
                  `/api/tickets/${viewingPdf.id}/pdf` ||
                  `/api/tickets/${viewingPdf._id}/pdf`
                }
                className="w-full h-full min-h-[500px] rounded border"
                title={`PDF du billet - ${getDisplayName(viewingPdf)}`}
              />
            </div>
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => handleDownloadPdf(viewingPdf)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger le PDF
              </button>
              <button
                onClick={handleClosePdf}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTickets;
