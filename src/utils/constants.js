export const TICKET_CATEGORIES = {
  vip: {
    name: "VIP",
    price: 10000,
    currency: "RUB",
    color: "#FFD700",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
  },
  standard: {
    name: "Standard",
    price: 7500,
    currency: "RUB",
    color: "#3B82F6",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
  },
};

export const USER_ROLES = {
  ADMIN: "admin",
  VENDOR: "vendeur",
  CONTROLLER: "controleur",
};

export const CONCERT_INFO = {
  name: "Concert Didi B",
  artist: "Didi B",
  venue: "Espace Pravda, Варшавское шоссе 26 стр 12",
  location: "Moscou, Russie",
  date: "2025-12-05",
  time: "22:00",
};

export const STATUS_COLORS = {
  used: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Utilisé",
  },
  sent: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Envoyé",
  },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    label: "En attente",
  },
};
