const STORAGE_KEY = "final-countdown-pro-v1";

const list = document.getElementById("countdownList");
const emptyState = document.getElementById("emptyState");
const dialog = document.getElementById("countdownDialog");
const form = document.getElementById("countdownForm");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const dialogTitle = document.getElementById("dialogTitle");

const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const categoryInput = document.getElementById("categoryInput");

let countdowns = loadCountdowns();
let editingId = null;

function loadCountdowns(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) return JSON.parse(saved);

  return [
    {
      id: crypto.randomUUID(),
      title: "vakantie",
      category: "vakantie",
      target: "2026-05-13T16:00:00"
    },
    {
      id: crypto.randomUUID(),
      title: "vakantie",
      category: "vakantie",
      target: "2026-09-11T16:00:00"
    }
  ];
}

function saveCountdowns(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
}

function pad(number){
  return String(Math.max(0, number)).padStart(2, "0");
}

function formatDateTime(target){
  const date = new Date(target);
  return new Intl.DateTimeFormat("nl-NL", {
    day:"numeric",
    month:"short",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
  }).format(date).replace(".", "");
}

function calculate(target){
  const end = new Date(target).getTime();
  const now = Date.now();
  let diff = Math.max(0, end - now);

  const days = Math.floor(diff / 86400000);
  diff %= 86400000;
  const hours = Math.floor(diff / 3600000);
  diff %= 3600000;
  const minutes = Math.floor(diff / 60000);
  diff %= 60000;
  const seconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds, finished: end <= now };
}

function render(){
  list.innerHTML = "";
  emptyState.style.display = countdowns.length ? "none" : "block";

  countdowns
    .sort((a,b) => new Date(a.target) - new Date(b.target))
    .forEach(item => {
      const time = calculate(item.target);
      const card = document.createElement("article");
      card.className = `card ${time.finished ? "finished" : ""}`;

      card.innerHTML = `
        <section class="display">
          <div class="card-head">
            <div class="card-title">${escapeHtml(item.title)}</div>
            <div class="card-icons">⏰↩⌃</div>
          </div>

          <div class="timer">
            ${timerUnit("DAGEN", time.days)}
            ${timerUnit("UUR", time.hours)}
            ${timerUnit("MIN", time.minutes)}
            ${timerUnit("SEC", time.seconds)}
          </div>
        </section>

        <footer class="card-foot">
          <span>${formatDateTime(item.target)}</span>
          <div class="actions">
            <button class="action-btn" title="Bewerken" data-edit="${item.id}">✎</button>
            <button class="action-btn" title="Verwijderen" data-delete="${item.id}">🗑</button>
          </div>
        </footer>
      `;

      list.appendChild(card);
    });
}

function timerUnit(label, value){
  const shown = label === "DAGEN" ? String(value).padStart(3, "0") : pad(value);
  return `
    <div class="unit">
      <div class="label">${label}</div>
      <div class="digits">${shown}</div>
    </div>
  `;
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[char]));
}

function openDialog(item = null){
  editingId = item?.id ?? null;
  dialogTitle.textContent = item ? "Countdown bewerken" : "Nieuwe countdown";

  titleInput.value = item?.title ?? "";
  categoryInput.value = item?.category ?? "vakantie";

  if(item){
    const date = new Date(item.target);
    dateInput.value = date.toISOString().slice(0,10);
    timeInput.value = date.toTimeString().slice(0,5);
  } else {
    const tomorrow = new Date(Date.now() + 86400000);
    dateInput.value = tomorrow.toISOString().slice(0,10);
    timeInput.value = "16:00";
  }

  dialog.showModal();
  titleInput.focus();
}

addBtn.addEventListener("click", () => openDialog());
cancelBtn.addEventListener("click", () => dialog.close());

form.addEventListener("submit", event => {
  event.preventDefault();

  const target = `${dateInput.value}T${timeInput.value}:00`;
  const data = {
    id: editingId ?? crypto.randomUUID(),
    title: titleInput.value.trim(),
    category: categoryInput.value,
    target
  };

  if(editingId){
    countdowns = countdowns.map(item => item.id === editingId ? data : item);
  } else {
    countdowns.push(data);
  }

  saveCountdowns();
  dialog.close();
  render();
});

list.addEventListener("click", event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if(editId){
    const item = countdowns.find(c => c.id === editId);
    openDialog(item);
  }

  if(deleteId){
    const item = countdowns.find(c => c.id === deleteId);
    if(confirm(`Countdown "${item.title}" verwijderen?`)){
      countdowns = countdowns.filter(c => c.id !== deleteId);
      saveCountdowns();
      render();
    }
  }
});

document.getElementById("menuBtn").addEventListener("click", () => {
  alert("Final Countdown PRO\n\nGebruik de plus om een countdown toe te voegen. Alles wordt automatisch opgeslagen op dit apparaat.");
});

setInterval(render, 1000);
render();

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
