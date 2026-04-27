if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}

let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (!isStandalone()) installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) {
    alert("Installeren is nu niet beschikbaar. Open Chrome-menu ⋮ en kies 'App installeren' of 'Toevoegen aan startscherm'.");
    return;
  }

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    installBtn.hidden = true;
  }

  deferredPrompt = null;
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
  deferredPrompt = null;
});

const backgroundSuggestions = {
  "tunisie": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "tunesie": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "tunesië": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "frankrijk": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
  "spanje": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "italie": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80",
  "italië": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80",
  "turkije": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80",
  "griekenland": "https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=1400&q=80"
};

const defaultImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80";

const defaultTrips = [
  {
    id: crypto.randomUUID(),
    country: "Tunesië",
    destination: "Sousse",
    date: "2026-05-20T10:00",
    hotel: "Royal Salem",
    image: defaultImage,
    info: "Sousse is een levendige kustplaats in Tunesië met stranden, een historische medina, gezellige boulevards en veel plekken om rustig te genieten.",
    hotelInfo: "Royal Salem ligt ideaal voor een relaxte vakantie. Check vooraf de ligging, faciliteiten, ontbijt/diner tijden en afstand tot strand of centrum.",
    tips: "Bezoek de medina, maak een strandwandeling, probeer lokale gerechten en plan ook één rustige dag zonder verplichtingen."
  }
];

let trips = JSON.parse(localStorage.getItem("reisTripsV11Structured")) || defaultTrips;
let activeTripId = localStorage.getItem("reisActiveTripV11Structured") || trips[0].id;
let editingTripId = null;
let alreadyCelebrated = new Set(JSON.parse(localStorage.getItem("reisCelebratedV11Structured") || "[]"));

const $ = (id) => document.getElementById(id);

const elements = {
  destinationTitle: $("destinationTitle"),
  countryTitle: $("countryTitle"),
  hotelTitle: $("hotelTitle"),
  tripInfo: $("tripInfo"),
  hotelInfo: $("hotelInfo"),
  tipsText: $("tipsText"),
  tripsStrip: $("tripsStrip"),
  mapsBtn: $("mapsBtn"),
  countdownCard: $("countdownCard"),
  travelMood: $("travelMood"),
  tripLabel: $("tripLabel"),
  days: $("days"),
  hours: $("hours"),
  minutes: $("minutes"),
  seconds: $("seconds"),
  dialog: $("tripDialog"),
  form: $("tripForm"),
  dialogTitle: $("dialogTitle"),
  deleteBtn: $("deleteBtn")
};

function normalizeText(value) {
  return (value || "").toLowerCase().trim();
}

function createAutoInfo(country, destination, hotel) {
  const safeCountry = country || "het land";
  const safeDestination = destination || "de plaats";
  const safeHotel = hotel || "je hotel";

  const lowerCountry = normalizeText(country);
  const lowerDestination = normalizeText(destination);

  let vibe = "een fijne plek om de omgeving te ontdekken, rustig te genieten en alvast in vakantiestemming te komen";
  let food = "probeer lokale restaurants, wandel door het centrum en zoek een mooi terras";
  let culture = "bekijk vooraf welke bezienswaardigheden, markten of wandelgebieden in de buurt liggen";

  if (lowerCountry.includes("tunes") || lowerCountry.includes("tunisi") || lowerCountry.includes("tunisie")) {
    vibe = "zon, strand, gastvrijheid, medina’s, boulevards en een warme Noord-Afrikaanse sfeer";
    food = "probeer couscous, brik, verse vis, muntthee en lokale zoetigheden";
    culture = "bezoek de medina, bekijk lokale markten en plan eventueel een uitstap naar El Djem, Monastir of Port El Kantaoui";
  }

  if (lowerDestination.includes("sousse")) {
    vibe = "een mix van strand, medina, boulevard, winkels, cafés en levendige vakantieplekken";
    culture = "bezoek de medina van Sousse, wandel langs de boulevard en kijk of Port El Kantaoui leuk is voor een avondje uit";
  }

  if (lowerCountry.includes("frankrijk") || lowerCountry.includes("france")) {
    vibe = "cultuur, lekker eten, mooie straten, cafés en veel plekken om rustig rond te wandelen";
    food = "probeer lokale bistro’s, bakkerijen, kaas, wijnvrije alternatieven en patisserie";
    culture = "plan per dag één wijk of bezienswaardigheid zodat je niet te veel hoeft te haasten";
  }

  if (lowerCountry.includes("spanje") || lowerCountry.includes("spain")) {
    vibe = "zon, tapas, pleinen, stranden en ontspannen avonden buiten";
    food = "probeer tapas, paella, lokale visgerechten en ontbijt rustig op een terras";
    culture = "check oude stadsdelen, markthallen en uitzichtpunten in de buurt";
  }

  if (lowerCountry.includes("ital")) {
    vibe = "mooie straatjes, goed eten, cultuur, pleinen en een warme vakantiesfeer";
    food = "probeer pasta, pizza, gelato, lokale koffie en restaurants buiten de drukste toeristenstraten";
    culture = "boek populaire bezienswaardigheden vooraf en plan tijd om gewoon rond te lopen";
  }

  return {
    info: `${safeDestination} in ${safeCountry} is ${vibe}. Deze bestemming is ideaal om af te tellen naar een reis met ruimte voor ontspanning, eten, cultuur en mooie momenten.`,
    hotelInfo: `${safeHotel} is jouw vaste uitvalsbasis in ${safeDestination}. Handig om vooraf te checken: exacte ligging via Maps, afstand tot strand of centrum, inchecktijd, ontbijt/diner tijden, zwembad, wifi en vervoer vanaf de luchthaven.`,
    tips: `${culture}. ${food}. Sla je hotel op in Google Maps, maak een kleine paklijst en deel je countdown via WhatsApp met degene met wie je op reis gaat.`
  };
}

