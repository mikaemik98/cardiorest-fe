// js/pages/diary.js
import { renderSidebar } from "../components/sidebar.js";
import {
  createDiaryEntry,
  getAllDiaryEntries,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "../services/diaryService.js";

let entries = [];
let editingId = null;

// Alusta sivu
async function init() {
  renderSidebar("diary");

  // Aseta tänään oletuksena
  document.getElementById("entryDate").valueAsDate = new Date();

  // Tapahtumakuuntelijat
  document
    .getElementById("newEntryBtn")
    .addEventListener("click", openNewEntryForm);
  document.getElementById("cancelBtn").addEventListener("click", closeForm);
  document.getElementById("cancelFormBtn").addEventListener("click", closeForm);
  document
    .getElementById("diaryForm")
    .addEventListener("submit", handleFormSubmit);

  // Hamburger-valikko
  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("show");
  });

  // Lataa merkinnät
  await loadEntries();
}

// Avaa uuden merkinnän lomake
function openNewEntryForm() {
  editingId = null;
  document.getElementById("entryId").value = "";
  document.getElementById("entryDate").valueAsDate = new Date();
  document.getElementById("entryMood").value = "";
  document.getElementById("entryContent").value = "";
  document.getElementById("entryForm").style.display = "block";
  document.querySelector(".card-title").textContent = "Uusi päiväkirjamerkintä";
  document.getElementById("entryContent").focus();
}

// Sulje lomake
function closeForm() {
  document.getElementById("entryForm").style.display = "none";
  editingId = null;
}

// Tallenna merkintä
async function handleFormSubmit(e) {
  e.preventDefault();

  const entryDate = document.getElementById("entryDate").value;
  const content = document.getElementById("entryContent").value.trim();
  const mood = document.getElementById("entryMood").value;

  if (!entryDate || !content) {
    alert("Päivämäärä ja sisältö ovat pakollisia!");
    return;
  }

  const entryData = {
    entry_date: entryDate,
    content: content,
    mood: mood || null,
  };

  try {
    if (editingId) {
      // Päivitä olemassa oleva merkintä
      await updateDiaryEntry(editingId, entryData);
      showNotification("Merkintä päivitetty!", "success");
    } else {
      // Luo uusi merkintä
      await createDiaryEntry(entryData);
      showNotification("Merkintä tallennettu!", "success");
    }

    closeForm();
    await loadEntries();
  } catch (error) {
    console.error("Tallennus epäonnistui:", error);
    showNotification("Tallennus epäonnistui. Yritä uudelleen.", "error");
  }
}

// Lataa kaikki merkinnät
async function loadEntries() {
  try {
    entries = await getAllDiaryEntries();
    renderEntries();
  } catch (error) {
    console.error("Merkintöjen lataus epäonnistui:", error);
    showNotification("Merkintöjen lataus epäonnistui", "error");
  }
}

// Renderöi merkinnät sivulle
function renderEntries() {
  const container = document.getElementById("entriesList");
  const countEl = document.getElementById("entryCount");

  countEl.textContent =
    entries.length === 1 ? "1 merkintä" : `${entries.length} merkintää`;

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <p>Ei vielä merkintöjä</p>
        <p class="empty-hint">Luo ensimmäinen päiväkirjamerkintäsi</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries
    .map((entry) => {
      const date = new Date(entry.entry_date);
      const dateStr = date.toLocaleDateString("fi-FI", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const moodEmoji = getMoodEmoji(entry.mood);

      return `
      <div class="entry-item" data-id="${entry.id}">
        <div class="entry-header">
          <div class="entry-date">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="12" height="11" rx="2"/>
              <line x1="2" y1="7" x2="14" y2="7"/>
              <line x1="6" y1="1" x2="6" y2="5"/>
              <line x1="10" y1="1" x2="10" y2="5"/>
            </svg>
            ${dateStr}
          </div>
          ${entry.mood ? `<span class="entry-mood">${moodEmoji} ${entry.mood}</span>` : ""}
        </div>
        <div class="entry-content">${escapeHtml(entry.content)}</div>
        <div class="entry-actions">
          <button class="btn-text" onclick="editEntry(${entry.id})">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 2l3 3-9 9H2v-3l9-9z"/>
            </svg>
            Muokkaa
          </button>
          <button class="btn-text btn-danger" onclick="deleteEntryConfirm(${entry.id})">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3 6 3 14 13 14 13 6"/>
              <path d="M6 6V4h4v2"/>
              <line x1="1" y1="6" x2="15" y2="6"/>
            </svg>
            Poista
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// Muokkaa merkintää
window.editEntry = function (id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;

  console.log("entry_date arvo:", entry.entry_date);
  console.log("entry_date tyyppi:", typeof entry.entry_date);

  editingId = id;
  document.getElementById("entryId").value = id;

  const dateStr = entry.entry_date.split("T")[0];
  document.getElementById("entryDate").value = dateStr;
  document.getElementById("entryMood").value = entry.mood || "";
  document.getElementById("entryContent").value = entry.content;
  document.getElementById("entryForm").style.display = "block";
  document.querySelector(".card-title").textContent = "Muokkaa merkintää";
  document.getElementById("entryContent").focus();

  // Scrollaa lomakkeelle
  document.getElementById("entryForm").scrollIntoView({ behavior: "smooth" });
};

// Poista merkintä vahvistuksen jälkeen
window.deleteEntryConfirm = async function (id) {
  if (!confirm("Haluatko varmasti poistaa tämän merkinnän?")) return;

  try {
    await deleteDiaryEntry(id);
    showNotification("Merkintä poistettu", "success");
    await loadEntries();
  } catch (error) {
    console.error("Poisto epäonnistui:", error);
    showNotification("Poisto epäonnistui", "error");
  }
};

// Apufunktiot
function getMoodEmoji(mood) {
  const moods = {
    erinomainen: "😊",
    hyvä: "🙂",
    neutraali: "😐",
    huono: "😕",
    "erittäin huono": "😞",
  };
  return moods[mood] || "";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, "<br>");
}

function showNotification(message, type = "info") {
  // Yksinkertainen ilmoitus - voit korvata paremmalla toteutuksella
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === "success" ? "var(--teal)" : "var(--red)"};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Alusta kun sivu latautuu
document.addEventListener("DOMContentLoaded", init);
