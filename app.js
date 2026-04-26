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


// Detail screen like Final Countdown app
const detailDialog = document.getElementById("detailDialog");
const detailContent = document.getElementById("detailContent");
const detailHeaderTitle = document.getElementById("detailHeaderTitle");
const backDetailBtn = document.getElementById("backDetailBtn");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailShareBtn = document.getElementById("detailShareBtn");
const detailPeopleBtn = document.getElementById("detailPeopleBtn");
const detailFab = document.getElementById("detailFab");

let activeDetailId = null;

function decimalComma(value, decimals = 1){
  return value.toFixed(decimals).replace(".", ",");
}

function workdaysBetween(startDate, endDate){
  let count = 0;
  const d = new Date(startDate);
  d.setHours(0,0,0,0);
  const end = new Date(endDate);
  end.setHours(0,0,0,0);

  while(d < end){
    const day = d.getDay();
    if(day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function detailStats(target){
  const now = new Date();
  const end = new Date(target);
  const diff = Math.max(0, end - now);

  const daysExact = diff / 86400000;
  const years = daysExact / 365.2425;
  const months = daysExact / 30.436875;
  const weeks = daysExact / 7;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor(diff / 1000);

  return {
    years: decimalComma(years),
    months: decimalComma(months),
    weeks: decimalComma(weeks),
    days: decimalComma(daysExact),
    workdays: decimalComma(workdaysBetween(now, end)),
    hours,
    minutes,
    seconds,
    milliseconds: diff
  };
}

function openDetail(id){
  activeDetailId = id;
  renderDetail();
  detailDialog.showModal();
}

function renderDetail(){
  if(!activeDetailId || !detailDialog.open) return;

  const item = countdowns.find(c => c.id === activeDetailId);
  if(!item){
    detailDialog.close();
    return;
  }

  const time = calculate(item.target);
  const stats = detailStats(item.target);
  detailHeaderTitle.textContent = "Final Countd...";
  detailContent.innerHTML = `
    <article class="detail-count-card ${time.finished ? "finished" : ""}">
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
    </article>

    <div class="detail-date">${formatDateTime(item.target)}</div>

    <section class="stats">
      <div class="stat-row"><span class="stat-label">JAREN</span><span class="stat-value">${stats.years}</span></div>
      <div class="stat-row"><span class="stat-label">MAANDEN</span><span class="stat-value">${stats.months}</span></div>
      <div class="stat-row"><span class="stat-label">WEKEN</span><span class="stat-value">${stats.weeks}</span></div>
      <div class="stat-row"><span class="stat-label">DAGEN</span><span class="stat-value">${stats.days}</span></div>
      <div class="stat-row"><span class="stat-label workdays">Werkdagen</span><span class="stat-value">${stats.workdays}</span></div>
      <div class="stat-row"><span class="stat-label">UREN</span><span class="stat-value">${stats.hours}</span></div>
      <div class="stat-row stat-strip"><span class="stat-label">MINUTEN</span><span class="stat-value">${stats.minutes}</span></div>
      <div class="stat-row stat-strip"><span class="stat-label">SECONDEN</span><span class="stat-value">${stats.seconds}</span></div>
      <div class="stat-row stat-strip"><span class="stat-label">MILLISECONDS</span><span class="stat-value">${stats.milliseconds}</span></div>
    </section>
  `;
}

// Open detail when clicking card, but not action buttons
list.addEventListener("click", event => {
  if(event.target.closest(".action-btn")) return;
  const card = event.target.closest(".card");
  if(!card) return;
  const index = [...list.children].indexOf(card);
  const sorted = [...countdowns].sort((a,b) => new Date(a.target) - new Date(b.target));
  if(sorted[index]) openDetail(sorted[index].id);
});

backDetailBtn.addEventListener("click", () => detailDialog.close());

detailEditBtn.addEventListener("click", () => {
  const item = countdowns.find(c => c.id === activeDetailId);
  detailDialog.close();
  if(item) openDialog(item);
});

detailShareBtn.addEventListener("click", async () => {
  const item = countdowns.find(c => c.id === activeDetailId);
  if(!item) return;
  const text = `${item.title} - countdown tot ${formatDateTime(item.target)}`;
  if(navigator.share){
    await navigator.share({title:"Final Countdown", text}).catch(() => {});
  } else {
    await navigator.clipboard.writeText(text).catch(() => {});
    alert("Countdown tekst gekopieerd.");
  }
});

detailPeopleBtn.addEventListener("click", () => alert("Personen delen kan later gekoppeld worden aan WhatsApp of e-mail."));
detailFab.addEventListener("click", () => alert("Personen delen kan later gekoppeld worden aan WhatsApp of e-mail."));

setInterval(renderDetail, 100);
