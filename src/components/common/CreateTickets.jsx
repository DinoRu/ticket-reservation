import React, { useState } from "react";
import { ticketsAPI } from "../../services/api";
import { Plus, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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

      // Succès
      setSuccess(
        `${response.data.data.tickets.length} billet(s) créé(s) avec succès !`
      );
      setCreatedTickets(response.data.data);

      // Réinitialiser le formulaire
      setClientName("");
      setClientPhone("");
      setAttendees([{ name: "", phone: "", category: "standard" }]);

      // Callback pour rafraîchir les stats
      if (onSuccess) {
        onSuccess();
      }

      // Auto-scroll vers les billets créés
      setTimeout(() => {
        document.getElementById("created-tickets")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Erreur création billets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSent = (ticketId) => {
    // Mettre à jour l'état local
    if (createdTickets) {
      setCreatedTickets({
        ...createdTickets,
        tickets: createdTickets.tickets.map((t) =>
          t.id === ticketId ? { ...t, sent: true } : t
        ),
      });
    }
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

      {/* Billets créés */}
      {createdTickets && (
        <div id="created-tickets" className="bg-white rounded-lg shadow-md p-6">
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {createdTickets.total.toLocaleString()} ₽
              </p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📱 Envoi WhatsApp:</strong> Cliquez sur le bouton
              "WhatsApp" pour envoyer le billet au participant. Le lien
              s'ouvrira dans WhatsApp Web ou votre application WhatsApp.
            </p>
          </div>

          <TicketsList
            tickets={createdTickets.tickets}
            onMarkAsSent={handleMarkAsSent}
          />

          <button
            onClick={() => setCreatedTickets(null)}
            className="mt-6 w-full py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Créer une Nouvelle Commande
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTickets;
