// js/pages/dashboard.js
import { getLatestAnalysis } from "../services/analysisService.js";
import {
  renderHrvNightChart,
  renderSleepStagesChart,
} from "../components/hrvChart.js";
import { renderSidebar } from "../components/sidebar.js";

// Suositustekstit palautumistason mukaan (TV_8 / UC_6)
const RECOMMENDATIONS = {
  good: [
    {
      title: "Erinomainen palautuminen",
      desc: "HRV-arvosi olivat korkealla. Jatka samalla tavalla!",
      type: "good",
    },
    {
      title: "Hyvä syvän unen määrä",
      desc: "Syvän unen osuus on ihanteellinen palautumiseen.",
      type: "good",
    },
  ],
  moderate: [
    {
      title: "Optimoi nukkumaanmenoaika",
      desc: "Kokeile mennä nukkumaan klo 22–23 välillä.",
      type: "warn",
    },
  ],
  poor: [
    {
      title: "Heikko palautuminen",
      desc: "Suosi kevyttä päivää ja vältä ylimääräistä kuormitusta.",
      type: "warn",
    },
  ],
};

function getRecoveryLevel(readiness) {
  if (readiness >= 70) return "good";
  if (readiness >= 40) return "moderate";
  return "poor";
}

function renderRecommendations(readiness) {
  const level = getRecoveryLevel(readiness);
  const list = document.getElementById("recList");
  list.innerHTML = "";
  RECOMMENDATIONS[level].forEach((rec) => {
    list.innerHTML += `
      <li class="rec-item ${rec.type}">
        <span class="rec-title">${rec.title}</span>
        <span class="rec-desc">${rec.desc}</span>
      </li>`;
  });
}

function updateScoreCard(data) {
  document.getElementById("scoreVal").textContent = data.readiness;
  document.getElementById("scoreRating").textContent =
    data.readiness >= 70 ? "Erinomainen" : "Kohtalainen";
  document.getElementById("metricDuration").textContent =
    data.sleep_duration + "h";
  document.getElementById("metricHrv").textContent = data.rmssd_ms + " ms";
  document.getElementById("metricRecovery").textContent =
    data.recovery_pct + "%";
  document.getElementById("dateLabel").textContent =
    new Date().toLocaleDateString("fi-FI");

  // SVG-ympyrän täyttö
  const arc = document.getElementById("scoreArc");
  const circumference = 2 * Math.PI * 46; // r=46
  const offset = circumference - (data.readiness / 100) * circumference;
  arc.style.strokeDasharray = circumference;
  arc.style.strokeDashoffset = offset;
}

async function init() {
  renderSidebar("dashboard");

  try {
    const data = await getLatestAnalysis();
    updateScoreCard(data);
    renderRecommendations(data.readiness);
    renderHrvNightChart("hrvNightChart", data.timevarying);
    renderSleepStagesChart("sleepStagesChart", data.sleep_stages);
  } catch (err) {
    console.error("Analyysin lataus epäonnistui:", err);
    // TV_9: näytä virheilmoitus käyttäjälle
    document.getElementById("scoreRating").textContent =
      "Analyysiä ei saatavilla";
  }
}

init();
