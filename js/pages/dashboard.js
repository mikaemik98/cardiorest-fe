import {
  getLatestAnalysis,
  getAnalysisTrend,
  getTimevaryingData,
  getLatestDiaryEntry,
} from "../services/analysisService.js";
import { renderHrvNightChart } from "../components/hrvChart.js";
import { renderSidebar } from "../components/sidebar.js";
import { getRecoveryText, getRecoveryLevel } from "../utils/helpers.js";

// Suositukset palautumistason mukaan
const RECOMMENDATIONS = {
  good: [
    {
      title: "Erinomainen palautuminen",
      desc: "Kehosi on palautunut hyvin. Voit jatkaa normaalisti!",
      type: "good",
    },
    {
      title: "Stressitaso matala",
      desc: "Hermostosi on tasapainossa — hyvä merkki palautumisesta.",
      type: "good",
    },
  ],
  moderate: [
    {
      title: "Kohtuullinen palautuminen",
      desc: "Huolehdi tauoista ja riittävästä levosta tänään.",
      type: "warn",
    },
    {
      title: "Nukkumaanmenoaika",
      desc: "Kokeile mennä nukkumaan klo 22–23 — se parantaa palautumista.",
      type: "warn",
    },
  ],
  poor: [
    {
      title: "Kehosi tarvitsee lepoa",
      desc: "Vältä raskasta kuormitusta tänään ja pyri nukkumaan aiemmin.",
      type: "warn",
    },
    {
      title: "Stressitaso koholla",
      desc: "Kokeile rentoutumisharjoituksia ennen nukkumaanmenoa.",
      type: "warn",
    },
  ],
};

/** Renderöi palautumissuositukset readiness-tason mukaan */
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

/** Päivittää score-kortin readiness-datan perusteella */
function updateScoreCard(data) {
  const readiness = data.readiness ?? 0;
  const rmssd = data.rmssd_ms ?? 0;
  const color =
    readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171";

  document.getElementById("scoreVal").textContent = Math.round(readiness);
  document.getElementById("scoreRating").textContent =
    getRecoveryText(readiness);
  document.getElementById("metricDuration").textContent =
    data.sleep_duration_h ?? "-";
  document.getElementById("metricHrv").textContent = rmssd.toFixed(1) + " ms";
  document.getElementById("metricRecovery").textContent =
    Math.round(readiness) + "%";
  document.getElementById("dateLabel").textContent = data.recorded_at
    ? new Date(data.recorded_at).toLocaleDateString("fi-FI")
    : new Date().toLocaleDateString("fi-FI");

  // Labelit
  const lblDuration =
    document.getElementById("metricDuration")?.nextElementSibling;
  const lblHrv = document.getElementById("metricHrv")?.nextElementSibling;
  const lblRecovery =
    document.getElementById("metricRecovery")?.nextElementSibling;
  if (lblDuration) lblDuration.textContent = "Unen kesto";
  if (lblHrv) lblHrv.textContent = "Sykevälivaihtelu";
  if (lblRecovery) lblRecovery.textContent = "Palautuminen";

  // Ympyräkaavio
  const arc = document.getElementById("scoreArc");
  if (arc) {
    const circumference = 2 * Math.PI * 46;
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset =
      circumference - (readiness / 100) * circumference;
    arc.setAttribute("stroke", color);
  }

  // Värikoodaus
  const scoreValEl = document.getElementById("scoreVal");
  if (scoreValEl) scoreValEl.style.color = color;
  const recoveryEl = document.getElementById("metricRecovery");
  if (recoveryEl) recoveryEl.style.color = color;
}

let currentData = null;
let miniTrendRoot = null;

