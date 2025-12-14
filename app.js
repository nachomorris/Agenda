// 🔴 PEGÁ ACÁ LA URL CSV DE GOOGLE SHEETS
const SHEET_CSV_URL = "PEGAR_ACA_TU_URL_CSV";

const $ = id => document.getElementById(id);
let events = [];
let filters = { q: "", category: "", locality: "", today: false };

async function loadEvents() {
  const res = await fetch(SHEET_CSV_URL + "&_=" + Date.now());
  const csv = await res.text();
  events = csvToJson(csv);
  initFilters();
  render();
}

function csvToJson(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]?.trim() || "");
    return obj;
  });
}

function initFilters() {
  fillSelect("category", [...new Set(events.map(e => e.category).filter(Boolean))]);
  fillSelect("locality", [...new Set(events.map(e => e.locality).filter(Boolean))]);

  $("search").oninput = e => { filters.q = e.target.value.toLowerCase(); render(); };
  $("category").onchange = e => { filters.category = e.target.value; render(); };
  $("locality").onchange = e => { filters.locality = e.target.value; render(); };
  $("today").onclick = () => { filters.today = true; render(); };
  $("reset").onclick = () => resetFilters();
}

function fillSelect(id, values) {
  const select = $(id);
  select.innerHTML = `<option value="">Todas</option>` +
    values.map(v => `<option value="${v}">${v}</option>`).join("");
}

function resetFilters() {
  filters = { q: "", category: "", locality: "", today: false };
  $("search").value = "";
  $("category").value = "";
  $("locality").value = "";
  render();
}

function render() {
  const list = $("events");
  list.innerHTML = "";

  const today = new Date();

  const filtered = events.filter(e => {
    if (filters.q && !e.title.toLowerCase().includes(filters.q)) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.locality && e.locality !== filters.locality) return false;
    if (filters.today && !isToday(e.start, today)) return false;
    return true;
  });

  $("count").innerText = `${filtered.length} evento(s)`;
  $("empty").hidden = filtered.length !== 0;

  filtered.forEach(e => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">${e.category}</span>
      <h3>${e.title}</h3>
      <p><b>Fecha:</b> ${formatDate(e.start)}</p>
      <p><b>Lugar:</b> ${e.venue} – ${e.locality}</p>
      <p>${e.description}</p>
      ${e.link ? `<a href="${e.link}" target="_blank">Más info</a>` : ""}
    `;
    list.appendChild(card);
  });
}

function isToday(dateStr, today) {
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("es-AR");
}

loadEvents();