function suggestedImage(country) {
  return backgroundSuggestions[normalizeText(country)] || defaultImage;
}

function saveTrips() {
  localStorage.setItem("reisTripsV11Structured", JSON.stringify(trips));
  localStorage.setItem("reisActiveTripV11Structured", activeTripId);
  localStorage.setItem("reisCelebratedV11Structured", JSON.stringify([...alreadyCelebrated]));
}

function getActiveTrip() {
  return trips.find(trip => trip.id === activeTripId) || trips[0];
}

function updateBackground(trip) {
  document.body.style.setProperty("--trip-bg", `url("${trip.image || suggestedImage(trip.country)}")`);
}

function renderTrip() {
  const trip = getActiveTrip();
  if (!trip) return;

  const auto = createAutoInfo(trip.country, trip.destination, trip.hotel);

  elements.destinationTitle.textContent = trip.destination;
  elements.countryTitle.textContent = trip.country || "";
  elements.hotelTitle.textContent = `Hotel: ${trip.hotel || "Nog niet ingevuld"}`;
  elements.tripInfo.textContent = trip.info || auto.info;
  elements.hotelInfo.textContent = trip.hotelInfo || auto.hotelInfo;
  elements.tipsText.textContent = trip.tips || auto.tips;

  const mapQuery = `${trip.hotel || ""} ${trip.destination || ""} ${trip.country || ""}`.trim();
  elements.mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  updateBackground(trip);
  renderTripsStrip();
  updateCountdown();
}

function renderTripsStrip() {
  elements.tripsStrip.innerHTML = "";

  trips.forEach(trip => {
    const chip = document.createElement("button");
    chip.className = `trip-chip ${trip.id === activeTripId ? "active" : ""}`;
    chip.innerHTML = `<strong>${trip.destination}</strong><small>${trip.country || ""} • ${new Date(trip.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</small>`;
    chip.addEventListener("click", () => {
      activeTripId = trip.id;
      saveTrips();
      renderTrip();
    });
    elements.tripsStrip.appendChild(chip);
  });
}