/** Renderöi 7 päivän palautumiskehityskaavion */
function renderMiniTrend(trendData) {
  const el = document.getElementById("miniTrendChart");
  if (!el) return;

  if (!trendData || trendData.length < 2) {
    el.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);text-align:center;padding:20px">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
        <div style="font-size:13px;font-weight:600;color:var(--text);opacity:0.6">Ei tarpeeksi dataa</div>
        <div style="font-size:13px;opacity:0.5;line-height:1.5">Tee vähintään 2 mittausta<br>nähdäksesi kehityskaavion</div>
      </div>`;
    return;
  }

  if (miniTrendRoot) {
    miniTrendRoot.dispose();
    miniTrendRoot = null;
  }

  const chartData = trendData.map((d) => ({
    date: new Date(d.created_at).toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "numeric",
    }),
    value: Math.round(d.readiness ?? 0),
  }));

  const root = am5.Root.new("miniTrendChart");
  miniTrendRoot = root;
  root._logo?.dispose();
  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 10,
      paddingBottom: 0,
    }),
  );
  chart.zoomOutButton.set("forceHidden", true);

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "none" }),
  );
  cursor.lineX.set("visible", false);
  cursor.lineY.set("visible", false);

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
  xRenderer.grid.template.set("visible", false);
  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: xRenderer,
    }),
  );

  const yRenderer = am5xy.AxisRendererY.new(root, {});
  yRenderer.grid.template.setAll({
    strokeDasharray: [2, 4],
    strokeOpacity: 0.3,
  });
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: yRenderer,
    }),
  );

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "date",
      stroke: am5.color("#10D4A0"),
      fill: am5.color("#10D4A0"),
      tooltip: am5.Tooltip.new(root, {
        labelText: "Palautuminen: [bold]{valueY}/100[/]",
      }),
    }),
  );
  series.strokes.template.setAll({ strokeWidth: 2 });
  series.fills.template.setAll({ fillOpacity: 0.15, visible: true });
  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 4,
        fill: am5.color("#10D4A0"),
        stroke: root.interfaceColors.get("background"),
        strokeWidth: 2,
      }),
    }),
  );

  xAxis.data.setAll(chartData);
  series.data.setAll(chartData);
  series.appear(800);
  chart.appear(800, 100);
}

/** Päivittää palautumismittareiden edistymispalkit ja värikoodauksen */
function updateMeters(data) {
  const readiness = data.readiness ?? 0;
  const pns = data.pns_index ?? 0;
  const stress = data.stress_index ?? 0;
  const quality = data.artefact_level ?? "GOOD";

  document.getElementById("meterReadiness").textContent =
    Math.round(readiness) + "/100";
  document.getElementById("meterPns").textContent = pns.toFixed(2);
  document.getElementById("meterStress").textContent = stress.toFixed(1);
  document.getElementById("meterQuality").textContent =
    quality === "GOOD"
      ? "Hyvä"
      : quality === "MODERATE"
        ? "Kohtalainen"
        : "Heikko";

  // Värikoodaus
  const setColor = (id, color) => {
    const el = document.getElementById(id);
    if (el) el.style.color = color;
  };
  setColor(
    "meterReadiness",
    readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171",
  );
  setColor("meterPns", pns >= 0 ? "#10D4A0" : "#F87171");
  setColor(
    "meterStress",
    stress < 10 ? "#10D4A0" : stress < 15 ? "#F59E0B" : "#F87171",
  );
  setColor(
    "meterQuality",
    quality === "GOOD"
      ? "#10D4A0"
      : quality === "MODERATE"
        ? "#F59E0B"
        : "#F87171",
  );

  // Edistymispalkit
  const pnsPct = Math.min(Math.max(((pns + 3) / 6) * 100, 0), 100);
  const stressPct = Math.min((stress / 20) * 100, 100);

  const setBar = (id, width, bg) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = width;
      el.style.background = bg;
    }
  };

  setBar(
    "meterReadinessFill",
    Math.round(readiness) + "%",
    readiness >= 70
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : readiness >= 40
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );
  setBar(
    "meterPnsFill",
    pnsPct + "%",
    pns >= 0
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : "linear-gradient(90deg,#B91C1C,#F87171)",
  );
  setBar(
    "meterStressFill",
    stressPct + "%",
    stress < 10
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : stress < 15
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );
  setBar(
    "meterQualityFill",
    quality === "GOOD" ? "90%" : quality === "MODERATE" ? "55%" : "25%",
    quality === "GOOD"
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : quality === "MODERATE"
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );
}

/**
 * Vaihtaa dashboard-näkymän readiness- ja timevarying-välilehtien välillä.
 * Readiness-näkymässä näytetään palautumisympyrä ja mittarit.
 * Timevarying-näkymässä näytetään yönaikainen HRV-aikasarjakaavio.
 */
async function switchView(view) {
  document
    .getElementById("tabReadiness")
    ?.classList.toggle("active", view === "readiness");
  document
    .getElementById("tabTimevarying")
    ?.classList.toggle("active", view === "timevarying");

  const readinessCharts = document.getElementById("readinessCharts");
  const hrvCard = document.getElementById("hrvChartCard");
  const scoreCard = document.getElementById("scoreCard");

  if (view === "readiness") {
    const scoreCircle = document.querySelector(".score-circle");
    if (scoreCircle) scoreCircle.style.display = "";
    if (readinessCharts) readinessCharts.style.display = "grid";
    if (hrvCard) hrvCard.style.display = "none";
    if (scoreCard) scoreCard.style.display = "block";

    if (currentData) {
      updateScoreCard(currentData);
      renderRecommendations(currentData.readiness);
    }
  } else if (view === "timevarying") {
    if (readinessCharts) readinessCharts.style.display = "none";
    if (hrvCard) hrvCard.style.display = "block";
    if (scoreCard) scoreCard.style.display = "block";

    try {
      const tvData = await getTimevaryingData();
      if (!tvData?.timevarying) return;

      const tv = tvData.timevarying;

      // Laske tilastot
      const avgHr = tv.hr?.length
        ? Math.round(tv.hr.reduce((a, b) => a + b, 0) / tv.hr.length)
        : null;
      const maxHr = tv.hr?.length ? Math.round(Math.max(...tv.hr)) : null;

      // Laske unen kesto viimeisestä labels-arvosta
      const durationSec = tv.labels?.length
        ? Math.round(tv.labels[tv.labels.length - 1])
        : 0;
      const durationH = Math.floor(durationSec / 3600);
      const durationMin = Math.floor((durationSec % 3600) / 60);
      const durationStr =
        durationH > 0 ? `${durationH}h ${durationMin}min` : `${durationMin}min`;

      // Päivitä score-kortti yönaikaista dataa varten
      document.getElementById("scoreVal").textContent = avgHr ?? "–";
      document.getElementById("scoreRating").textContent =
        "Yönaikainen sykeanalyysi";
      document.getElementById("metricDuration").textContent = durationStr;
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
      if (lblDuration) lblDuration.textContent = "Unen kesto";
      if (lblHrv) lblHrv.textContent = "Keskisyke";
      if (lblRecovery) lblRecovery.textContent = "Korkein syke";

      // Piilota palautumisympyrä — ei relevantti yöaikaiselle sykdatalle
      const scoreCircle = document.querySelector(".score-circle");
      if (scoreCircle) scoreCircle.style.display = "none";
      const scoreValEl = document.getElementById("scoreVal");
      if (scoreValEl) scoreValEl.style.color = "#60A5FA";

      renderHrvNightChart("hrvNightChart", {
        labels: tv.labels,
        hr: tv.hr,
        rmssd: tv.rmssd,
        recorded_at: tvData.recorded_at,
      });
    } catch (err) {
      console.error("Timevarying haku epäonnistui:", err);
    }
  }
}
window.switchView = switchView;

/** Tarkistaa että käyttäjä on kirjautunut — ohjaa kirjautumissivulle jos ei */
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "/index.html";
}

/** Renderöi viimeisimmän päiväkirjamerkinnän dashboardille */
function renderLatestDiaryEntry(entry) {
  const el = document.getElementById("latestDiaryCard");
  if (!el) return;
  if (!entry) {
    el.style.display = "none";
    return;
  }

  const date = new Date(entry.entry_date).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const moodEmoji =
    {
      erinomainen: "😊",
      hyvä: "🙂",
      neutraali: "😐",
      huono: "😕",
      "erittäin huono": "😞",
    }[entry.mood] ?? "";
  const preview =
    entry.content.length > 100
      ? entry.content.substring(0, 100) + "..."
      : entry.content;

  el.innerHTML = `
    <div class="card-header">
      <span class="card-title">Viimeisin päiväkirjamerkintä</span>
      <span style="font-size:12px;color:var(--muted);font-family:var(--mono)">${date}</span>
    </div>
    <div style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:12px">
      ${moodEmoji ? `<span style="margin-right:6px">${moodEmoji}</span>` : ""}
      ${preview}
    </div>
    <a href="/diary.html" style="font-size:12px;color:var(--teal);font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
      Avaa päiväkirja
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 8h10M9 4l4 4-4 4"/>
      </svg>
    </a>`;
}

/** Alustaa dashboardin — hakee datan ja renderöi kaikki komponentit */
async function init() {
  checkAuth();
  renderSidebar("dashboard");

  try {
    document.getElementById("scoreRating").textContent = "Ladataan...";

    const [data, trendData, diaryEntry, tvData] = await Promise.all([
      getLatestAnalysis(),
      getAnalysisTrend(7),
      getLatestDiaryEntry(),
      getTimevaryingData(),
    ]);

    currentData = data;

    // Laske unen kesto timevarying-datan viimeisestä labels-arvosta
    if (tvData?.timevarying?.labels?.length) {
      const labels = tvData.timevarying.labels;
      const durationSec = Math.round(labels[labels.length - 1]);
      const durationH = Math.floor(durationSec / 3600);
      const durationMin = Math.floor((durationSec % 3600) / 60);
      data.sleep_duration_h =
        durationH > 0 ? `${durationH}h ${durationMin}min` : `${durationMin}min`;
    }

    updateScoreCard(data);
    updateMeters(data);
    renderRecommendations(data.readiness);
    renderMiniTrend(trendData);
    renderLatestDiaryEntry(diaryEntry);

    const hrvCard = document.getElementById("hrvChartCard");
    if (hrvCard) hrvCard.style.display = "none";
  } catch (err) {
    console.error("Dashboard init virhe:", err);
    document.getElementById("scoreRating").textContent =
      "Analyysiä ei saatavilla";
  }
}

init();
