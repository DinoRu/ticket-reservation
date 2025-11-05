import React, { useState, useEffect } from "react";
import {
  Camera,
  Ticket,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  MapPin,
  Download,
  Mail,
  Send,
  ShoppingCart,
  Plus,
  Trash2,
  CreditCard,
} from "lucide-react";

// Fonction pour générer un ID unique
const generateTicketId = () => {
  return (
    "DIDI-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substr(2, 9).toUpperCase()
  );
};

// Fonction pour générer un QR code
const generateQRCode = (data) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    data
  )}`;
};

// Simuler l'envoi d'email
const sendEmailWithTicket = async (email, tickets) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `📧 Email envoyé à ${email} avec ${tickets.length} billet(s)`
      );
      resolve(true);
    }, 1000);
  });
};

const TicketSystem = () => {
  const [activeTab, setActiveTab] = useState("purchase");
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [lastScanResult, setLastScanResult] = useState(null);

  // État pour l'achat
  const [purchaseStep, setPurchaseStep] = useState(1); // 1: infos, 2: paiement, 3: confirmation
  const [buyerInfo, setBuyerInfo] = useState({
    email: "",
    phone: "",
    sendCopy: true,
  });

  const [attendees, setAttendees] = useState([
    { id: 1, name: "", email: "", category: "standard" },
  ]);

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [currentOrder, setCurrentOrder] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  // Informations du concert
  const concertInfo = {
    artist: "Didi B",
    venue: "Moscou Concert Hall",
    date: "15 Décembre 2025",
    time: "20:00",
    location: "Moscou, Russie",
  };

  // Catégories de billets
  const categories = {
    vip: { name: "VIP", price: 15000, currency: "₽", color: "bg-yellow-500" },
    standard: {
      name: "Standard",
      price: 7500,
      currency: "₽",
      color: "bg-blue-500",
    },
    earlybird: {
      name: "Early Bird",
      price: 5000,
      currency: "₽",
      color: "bg-green-500",
    },
  };

  // Ajouter un participant
  const addAttendee = () => {
    const newId = Math.max(...attendees.map((a) => a.id), 0) + 1;
    setAttendees([
      ...attendees,
      { id: newId, name: "", email: "", category: "standard" },
    ]);
  };

  // Supprimer un participant
  const removeAttendee = (id) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((a) => a.id !== id));
    }
  };

  // Mettre à jour un participant
  const updateAttendee = (id, field, value) => {
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // Calculer le total
  const calculateTotal = () => {
    return attendees.reduce((sum, attendee) => {
      return sum + categories[attendee.category].price;
    }, 0);
  };

  // Valider l'étape 1
  const validateStep1 = () => {
    if (!buyerInfo.email) {
      alert("Veuillez entrer votre email");
      return false;
    }

    for (let attendee of attendees) {
      if (!attendee.name.trim()) {
        alert("Veuillez remplir le nom de tous les participants");
        return false;
      }
      if (!attendee.email.trim()) {
        alert("Veuillez remplir l'email de tous les participants");
        return false;
      }
    }
    return true;
  };

  // Processus d'achat
  const processPurchase = async () => {
    if (
      !paymentInfo.cardNumber ||
      !paymentInfo.cardName ||
      !paymentInfo.expiry ||
      !paymentInfo.cvv
    ) {
      alert("Veuillez remplir toutes les informations de paiement");
      return;
    }

    setSendingEmails(true);

    // Générer les billets pour chaque participant
    const generatedTickets = [];
    const orderId = "ORDER-" + Date.now();

    for (let attendee of attendees) {
      const ticketId = generateTicketId();
      const ticket = {
        id: ticketId,
        orderId: orderId,
        name: attendee.name,
        email: attendee.email,
        category: attendee.category,
        qrData: JSON.stringify({
          ticketId: ticketId,
          event: "Didi B - Moscou",
          name: attendee.name,
          category: attendee.category,
          date: concertInfo.date,
        }),
        createdAt: new Date().toLocaleString("fr-FR"),
        used: false,
      };
      generatedTickets.push(ticket);
    }

    // Créer la commande
    const order = {
      id: orderId,
      buyerEmail: buyerInfo.email,
      buyerPhone: buyerInfo.phone,
      tickets: generatedTickets,
      total: calculateTotal(),
      createdAt: new Date().toLocaleString("fr-FR"),
      status: "completed",
    };

    // Enregistrer les billets et la commande
    setTickets([...tickets, ...generatedTickets]);
    setOrders([...orders, order]);
    setCurrentOrder(order);

    // Envoyer les emails à chaque participant
    const emailPromises = [];

    // Envoyer à chaque participant son billet
    for (let ticket of generatedTickets) {
      emailPromises.push(sendEmailWithTicket(ticket.email, [ticket]));
    }

    // Envoyer une copie à l'acheteur si demandé
    if (buyerInfo.sendCopy) {
      emailPromises.push(
        sendEmailWithTicket(buyerInfo.email, generatedTickets)
      );
    }

    await Promise.all(emailPromises);

    setSendingEmails(false);
    setPurchaseStep(3);
  };

  // Nouvelle commande
  const startNewPurchase = () => {
    setPurchaseStep(1);
    setBuyerInfo({ email: "", phone: "", sendCopy: true });
    setAttendees([{ id: 1, name: "", email: "", category: "standard" }]);
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "", cvv: "" });
    setCurrentOrder(null);
  };

  // Scanner un billet
  const scanTicket = () => {
    if (!scanInput.trim()) {
      alert("Veuillez entrer un code de billet");
      return;
    }

    const ticket = tickets.find((t) => t.id === scanInput.trim());

    if (!ticket) {
      setLastScanResult({
        success: false,
        message: "Billet non trouvé",
        details: "Ce billet n'existe pas dans le système",
      });
      return;
    }

    if (ticket.used) {
      setLastScanResult({
        success: false,
        message: "Billet déjà utilisé",
        details: `Ce billet a déjà été scanné le ${ticket.usedAt}`,
        ticket: ticket,
      });
      return;
    }

    // Marquer le billet comme utilisé
    const updatedTickets = tickets.map((t) =>
      t.id === scanInput.trim()
        ? { ...t, used: true, usedAt: new Date().toLocaleString("fr-FR") }
        : t
    );
    setTickets(updatedTickets);

    setLastScanResult({
      success: true,
      message: "Billet valide",
      details: "Entrée autorisée",
      ticket: ticket,
    });

    setScanInput("");
  };

  // Télécharger un billet
  const downloadTicket = (ticket) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 1000;

    // Fond
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure dorée
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Titre
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CONCERT DIDI B", canvas.width / 2, 100);

    // Infos concert
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    ctx.fillText(concertInfo.venue, canvas.width / 2, 150);
    ctx.fillText(
      concertInfo.date + " - " + concertInfo.time,
      canvas.width / 2,
      190
    );
    ctx.fillText(concertInfo.location, canvas.width / 2, 230);

    // Catégorie
    const categoryInfo = categories[ticket.category];
    ctx.fillStyle =
      categoryInfo.color === "bg-yellow-500"
        ? "#FFD700"
        : categoryInfo.color === "bg-blue-500"
        ? "#3B82F6"
        : "#10B981";
    ctx.font = "bold 32px Arial";
    ctx.fillText(
      categoryInfo.name + " - " + categoryInfo.price + categoryInfo.currency,
      canvas.width / 2,
      290
    );

    // Ligne de séparation
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 320);
    ctx.lineTo(canvas.width - 80, 320);
    ctx.stroke();

    // Nom du détenteur
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    ctx.fillText("DÉTENTEUR:", canvas.width / 2, 370);
    ctx.font = "bold 32px Arial";
    ctx.fillText(ticket.name.toUpperCase(), canvas.width / 2, 410);

    // ID du billet
    ctx.font = "20px Arial";
    ctx.fillText("ID: " + ticket.id, canvas.width / 2, 450);

    // QR Code
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, (canvas.width - 300) / 2, 500, 300, 300);

      ctx.fillStyle = "#ffffff";
      ctx.font = "18px Arial";
      ctx.fillText("Présentez ce QR code à l'entrée", canvas.width / 2, 850);

      ctx.fillStyle = "#ff6b6b";
      ctx.font = "bold 16px Arial";
      ctx.fillText(
        "⚠ Ce billet est personnel et non transférable",
        canvas.width / 2,
        900
      );

      const link = document.createElement("a");
      link.download = `billet-${ticket.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = generateQRCode(ticket.qrData);
  };

  // Télécharger tous les billets d'une commande
  const downloadAllTickets = (orderTickets) => {
    orderTickets.forEach((ticket, index) => {
      setTimeout(() => {
        downloadTicket(ticket);
      }, index * 500);
    });
  };

  // Statistiques
  const stats = {
    total: tickets.length,
    used: tickets.filter((t) => t.used).length,
    available: tickets.filter((t) => !t.used).length,
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Concert Didi B
              </h1>
              <div className="flex flex-wrap gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{concertInfo.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {concertInfo.date} - {concertInfo.time}
                  </span>
                </div>
              </div>
            </div>
            <Ticket className="w-16 h-16 text-yellow-400" />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Commandes</div>
            <div className="text-3xl font-bold text-white">{stats.orders}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm mb-1">Total Billets</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
            <div className="text-white/60 text-sm mb-1">Disponibles</div>
            <div className="text-3xl font-bold text-white">
              {stats.available}
            </div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
            <div className="text-white/60 text-sm mb-1">Utilisés</div>
            <div className="text-3xl font-bold text-white">{stats.used}</div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
            <div className="text-white/60 text-sm mb-1">Revenus</div>
            <div className="text-2xl font-bold text-white">
              {stats.revenue.toLocaleString()}₽
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("purchase")}
            className={`flex-1 min-w-[150px] py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === "purchase"
                ? "bg-white text-purple-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Acheter Billets
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 min-w-[150px] py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === "scan"
                ? "bg-white text-purple-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 min-w-[150px] py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-white text-purple-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Ticket className="w-5 h-5 inline mr-2" />
            Commandes
          </button>
        </div>

        {/* Contenu */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          {/* Tab: Achat de billets */}
          {activeTab === "purchase" && (
            <div>
              {purchaseStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Acheter des Billets
                  </h2>

                  {/* Informations de l'acheteur */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Vos Coordonnées
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">
                          Email * (pour recevoir les billets)
                        </label>
                        <input
                          type="email"
                          value={buyerInfo.email}
                          onChange={(e) =>
                            setBuyerInfo({
                              ...buyerInfo,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2">
                          Téléphone (optionnel)
                        </label>
                        <input
                          type="tel"
                          value={buyerInfo.phone}
                          onChange={(e) =>
                            setBuyerInfo({
                              ...buyerInfo,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="+7 xxx xxx xxxx"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={buyerInfo.sendCopy}
                          onChange={(e) =>
                            setBuyerInfo({
                              ...buyerInfo,
                              sendCopy: e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span>M'envoyer une copie de tous les billets</span>
                      </label>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">
                        Participants ({attendees.length})
                      </h3>
                      <button
                        onClick={addAttendee}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Ajouter
                      </button>
                    </div>

                    <div className="space-y-4">
                      {attendees.map((attendee, index) => (
                        <div
                          key={attendee.id}
                          className="bg-white/10 rounded-lg p-4 border border-white/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-bold">
                                  Billet #{index + 1}
                                </span>
                                {attendees.length > 1 && (
                                  <button
                                    onClick={() => removeAttendee(attendee.id)}
                                    className="ml-auto p-1 text-red-400 hover:text-red-300 transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-white/80 text-sm mb-1">
                                    Nom complet *
                                  </label>
                                  <input
                                    type="text"
                                    value={attendee.name}
                                    onChange={(e) =>
                                      updateAttendee(
                                        attendee.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                                    placeholder="Jean Dupont"
                                  />
                                </div>

                                <div>
                                  <label className="block text-white/80 text-sm mb-1">
                                    Email *
                                  </label>
                                  <input
                                    type="email"
                                    value={attendee.email}
                                    onChange={(e) =>
                                      updateAttendee(
                                        attendee.id,
                                        "email",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                                    placeholder="jean@email.com"
                                  />
                                </div>

                                <div>
                                  <label className="block text-white/80 text-sm mb-1">
                                    Catégorie
                                  </label>
                                  <select
                                    value={attendee.category}
                                    onChange={(e) =>
                                      updateAttendee(
                                        attendee.id,
                                        "category",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                                  >
                                    <option value="earlybird">
                                      Early Bird - {categories.earlybird.price}₽
                                    </option>
                                    <option value="standard">
                                      Standard - {categories.standard.price}₽
                                    </option>
                                    <option value="vip">
                                      VIP - {categories.vip.price}₽
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/80 text-lg">
                          Total à payer
                        </div>
                        <div className="text-white text-sm mt-1">
                          {attendees.length} billet(s)
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-white">
                        {calculateTotal().toLocaleString()} ₽
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (validateStep1()) {
                        setPurchaseStep(2);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-800 transition-all"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              )}

              {purchaseStep === 2 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setPurchaseStep(1)}
                    className="text-white/80 hover:text-white mb-4"
                  >
                    ← Retour
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    Paiement Sécurisé
                  </h2>

                  {/* Récapitulatif */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Récapitulatif
                    </h3>
                    <div className="space-y-2">
                      {attendees.map((attendee, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-white"
                        >
                          <span>
                            {attendee.name} -{" "}
                            {categories[attendee.category].name}
                          </span>
                          <span className="font-semibold">
                            {categories[attendee.category].price}₽
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between text-white text-xl font-bold">
                          <span>Total</span>
                          <span>{calculateTotal().toLocaleString()}₽</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulaire de paiement */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-6 h-6 text-white" />
                      <h3 className="text-xl font-bold text-white">
                        Informations de Carte
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white mb-2">
                          Numéro de carte
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">
                          Nom sur la carte
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardName}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="JEAN DUPONT"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2">
                            Date d'expiration
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.expiry}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                expiry: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                            placeholder="MM/AA"
                            maxLength="5"
                          />
                        </div>

                        <div>
                          <label className="block text-white mb-2">CVV</label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <p className="text-white/80 text-sm flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      Paiement sécurisé • Les billets seront envoyés par email
                      immédiatement après le paiement
                    </p>
                  </div>

                  <button
                    onClick={processPurchase}
                    disabled={sendingEmails}
                    className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingEmails ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Envoi des billets...
                      </span>
                    ) : (
                      `Payer ${calculateTotal().toLocaleString()}₽`
                    )}
                  </button>
                </div>
              )}

              {purchaseStep === 3 && currentOrder && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-16 h-16 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Paiement Réussi !
                    </h2>
                    <p className="text-white/80 text-lg">
                      Vos billets ont été envoyés par email
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">
                        Emails envoyés à:
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {currentOrder.tickets.map((ticket, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>{ticket.name}</span>
                          <span className="text-white/60">
                            ({ticket.email})
                          </span>
                        </div>
                      ))}
                      {buyerInfo.sendCopy &&
                        buyerInfo.email !== currentOrder.tickets[0].email && (
                          <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span>Copie acheteur</span>
                            <span className="text-white/60">
                              ({buyerInfo.email})
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Vos Billets
                    </h3>
                    <div className="space-y-3">
                      {currentOrder.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white font-bold">
                              {ticket.name}
                            </div>
                            <div className="text-white/60 text-sm">
                              {categories[ticket.category].name}
                            </div>
                            <div className="text-white/40 text-xs font-mono">
                              {ticket.id}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadTicket(ticket)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => downloadAllTickets(currentOrder.tickets)}
                      className="w-full mt-4 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger tous les billets
                    </button>
                  </div>

                  <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-white/80 text-sm">
                      💡 Conseil: Chaque participant a reçu son billet par
                      email. Ils peuvent aussi le télécharger en cliquant sur le
                      lien dans l'email ou en scannant le QR code à l'entrée.
                    </p>
                  </div>

                  <button
                    onClick={startNewPurchase}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-lg transition-all"
                  >
                    Acheter d'autres billets
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Scanner */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Scanner un Billet
              </h2>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white mb-2 text-lg">
                  Code du billet (ID)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && scanTicket()}
                    className="flex-1 px-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white text-lg placeholder-white/50"
                    placeholder="DIDI-1234567890-ABC123XYZ"
                  />
                  <button
                    onClick={scanTicket}
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                  >
                    Scanner
                  </button>
                </div>
              </div>

              {lastScanResult && (
                <div
                  className={`rounded-xl p-6 border-2 ${
                    lastScanResult.success
                      ? "bg-green-500/20 border-green-500"
                      : "bg-red-500/20 border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {lastScanResult.success ? (
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {lastScanResult.message}
                      </h3>
                      <p className="text-white/80">{lastScanResult.details}</p>
                    </div>
                  </div>

                  {lastScanResult.ticket && (
                    <div className="bg-white/10 rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-2 gap-3 text-white">
                        <div>
                          <span className="text-white/60">Nom:</span>
                          <span className="ml-2 font-semibold">
                            {lastScanResult.ticket.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60">Catégorie:</span>
                          <span className="ml-2 font-semibold">
                            {categories[lastScanResult.ticket.category].name}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-white/60">ID:</span>
                          <span className="ml-2 font-mono text-sm">
                            {lastScanResult.ticket.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Instructions
                </h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• Scannez le QR code du billet avec votre appareil</li>
                  <li>• Ou entrez manuellement l'ID du billet</li>
                  <li>• Le système vérifiera automatiquement la validité</li>
                  <li>• Les billets déjà utilisés seront refusés</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: Commandes */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">
                Toutes les Commandes ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucune commande pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/10 rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            Commande #{order.id}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {order.createdAt}
                          </p>
                          <p className="text-white/60 text-sm">
                            Acheteur: {order.buyerEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {order.total.toLocaleString()}₽
                          </div>
                          <div className="text-white/60 text-sm">
                            {order.tickets.length} billet(s)
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${
                                    ticket.category === "vip"
                                      ? "bg-yellow-500 text-black"
                                      : ticket.category === "standard"
                                      ? "bg-blue-500 text-white"
                                      : "bg-green-500 text-white"
                                  }`}
                                >
                                  {categories[ticket.category].name}
                                </span>
                                {ticket.used && (
                                  <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                                    UTILISÉ
                                  </span>
                                )}
                              </div>
                              <div className="text-white font-semibold mt-1">
                                {ticket.name}
                              </div>
                              <div className="text-white/60 text-sm">
                                {ticket.email}
                              </div>
                              <div className="text-white/40 text-xs font-mono">
                                {ticket.id}
                              </div>
                            </div>
                            <button
                              onClick={() => downloadTicket(ticket)}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Télécharger
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSystem;
