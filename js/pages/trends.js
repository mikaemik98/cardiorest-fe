import { getAnalysisTrend } from "../services/analysisService.js";
import { renderSidebar } from "../components/sidebar.js";
import {
  formatDate,
  getRecoveryLevel,
  getRecoveryText,
  round,
  average,
} from "../utils/helpers.js";

let trendChart = null;
let pnsChart = null;
let snsChart = null;

const COLORS = {
  teal: "#10D4A0",
  blue: "#60A5FA",
  amber: "#F59E0B",
  red: "#F87171",
  grid: "rgba(255,255,255,0.04)",
};

// ── Apufunktiot ensin ──

function destroyCharts() {
  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }
  if (pnsChart) {
    pnsChart.destroy();
    pnsChart = null;
  }
  if (snsChart) {
    snsChart.destroy();
    snsChart = null;
  }
}

function buildLabels(data) {
  return data.map((d) => formatDate(d.created_at));
}

function setDelta(elId, current, previous, higherIsBetter = true) {
  const el = document.getElementById(elId);
  if (!el || !previous) return;
  const diff = round(current - previous, 1);
  const up = diff > 0;
  const good = higherIsBetter ? up : !up;
  el.textContent = (up ? "↑ +" : "↓ ") + Math.abs(diff);
  el.className = "stat-delta " + (good ? "up" : "down");
}

// ── Render-funktiot ──

function renderStatCards(data) {
  if (!data.length) return;

  const half = Math.floor(data.length / 2);
  const recent = data.slice(half);
  const older = data.slice(0, half);

  const avgReadiness = round(average(data.map((d) => d.readiness ?? 0)), 0);
  const avgRmssd = round(average(data.map((d) => d.rmssd_ms ?? 0)), 1);
  const avgStress = round(average(data.map((d) => d.stress_index ?? 0)), 1);

  document.getElementById("statReadiness").textContent = avgReadiness;
  document.getElementById("statRmssd").textContent = avgRmssd + " ms";
  document.getElementById("statStress").textContent = avgStress;

  setDelta(
    "statReadinessDelta",
    average(recent.map((d) => d.readiness ?? 0)),
    average(older.map((d) => d.readiness ?? 0)),
    true,
  );
  setDelta(
    "statRmssdDelta",
    average(recent.map((d) => d.rmssd_ms ?? 0)),
    average(older.map((d) => d.rmssd_ms ?? 0)),
    true,
  );
  setDelta(
    "statStressDelta",
    average(recent.map((d) => d.stress_index ?? 0)),
    average(older.map((d) => d.stress_index ?? 0)),
    false,
  );
}

function renderTrendChart(data) {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: buildLabels(data),
      datasets: [
        {
          label: "Readiness",
          data: data.map((d) => round(d.readiness ?? 0, 0)),
          borderColor: COLORS.teal,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
        },
        {
          label: "RMSSD",
          data: data.map((d) => round(d.rmssd_ms ?? 0, 1)),
          borderColor: COLORS.blue,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
        },
        {
          label: "Stress",
          data: data.map((d) => round(d.stress_index ?? 0, 1)),
          borderColor: COLORS.amber,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { color: COLORS.grid } },
        y: { grid: { color: COLORS.grid }, min: 0 },
      },
    },
  });
}

function renderPnsChart(data) {
  const ctx = document.getElementById("pnsChart");
  if (!ctx) return;

  pnsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: buildLabels(data),
      datasets: [
        {
          label: "PNS-indeksi",
          data: data.map((d) => round(d.pns_index ?? 0, 2)),
          backgroundColor: data.map((d) =>
            (d.pns_index ?? 0) >= 0
              ? "rgba(16,212,160,0.6)"
              : "rgba(248,113,113,0.6)",
          ),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: COLORS.grid } },
        y: { grid: { color: COLORS.grid } },
      },
    },
  });
}

function renderSnsChart(data) {
  const ctx = document.getElementById("snsChart");
  if (!ctx) return;

  snsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: buildLabels(data),
      datasets: [
        {
          label: "SNS-indeksi",
          data: data.map((d) => round(d.sns_index ?? 0, 2)),
          backgroundColor: data.map((d) =>
            (d.sns_index ?? 0) <= 0
              ? "rgba(16,212,160,0.6)"
              : "rgba(248,113,113,0.6)",
          ),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: COLORS.grid } },
        y: { grid: { color: COLORS.grid } },
      },
    },
  });
}

function renderHistoryTable(data) {
  const tbody = document.getElementById("historyTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  [...data].reverse().forEach((row) => {
    const level = getRecoveryLevel(row.readiness ?? 0);
    const text = getRecoveryText(row.readiness ?? 0);
    tbody.innerHTML += `
            <tr>
                <td>${formatDate(row.created_at)}</td>
                <td>${round(row.readiness ?? 0, 0)}</td>
                <td>${round(row.rmssd_ms ?? 0, 1)} ms</td>
                <td>${round(row.stress_index ?? 0, 1)}</td>
                <td>
                    <span class="status-badge status-${level}">
                        ${text}
                    </span>
                </td>
            </tr>`;
  });
}

// ── Päälogiikka ──

async function loadTrends(days) {
  try {
    destroyCharts();

    const data = await getAnalysisTrend(days);

    if (!data?.length) {
      console.log("Ei trenditietoja");
      return;
    }

    renderStatCards(data);
    renderTrendChart(data);
    renderPnsChart(data);
    renderSnsChart(data);
    renderHistoryTable(data);
  } catch (err) {
    console.error("Trendien lataus epäonnistui:", err);
  }
}

async function init() {
  renderSidebar("trends");

  const periodSelect = document.getElementById("periodSelect");
  periodSelect?.addEventListener("change", (e) => {
    loadTrends(parseInt(e.target.value));
  });

  await loadTrends(7);
}

init();