function updateCountdown() {
  const trip = getActiveTrip();
  if (!trip) return;

  const target = new Date(trip.date).getTime();
  const now = Date.now();
  const diff = target - now;

  document.querySelectorAll(".time-box").forEach(box => {
    box.classList.add("tick");
    setTimeout(() => box.classList.remove("tick"), 180);
  });

  if (diff <= 0) {
    elements.days.textContent = "0";
    elements.hours.textContent = "0";
    elements.minutes.textContent = "0";
    elements.seconds.textContent = "0";
    elements.travelMood.textContent = "🎉 Het is zover! Fijne vakantie!";
    elements.tripLabel.textContent = "🎉 Vakantie gestart";
    elements.countdownCard.classList.add("urgent");

    if (!alreadyCelebrated.has(trip.id)) {
      launchConfetti();
      alreadyCelebrated.add(trip.id);
      saveTrips();
    }
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  elements.days.textContent = days;
  elements.hours.textContent = hours;
  elements.minutes.textContent = minutes;
  elements.seconds.textContent = seconds;

  elements.countdownCard.classList.toggle("urgent", days <= 7);

  if (days <= 1) {
    elements.tripLabel.textContent = "🔥 Bijna vakantie";
    elements.travelMood.textContent = "Nog heel even… morgen begint het avontuur!";
  } else if (days <= 3) {
    elements.tripLabel.textContent = "✨ Laatste voorbereidingen";
    elements.travelMood.textContent = "Het komt nu echt dichtbij. Tijd om je koffer klaar te zetten.";
  } else if (days <= 7) {
    elements.tripLabel.textContent = "🌟 Nog minder dan een week";
    elements.travelMood.textContent = "De vakantiekriebels mogen officieel beginnen.";
  } else {
    elements.tripLabel.textContent = "🌍 Volgende reis";
    elements.travelMood.textContent = "Nog even geduld… de vakantie komt eraan.";
  }
}

function launchConfetti() {
  const colors = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185"];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.2 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function openDialog(mode = "add") {
  const trip = mode === "edit" ? getActiveTrip() : null;
  editingTripId = trip ? trip.id : null;

  elements.dialogTitle.textContent = trip ? "Reis bewerken" : "Nieuwe reis";
  elements.deleteBtn.style.display = trip ? "block" : "none";

  $("inputCountry").value = trip?.country || "";
  $("inputDestination").value = trip?.destination || "";
  $("inputHotel").value = trip?.hotel || "";
  $("inputDate").value = trip ? trip.date.slice(0, 16) : "";
  $("inputImage").value = trip?.image || "";
  $("inputInfo").value = trip?.info || "";
  $("inputHotelInfo").value = trip?.hotelInfo || "";
  $("inputTips").value = trip?.tips || "";

  elements.dialog.showModal();
}

$("generateInfoBtn").addEventListener("click", () => {
  const country = $("inputCountry").value.trim();
  const destination = $("inputDestination").value.trim();
  const hotel = $("inputHotel").value.trim();

  if (!country || !destination) {
    alert("Vul minimaal land en plaats in.");
    return;
  }

  const auto = createAutoInfo(country, destination, hotel);
  $("inputInfo").value = auto.info;
  $("inputHotelInfo").value = auto.hotelInfo;
  $("inputTips").value = auto.tips;

  if (!$("inputImage").value.trim()) {
    $("inputImage").value = suggestedImage(country);
  }
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const country = $("inputCountry").value.trim();
  const destination = $("inputDestination").value.trim();
  const hotel = $("inputHotel").value.trim();
  const auto = createAutoInfo(country, destination, hotel);

  const payload = {
    id: editingTripId || crypto.randomUUID(),
    country,
    destination,
    hotel,
    date: $("inputDate").value,
    image: $("inputImage").value.trim() || suggestedImage(country),
    info: $("inputInfo").value.trim() || auto.info,
    hotelInfo: $("inputHotelInfo").value.trim() || auto.hotelInfo,
    tips: $("inputTips").value.trim() || auto.tips
  };

  if (editingTripId) {
    trips = trips.map(trip => trip.id === editingTripId ? payload : trip);
  } else {
    trips.push(payload);
    activeTripId = payload.id;
  }

  saveTrips();
  elements.dialog.close();
  renderTrip();
});

elements.deleteBtn.addEventListener("click", () => {
  if (!editingTripId || trips.length <= 1) {
    alert("Je moet minimaal één reis bewaren.");
    return;
  }

  trips = trips.filter(trip => trip.id !== editingTripId);
  activeTripId = trips[0].id;
  saveTrips();
  elements.dialog.close();
  renderTrip();
});

$("addBtn").addEventListener("click", () => openDialog("add"));
$("editBtn").addEventListener("click", () => openDialog("edit"));

$("shareBtn").addEventListener("click", () => {
  const trip = getActiveTrip();
  const target = new Date(trip.date).toLocaleString("nl-NL", { dateStyle: "full", timeStyle: "short" });
  const message = `✈️ Reis countdown\n\nLand: ${trip.country || ""}\nPlaats: ${trip.destination}\nHotel: ${trip.hotel || "Nog niet ingevuld"}\nVertrek: ${target}\n\nIk ben aan het aftellen! 🌍`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
});

$("calendarBtn").addEventListener("click", () => {
  const trip = getActiveTrip();
  const start = new Date(trip.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const format = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", `Vakantie naar ${trip.destination}`);
  url.searchParams.set("dates", `${format(start)}/${format(end)}`);
  url.searchParams.set("details", `${trip.info || "Reis"}\nHotel: ${trip.hotel || "Nog niet ingevuld"}`);
  url.searchParams.set("location", `${trip.hotel || ""} ${trip.destination || ""} ${trip.country || ""}`);

  window.open(url.toString(), "_blank");
});

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.body.classList.remove("theme-sunset", "theme-tropical", "theme-minimal");
    const theme = btn.dataset.theme;
    if (theme !== "dark") document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("reisThemeV11Structured", theme);
  });
});

function restoreTheme() {
  const theme = localStorage.getItem("reisThemeV11Structured") || "dark";
  const btn = document.querySelector(`[data-theme="${theme}"]`);
  btn?.click();
}

restoreTheme();
renderTrip();
setInterval(updateCountdown, 1000);
