import React, { useState, useEffect, useRef } from "react";
import {
  Ticket,
  Music,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Zap,
} from "lucide-react";
import emailjs from "@emailjs/browser";

export default function DidiConcertBooking() {
  const [formData, setFormData] = useState({
    ticketType: "standard",
    quantity: 1,
    fullName: "",
    contact: "+7 ",
    email: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentImage, setCurrentImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [timeLeft, setTimeLeft] = useState({});
  const [isPromoActive, setIsPromoActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  // Dates pour la promotion
  const promoStartDate = new Date();
  const promoEndDate = new Date();
  promoEndDate.setDate(promoEndDate.getDate() + 7);
  const normalPrice = 5000;
  const promoPrice = 3500;

  // Référence pour l'audio
  const audioElementRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const backgroundImages = [
    'url("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    'url("https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
  ];

  // URLs des musiques de Didi B
  const didiBSongs = [
    "assets/audio/didi_dx3.mp3",
    "assets/audio/didi_game_djai.mp3",
  ];

  const EMAILJS_CONFIG = {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  };

  // Compteur à rebours pour la promotion
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = promoEndDate - now;

      if (difference > 0) {
        setIsPromoActive(true);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        setIsPromoActive(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Gestion de l'audio
  useEffect(() => {
    const audio = new Audio(didiBSongs[0]);
    audio.loop = true;
    audio.volume = volume;
    audio.currentTime = 13;
    audioElementRef.current = audio;

    const handleFirstInteraction = () => {
      if (isPlaying && audio.paused) {
        audio.play().catch(console.error);
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      audio.pause();
      audioElementRef.current = null;
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioElementRef.current) return;

    try {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        await audioElementRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Erreur de lecture audio:", error);
    }
  };

  // Fonction pour formater le numéro de téléphone russe avec +7 automatique
  const formatPhoneNumber = (value) => {
    if (value.length < 3) return "+7 ";

    const digits = value.replace(/\D/g, "");

    let clean = digits.startsWith("7")
      ? digits
      : "7" + digits.replace(/^7?/, "");
    clean = clean.slice(0, 11);

    const part1 = clean.slice(1, 4);
    const part2 = clean.slice(4, 7);
    const part3 = clean.slice(7, 9);
    const part4 = clean.slice(9, 11);

    let formatted = "+7";

    if (part1) formatted += ` (${part1}`;
    if (part1 && part1.length === 3) formatted += `)`;
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += `-${part3}`;
    if (part4) formatted += `-${part4}`;

    return formatted;
  };

  const validatePhoneNumber = (phone) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 11 && numbers.startsWith("7");
  };

  const ticketTypes = {
    standard: {
      price: isPromoActive ? promoPrice : normalPrice,
      originalPrice: normalPrice,
      name: "Grand Public",
      color: "from-blue-500 to-blue-700",
      icon: <Ticket className="w-6 h-6" />,
      subtitle: "Votre passeport pour une soirée inoubliable !",
      features: [
        "Accès à la salle",
        "Ambiance générale",
        "Accès aux zones de restauration et bars",
        "Souvenirs garantis et émotions partagées",
      ],
      description:
        "Parfait pour : Les fans qui veulent vivre le concert au plus près de l'énergie du public !",
    },
    vip: {
      price: 10000,
      name: "VIP",
      color: "from-amber-500 to-amber-700",
      icon: <Crown className="w-6 h-6" />,
      subtitle: "L'expérience ultime pour les vrais passionnés",
      features: [
        "Accès prioritaire",
        "Placement VIP privilégié",
        "Rencontre avec les artistes - Session photo et dédicaces (sous réserve de la disponibilité de l'artiste)",
        "Merchandise exclusif",
        "Espace VIP privatif",
        "Service hôtelier dédié tout au long de l'événement",
      ],
      description:
        "L'excellence pour : Ceux qui veulent transformer un concert en moment exceptionnel !",
    },
  };

  const calculateTotal = () => {
    return ticketTypes[formData.ticketType].price * formData.quantity;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Le nom complet est requis";

    if (!formData.contact.trim() || formData.contact === "+7 ") {
      newErrors.contact = "Le numéro de téléphone est requis";
    } else if (!validatePhoneNumber(formData.contact)) {
      newErrors.contact =
        "Numéro de téléphone russe invalide (ex: +7 (999) 123-45-67)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (formData.quantity < 1) newErrors.quantity = "Au moins 1 billet requis";
    if (formData.quantity > 8)
      newErrors.quantity = "Maximum 8 billets par réservation";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour démarrer l'animation de progression
  const startProgressAnimation = () => {
    setSubmitProgress(0);
    let progress = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        progress = 90;
        clearInterval(progressIntervalRef.current);
      }
      setSubmitProgress(progress);
    }, 200);
  };

  // Fonction pour terminer l'animation de progression
  const completeProgressAnimation = () => {
    clearInterval(progressIntervalRef.current);
    setSubmitProgress(100);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    startProgressAnimation();

    // Préparation des données pour EmailJS
    const emailData = {
      to_email: import.meta.env.VITE_ORGANIZER_EMAIL,
      from_name: formData.fullName,
      from_email: formData.email,
      contact_phone: formData.contact,
      ticket_type: ticketTypes[formData.ticketType].name,
      quantity: formData.quantity,
      total_amount: calculateTotal().toLocaleString() + " ₽",
      booking_date: new Date().toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      // Envoi de l'email via EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        emailData,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("✅ Email envoyé avec succès:", result.text);
      completeProgressAnimation();

      // Petit délai pour que l'animation se termine
      setTimeout(() => {
        setShowConfirmation(true);
      }, 300);

      // Reset du formulaire après 8 secondes
      setTimeout(() => {
        setShowConfirmation(false);
        setFormData({
          ticketType: "standard",
          quantity: 1,
          fullName: "",
          contact: "+7 ",
          email: "",
        });
      }, 8000);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi:", error);
      completeProgressAnimation();

      setTimeout(() => {
        alert(
          "Une erreur est survenue lors de l'envoi de votre réservation. Veuillez réessayer ou contacter directement l'organisateur."
        );
      }, 500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "contact") {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === "Backspace" && formData.contact.length <= 3) {
      e.preventDefault();
    }
  };

  // Composant pour l'indicateur de progression circulaire
  const CircularProgress = ({ progress, size = 24, strokeWidth = 3 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-white/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-white transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-xs font-bold text-white">
          {Math.round(progress)}%
        </div>
      </div>
    );
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: image }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70 backdrop-blur-[1px]" />
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-[fadeIn_0.5s_ease-in] relative z-10 border-4 border-amber-400">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              RÉSERVATION CONFIRMÉE
            </div>
          </div>

          <div className="mb-6">
            <div className="relative inline-block">
              <CheckCircle className="w-20 h-20 text-green-500 animate-[bounce_1s_ease-in-out]" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Félicitations !
          </h2>
          <p className="text-gray-600 mb-6">
            Merci{" "}
            <span className="font-semibold text-purple-600">
              {formData.fullName}
            </span>{" "}
            !
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Billets:</span>
              <span className="text-purple-600 font-bold">
                {formData.quantity} x {ticketTypes[formData.ticketType].name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total:</span>
              <span className="text-2xl font-bold text-purple-600">
                {calculateTotal().toLocaleString()} &#8381;
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              📧 Un email de confirmation a été envoyé à{" "}
              <strong>{formData.email}</strong>
            </p>
          </div>

          <p className="text-sm text-gray-600">
            L'organisateur vous contactera dans les 24h au{" "}
            <strong>{formData.contact}</strong> pour finaliser votre
            réservation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Contrôle audio */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
        <button
          onClick={toggleAudio}
          className="text-white hover:text-amber-400 transition-colors"
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-amber-400"
          />
          <span className="text-white text-xs w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-white text-sm">
          <Music className="w-4 h-4 text-amber-400" />
          <span>Didi B</span>
        </div>
      </div>

      {/* Indicateur de lecture */}
      {isPlaying && (
        <div className="fixed top-20 right-6 z-50 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full animate-pulse">
          🔥 En écoute
        </div>
      )}

      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: image }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70 backdrop-blur-[1px]" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-10 left-10 animate-float">
        <div className="bg-amber-400/30 backdrop-blur-sm rounded-full p-4 border border-amber-400/50">
          <Music className="w-8 h-8 text-amber-300" />
        </div>
      </div>

      <div className="absolute bottom-20 right-10 animate-float delay-1000">
        <div className="bg-pink-400/30 backdrop-blur-sm rounded-full p-4 border border-pink-400/50">
          <Sparkles className="w-8 h-8 text-pink-300" />
        </div>
      </div>

      <div className="absolute top-1/2 left-1/4 animate-float delay-500">
        <div className="bg-blue-400/30 backdrop-blur-sm rounded-full p-3 border border-blue-400/50">
          <Crown className="w-6 h-6 text-blue-300" />
        </div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-[fadeIn_0.8s_ease-in]">
            <div className="inline-block mb-6 relative">
              <div className="bg-gradient-to-r from-amber-400 to-pink-500 p-1 rounded-full animate-pulse">
                <div className="bg-slate-900 rounded-full p-4">
                  <Music className="w-16 h-16 text-amber-400" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                SOLD OUT RISK
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 mb-4 animate-[slideDown_0.8s_ease-out]">
              DIDI B MOSCOW 2025
            </h1>

            {/* Section Russia - Africa */}
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                RUSSIA - AFRICA 2e Édition
              </h2>

              {/* Section Organisateurs */}
              <div className="flex flex-col items-center justify-center gap-6 mt-8">
                <h3 className="text-xl font-semibold text-white/80">
                  Organisé par
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  {/* Logo XXX Louange Bar */}
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-xl p-3 shadow-lg">
                      <img
                        src="assets/images/xxx-louange.jpeg"
                        alt="XXX Louange Bar"
                        className="h-12 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden items-center justify-center h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-bold text-xs text-center">
                        XXX
                      </div>
                    </div>
                    <span className="text-white text-lg font-semibold">
                      XXX Louange Bar
                    </span>
                  </div>

                  <div className="text-white text-2xl font-light">&</div>

                  {/* Logo Kora Event */}
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-xl p-3 shadow-lg">
                      <img
                        src="assets/images/kora-event.jpeg"
                        alt="Kora Event"
                        className="h-12 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden items-center justify-center h-12 w-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg text-white font-bold text-xs text-center">
                        KORA
                      </div>
                    </div>
                    <span className="text-white text-lg font-semibold">
                      Kora Event
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compteur à rebours principal */}
            {isPromoActive && (
              <div className="mb-6 animate-[fadeIn_0.8s_ease-in]">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-2xl shadow-2xl border-2 border-yellow-400 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
                    <span className="text-xl font-bold">
                      PROMOTION SPÉCIALE !
                    </span>
                    <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </div>
                  <p className="text-lg mb-3">
                    <strong>3 500 ₽</strong> au lieu de <s>5 000 ₽</s> -
                    Première semaine seulement !
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm mb-2">
                    <Clock className="w-4 h-4 text-yellow-300" />
                    <span>Offre se termine dans :</span>
                  </div>
                  <div className="flex justify-center gap-4 text-2xl font-mono font-bold">
                    <div className="text-center">
                      <div className="bg-black/30 rounded-lg px-3 py-2 min-w-[60px]">
                        {String(timeLeft.days).padStart(2, "0")}
                      </div>
                      <div className="text-xs mt-1 text-yellow-200">JOURS</div>
                    </div>
                    <div className="text-yellow-300">:</div>
                    <div className="text-center">
                      <div className="bg-black/30 rounded-lg px-3 py-2 min-w-[60px]">
                        {String(timeLeft.hours).padStart(2, "0")}
                      </div>
                      <div className="text-xs mt-1 text-yellow-200">HEURES</div>
                    </div>
                    <div className="text-yellow-300">:</div>
                    <div className="text-center">
                      <div className="bg-black/30 rounded-lg px-3 py-2 min-w-[60px]">
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </div>
                      <div className="text-xs mt-1 text-yellow-200">MIN</div>
                    </div>
                    <div className="text-yellow-300">:</div>
                    <div className="text-center">
                      <div className="bg-black/30 rounded-lg px-3 py-2 min-w-[60px]">
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </div>
                      <div className="text-xs mt-1 text-yellow-200">SEC</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 text-white text-lg mb-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <MapPin className="w-5 h-5 text-pink-300" />
                <span>Espace Pravda, Варшавское шоссе 26 стр 12</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Calendar className="w-5 h-5 text-amber-300" />
                <span>5 Décembre 2025 • 20:00</span>
              </div>
            </div>

            <p className="text-xl text-white font-light max-w-2xl mx-auto text-shadow">
              L'icône du rap africain en concert exclusif à Moscou ! Une soirée
              inoubliable avec le roi du rap ivoire.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ticket Selection */}
            <div className="space-y-6 animate-[slideLeft_0.8s_ease-out]">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Ticket className="w-8 h-8 text-pink-300" />
                  Types de Billets
                </h2>
                <div className="bg-red-500/30 border border-red-500/50 text-red-100 px-3 py-1 rounded-full text-sm">
                  Places limitées
                </div>
              </div>

              {Object.entries(ticketTypes).map(([key, ticket]) => (
                <div
                  key={key}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, ticketType: key }))
                  }
                  className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 group ${
                    formData.ticketType === key
                      ? "ring-4 ring-pink-500 scale-105"
                      : "ring-2 ring-white/20 hover:ring-white/40"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-r ${ticket.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Badge PROMO pour le ticket standard */}
                    {key === "standard" && isPromoActive && (
                      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse z-10">
                        ⚡ PROMO
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {ticket.icon}
                        <div>
                          <h3 className="text-2xl font-bold">{ticket.name}</h3>
                          <p className="text-sm text-white/80 mt-1">
                            {ticket.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {key === "standard" && isPromoActive ? (
                          <>
                            <div className="text-3xl font-extrabold text-yellow-300">
                              {ticket.price.toLocaleString()} &#8381;
                            </div>
                            <div className="text-sm opacity-90 line-through text-red-200">
                              {ticket.originalPrice.toLocaleString()} &#8381;
                            </div>
                            <div className="text-xs text-green-300 font-bold mt-1">
                              Économisez 1 500 ₽ !
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-extrabold">
                              {ticket.price.toLocaleString()} &#8381;
                            </div>
                            <div className="text-sm opacity-90">par billet</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {ticket.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                          <span className="opacity-95">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Description du ticket */}
                    <div className="bg-white/10 rounded-xl p-3 mt-3">
                      <p className="text-sm text-white/90 italic">
                        {ticket.description}
                      </p>
                    </div>

                    {formData.ticketType === key && (
                      <div className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-2 animate-pulse">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}

                    {key === "standard" && (
                      <div className="absolute top-1 right-2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAIRE
                      </div>
                    )}
                  </div>

                  {/* Compteur à rebours pour le ticket standard */}
                  {key === "standard" && isPromoActive && (
                    <div className="mt-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-3 border border-red-400/30">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-red-200">
                          <Clock className="w-4 h-4" />
                          <span>Fin de la promotion:</span>
                        </div>
                        <div className="font-mono text-red-200 font-bold">
                          {String(timeLeft.days).padStart(2, "0")}j{" "}
                          {String(timeLeft.hours).padStart(2, "0")}h{" "}
                          {String(timeLeft.minutes).padStart(2, "0")}m
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Event Info Card */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Informations Importantes
                </h3>
                <ul className="space-y-2 text-sm opacity-95">
                  <li>• Ouverture des portes : 18:00</li>
                  <li>• Installation des invités : 18h - 19h30</li>
                  <li>
                    • Lieu : Moscou, Espace Pravda, Варшавское шоссе 26 стр 12
                  </li>
                  <li>• Début du concert : 20:00</li>
                  <li>• Pièce d'identité requise</li>
                  <li>• Réservation nominative</li>
                  {isPromoActive && (
                    <li className="text-yellow-300 font-semibold">
                      • ⚡ Promotion spéciale : 3 500 ₽ au lieu de 5 000 ₽ cette
                      semaine seulement !
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <div className="animate-[slideRight_0.8s_ease-out]">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-6 rounded-full text-sm">
                  RÉSERVER MAINTENANT
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center mt-4">
                  Votre Réservation
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Complétez vos informations pour réserver
                </p>

                {/* Bannière promotionnelle dans le formulaire */}
                {isPromoActive && formData.ticketType === "standard" && (
                  <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl text-center animate-pulse">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">PROMOTION ACTIVE !</span>
                    </div>
                    <p className="text-sm">
                      Vous économisez <strong>1 500 ₽</strong> par billet
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nombre de billets
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: Math.max(1, prev.quantity - 1),
                          }))
                        }
                        className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        max="8"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none text-lg font-semibold text-center"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: Math.min(8, prev.quantity + 1),
                          }))
                        }
                        className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ivan Petrov"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Téléphone russe
                      </label>
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        onKeyDown={handlePhoneKeyDown}
                        placeholder="+7 (999) 123-45-67"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none font-mono"
                      />
                      {errors.contact && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.contact}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Le +7 est automatique. Format: +7 (XXX) XXX-XX-XX
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Récapitulatif
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type de billet:</span>
                        <span className="text-purple-600 font-semibold">
                          {ticketTypes[formData.ticketType].name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantité:</span>
                        <span className="text-purple-600 font-semibold">
                          {formData.quantity} billet
                          {formData.quantity > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Prix unitaire:</span>
                        <span className="text-purple-600 font-semibold">
                          {formData.ticketType === "standard" &&
                          isPromoActive ? (
                            <>
                              <span className="text-green-600">
                                {ticketTypes.standard.price.toLocaleString()}{" "}
                                &#8381;
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {ticketTypes.standard.originalPrice.toLocaleString()}{" "}
                                &#8381;
                              </span>
                            </>
                          ) : (
                            <span>
                              {ticketTypes[
                                formData.ticketType
                              ].price.toLocaleString()}{" "}
                              &#8381;
                            </span>
                          )}
                        </span>
                      </div>
                      {formData.ticketType === "standard" && isPromoActive && (
                        <div className="flex justify-between items-center bg-green-50 rounded-lg p-2">
                          <span className="text-green-700 text-sm">
                            Économie totale:
                          </span>
                          <span className="text-green-700 font-bold text-sm">
                            +
                            {(
                              (ticketTypes.standard.originalPrice -
                                ticketTypes.standard.price) *
                              formData.quantity
                            ).toLocaleString()}{" "}
                            &#8381;
                          </span>
                        </div>
                      )}
                      <div className="border-t border-purple-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-800">
                            TOTAL:
                          </span>
                          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            {calculateTotal().toLocaleString()} &#8381;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button avec indicateur de progression */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl transform transition-all duration-300 shadow-lg hover:shadow-2xl text-lg relative overflow-hidden ${
                      isSubmitting
                        ? "opacity-90 cursor-not-allowed"
                        : "hover:from-pink-600 hover:to-purple-700 hover:scale-105"
                    }`}
                  >
                    {/* Fond d'animation de progression */}
                    {isSubmitting && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 ease-out"
                        style={{ width: `${submitProgress}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <CircularProgress
                            progress={submitProgress}
                            size={28}
                            strokeWidth={3}
                          />
                          <span className="font-semibold">
                            {submitProgress < 100
                              ? "Traitement en cours..."
                              : "Terminé !"}
                          </span>
                        </>
                      ) : (
                        <>
                          {isPromoActive &&
                          formData.ticketType === "standard" ? (
                            <div className="flex items-center justify-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-300" />
                              🎫 RÉSERVER AVANT LA FIN DE LA PROMO
                            </div>
                          ) : (
                            "🎫 RÉSERVER MAINTENANT"
                          )}
                        </>
                      )}
                    </div>
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    ⚡ Réservation sécurisée • Confirmation immédiate • Support
                    24/7
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center animate-[fadeIn_1s_ease-in]">
            {/* Section Événement */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                Ne manquez pas cet événement exceptionnel !
              </h3>
              <p className="text-gray-200 mb-6">
                Didi B, l'artiste le plus influent de la scène musicale
                ivoirienne, vous présente son premier concert exclusif à Moscou.
                Une soirée de Rap, Coupé-Décalé et d'afrobeats qui restera dans
                les mémoires.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  🎵 Hits : "Shogün"
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  🔥 Performance live épique
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  {isPromoActive
                    ? "💫 PROMO: 3 500 ₽ cette semaine!"
                    : "💫 Ambiance garantie"}
                </div>
              </div>
            </div>

            {/* Informations de contact et copyright */}
            <div className="mt-8 text-gray-300 text-sm">
              <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>+7 (968) 438-74-10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>didibrussia@mail.ru</span>
                </div>
              </div>
              <p className="mt-2">
                © 2025 Didi B Concert Moscow • Tous droits réservés
              </p>
              <p className="text-xs text-gray-400 mt-2">
                En partenariat avec XXX Louange Bar & Kora Event
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
