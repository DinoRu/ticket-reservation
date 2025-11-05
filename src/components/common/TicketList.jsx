import React, { useState } from "react";
import {
  Send,
  Download,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ticketsAPI } from "../../services/api";

const TicketsList = ({ tickets, onMarkAsSent }) => {
  const [sendingStatus, setSendingStatus] = useState({});

  const formatPhoneForWhatsApp = (phone) => {
    // Nettoyer le numéro (enlever espaces, +, etc.)
    let cleaned = phone.replace(/\D/g, "");

    // Si commence par 7, ajouter le code pays russe
    if (cleaned.startsWith("7") && cleaned.length === 11) {
      return cleaned;
    }

    // Si pas de code pays, ajouter 7 pour la Russie
    if (cleaned.length === 10) {
      return "7" + cleaned;
    }

    return cleaned;
  };

  const getWhatsAppMessage = (ticket) => {
    const message = `
🎫 *Votre Billet pour le Concert - Didi B*

👤 *Nom:* ${ticket.name}
🎟️ *Catégorie:* ${ticket.category.toUpperCase()}
💰 *Prix:* ${ticket.formattedPrice || ticket.price + " ₽"}
🆔 *ID:* ${ticket.id}

📱 *Télécharger votre billet PDF:*
${ticket.pdfUrl || ticket.pdfPath || ""}

⚠️ *IMPORTANT:*
• Présentez ce billet à l'entrée
• Une pièce d'identité sera demandée
• Le billet est valable pour 1 personne
• Pas de remboursement

📍 *Lieu:* Salle de Concert Moscou
📅 *Date:* 15 Décembre 2025
⏰ *Heure:* 20h00

À très bientôt ! 🎤🎶
    `.trim();

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = async (ticket) => {
    setSendingStatus((prev) => ({ ...prev, [ticket.id]: "sending" }));

    try {
      // Formater le numéro
      const phoneNumber = formatPhoneForWhatsApp(ticket.phone);

      // Créer le message
      const message = getWhatsAppMessage(ticket);

      // Créer l'URL WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

      // Ouvrir WhatsApp dans un nouvel onglet
      window.open(whatsappUrl, "_blank");

      // Attendre un peu puis marquer comme envoyé
      setTimeout(async () => {
        try {
          await ticketsAPI.markAsSent(ticket.id);
          setSendingStatus((prev) => ({ ...prev, [ticket.id]: "sent" }));
          if (onMarkAsSent) {
            onMarkAsSent(ticket.id);
          }
        } catch (error) {
          console.error("Erreur marquage envoi:", error);
          setSendingStatus((prev) => ({ ...prev, [ticket.id]: "error" }));
        }
      }, 2000);
    } catch (error) {
      console.error("Erreur ouverture WhatsApp:", error);
      setSendingStatus((prev) => ({ ...prev, [ticket.id]: "error" }));
    }
  };

  const handleDownloadPDF = (ticket) => {
    if (ticket.pdfUrl || ticket.pdfPath) {
      window.open(ticket.pdfUrl || ticket.pdfPath, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {ticket.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.category === "vip"
                      ? "bg-purple-100 text-purple-800"
                      : ticket.category === "standard"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket.category.toUpperCase()}
                </span>
                {(ticket.sent || sendingStatus[ticket.id] === "sent") && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Envoyé
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Téléphone:</span> {ticket.phone}
                </div>
                <div>
                  <span className="font-medium">Prix:</span>{" "}
                  {ticket.formattedPrice || ticket.price + " ₽"}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">ID:</span> {ticket.id}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {/* Bouton WhatsApp */}
              <button
                onClick={() => handleWhatsAppClick(ticket)}
                disabled={sendingStatus[ticket.id] === "sending" || ticket.sent}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    sendingStatus[ticket.id] === "sent" || ticket.sent
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : sendingStatus[ticket.id] === "sending"
                      ? "bg-gray-100 text-gray-500 cursor-wait"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }
                `}
              >
                {sendingStatus[ticket.id] === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi...
                  </>
                ) : sendingStatus[ticket.id] === "sent" || ticket.sent ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Envoyé
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    WhatsApp
                  </>
                )}
              </button>

              {/* Bouton Télécharger PDF */}
              <button
                onClick={() => handleDownloadPDF(ticket)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketsList;
