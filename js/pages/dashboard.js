// js/pages/dashboard.js
import {
  syncFromKubios,
  syncTimevarying,
  getLatestAnalysis,
} from "../services/analysisService.js";
import { renderHrvNightChart } from "../components/hrvChart.js";
import { renderSleepStagesChart } from "../components/sleepChart.js";
import { renderSidebar } from "../components/sidebar.js";

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
    {
      title: "Stressinhallinta",
      desc: "HRV-arvosi viittaavat kohonneeseen kuormitukseen.",
      type: "warn",
    },
  ],
  poor: [
    {
      title: "Heikko palautuminen",
      desc: "Suosi kevyttä päivää ja vältä ylimääräistä kuormitusta.",
      type: "warn",
    },
    {
      title: "Lisää unta",
      desc: "Pyri nukkumaan vähintään 7–8 tuntia seuraavana yönä.",
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
  if (!list) return;
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
  const readiness = data.readiness ?? 0;
  const rmssd = data.rmssd_ms ?? 0;

  document.getElementById("scoreVal").textContent = Math.round(readiness);
  document.getElementById("scoreRating").textContent =
    readiness >= 70
      ? "Erinomainen"
      : readiness >= 40
        ? "Kohtalainen"
        : "Heikko";

  document.getElementById("metricDuration").textContent = data.sleep_duration_h
    ? data.sleep_duration_h + "h"
    : "–";
  document.getElementById("metricHrv").textContent = rmssd.toFixed(1) + " ms";
  document.getElementById("metricRecovery").textContent =
    Math.round(readiness) + "%";
  document.getElementById("dateLabel").textContent = data.recorded_at
    ? new Date(data.recorded_at).toLocaleDateString("fi-FI")
    : new Date().toLocaleDateString("fi-FI");

  const lblDuration =
    document.getElementById("metricDuration")?.nextElementSibling;
  const lblHrv = document.getElementById("metricHrv")?.nextElementSibling;
  const lblRecovery =
    document.getElementById("metricRecovery")?.nextElementSibling;
  if (lblDuration) lblDuration.textContent = "Kesto";
  if (lblHrv) lblHrv.textContent = "HRV ka.";
  if (lblRecovery) lblRecovery.textContent = "Palautuminen";

  const arc = document.getElementById("scoreArc");
  if (arc) {
    const circumference = 2 * Math.PI * 46;
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset =
      circumference - (readiness / 100) * circumference;
  }
}

let currentData = null;

function switchView(view) {
  document
    .getElementById("tabReadiness")
    ?.classList.toggle("active", view === "readiness");
  document
    .getElementById("tabTimevarying")
    ?.classList.toggle("active", view === "timevarying");

  const hrvCard = document.getElementById("hrvChartCard");

  if (view === "readiness") {
    if (hrvCard) hrvCard.style.display = "none";
    if (currentData) {
      updateScoreCard(currentData);
      renderRecommendations(currentData.readiness);
    }
  } else if (view === "timevarying") {
    if (hrvCard) hrvCard.style.display = "block";
    if (!currentData?.timevarying_data) {
      if (hrvCard)
        hrvCard.innerHTML = `
                <div class="card-header">
                    <span class="card-title">HRV-vaihtelu yön aikana</span>
                </div>
                <div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">
                    Ei HRV-aikasarjadataa saatavilla
                </div>`;
      return;
    }

    const tv =
      typeof currentData.timevarying_data === "string"
        ? JSON.parse(currentData.timevarying_data)
        : currentData.timevarying_data;

    const avgHr = tv.hr?.length
      ? Math.round(tv.hr.reduce((a, b) => a + b, 0) / tv.hr.length)
      : null;
    const maxHr = tv.hr?.length ? Math.round(Math.max(...tv.hr)) : null;
    const minHr = tv.hr?.length ? Math.round(Math.min(...tv.hr)) : null;

    document.getElementById("scoreVal").textContent = avgHr ?? "–";
    document.getElementById("scoreRating").textContent = "HRV-aikasarja";
    document.getElementById("metricDuration").textContent = minHr
      ? minHr + " bpm"
      : "–";
    document.getElementById("metricHrv").textContent = avgHr
      ? avgHr + " bpm"
      : "–";
    document.getElementById("metricRecovery").textContent = maxHr
      ? maxHr + " bpm"
      : "–";

    const lblDuration =
      document.getElementById("metricDuration")?.nextElementSibling;
    const lblHrv = document.getElementById("metricHrv")?.nextElementSibling;
    const lblRecovery =
      document.getElementById("metricRecovery")?.nextElementSibling;
    if (lblDuration) lblDuration.textContent = "Min syke";
    if (lblHrv) lblHrv.textContent = "Syke ka.";
    if (lblRecovery) lblRecovery.textContent = "Max syke";

    const arc = document.getElementById("scoreArc");
    if (arc && avgHr) {
      const circumference = 2 * Math.PI * 46;
      const pct = Math.min((avgHr - 40) / 60, 1);
      arc.style.strokeDasharray = circumference;
      arc.style.strokeDashoffset = circumference - pct * circumference;
    }

    renderHrvNightChart("hrvNightChart", { labels: tv.labels, hr: tv.hr });
  }
}

window.switchView = switchView;

async function init() {
  renderSidebar("dashboard");

  try {
    document.getElementById("scoreRating").textContent = "Ladataan...";

    // Käyttää analysisService.js:n USE_MOCK tarkistusta
    // Jos USE_MOCK = true nämä palaavat heti tekemättä mitään
    await syncFromKubios();
    await syncTimevarying();

    const data = await getLatestAnalysis();
    currentData = data;

    updateScoreCard(data);
    renderRecommendations(data.readiness);
    renderSleepStagesChart("sleepStagesChart", null);

    const hrvCard = document.getElementById("hrvChartCard");
    if (hrvCard) hrvCard.style.display = "none";
  } catch (err) {
    console.error("Virhe:", err);
    document.getElementById("scoreRating").textContent =
      "Analyysiä ei saatavilla";
  }
}

init();
