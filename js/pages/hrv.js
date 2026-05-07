// js/pages/hrv.js
import {
  getLatestAnalysis,
  getTimevaryingData,
} from "../services/analysisService.js";
import { renderHrvNightChart } from "../components/hrvChart.js";
import { renderSidebar } from "../components/sidebar.js";
import { getRecoveryText } from "../utils/helpers.js";
import { mockHrvParams } from "../data/mockData.js";
import { USE_MOCK } from "../services/analysisService.js";

/* ── Sivun alustus ─────────────────────────── */
renderSidebar("hrv");
init();

async function init() {
  try {
    const [analysis, tvData] = await Promise.all([
      getLatestAnalysis(),
      getTimevaryingData(),
    ]);

    const params = USE_MOCK ? mockHrvParams : mapToHrvParams(analysis);
    renderScoreCard(params);
    renderParamCards(params);
    renderPoincareCard(params);
    renderQualityCard(params);
    renderAnsBars(params);

    // Käytä oikeaa timevarying-dataa jos saatavilla
    if (tvData?.timevarying) {
      renderTimeseries({
        timevarying_data: tvData.timevarying,
        recorded_at: tvData.recorded_at,
      });
    } else {
      renderTimeseries(analysis);
    }
  } catch (err) {
    console.error("HRV-sivun alustus epäonnistui:", err);
    renderScoreCard(mockHrvParams);
    renderParamCards(mockHrvParams);
    renderPoincareCard(mockHrvParams);
    renderQualityCard(mockHrvParams);
    renderAnsBars(mockHrvParams);
  }
}

function mapToHrvParams(analysis) {
  return {
    readiness: analysis.readiness ?? 0,
    rmssd_ms: analysis.rmssd_ms ?? 0,
    sdnn_ms: analysis.sdnn_ms ?? 0,
    pns_index: analysis.pns_index ?? 0,
    sns_index: analysis.sns_index ?? 0,
    stress_index: analysis.stress_index ?? 0,
    mean_hr_bpm: analysis.mean_hr_bpm ?? 0,
    artefact_level: analysis.artefact_level ?? "GOOD",
    sd1_ms: analysis.sd1_ms ?? 0,
    sd2_ms: analysis.sd2_ms ?? 0,
    recorded_at: analysis.recorded_at,
  };
}

/* ── Score-kortti ─────────────────────────── */
function renderScoreCard(p) {
  const readiness = p.readiness ?? 0;

  document.getElementById("scoreVal").textContent = Math.round(readiness);
  document.getElementById("scoreRating").textContent =
    getRecoveryText(readiness);
  document.getElementById("metricRmssd").textContent = (
    p.rmssd_ms ?? 0
  ).toFixed(1);
  document.getElementById("metricSdnn").textContent = (p.sdnn_ms ?? 0).toFixed(
    1,
  );
  document.getElementById("metricHr").textContent = (
    p.mean_hr_bpm ?? 0
  ).toFixed(1);

  document.getElementById("dateLabel").textContent = p.recorded_at
    ? new Date(p.recorded_at).toLocaleDateString("fi-FI")
    : new Date().toLocaleDateString("fi-FI");

  // Värikoodaus ympyrälle
  const arc = document.getElementById("scoreArc");
  if (arc) {
    const circumference = 2 * Math.PI * 46;
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset =
      circumference - (readiness / 100) * circumference;
    arc.setAttribute(
      "stroke",
      readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171",
    );
  }

  const scoreValEl = document.getElementById("scoreVal");
  if (scoreValEl) {
    scoreValEl.style.color =
      readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171";
  }
}

function renderParamCards(p) {
  const pns = p.pns_index ?? 0;
  const sns = p.sns_index ?? 0;
  const stress = p.stress_index ?? 0;

  document.getElementById("statPns").textContent = pns.toFixed(2);
  document.getElementById("statSns").textContent = sns.toFixed(2);
  document.getElementById("statStress").textContent = stress.toFixed(1);

  // Värikoodaus
  document.getElementById("statPns").style.color =
    pns >= 0 ? "var(--teal)" : "var(--red)";
  document.getElementById("statSns").style.color =
    sns <= 0 ? "var(--teal)" : "var(--red)";
  document.getElementById("statStress").style.color =
    stress < 8 ? "var(--teal)" : stress < 12 ? "var(--amber)" : "var(--red)";

  // Palkit
  const pnsPct = Math.min(Math.max(((pns + 3) / 6) * 100, 0), 100);
  const snsPct = Math.min((Math.abs(sns) / 3) * 100, 100);
  const stressPct = Math.min((stress / 20) * 100, 100);

  const pnsFill = document.getElementById("pnsFill");
  if (pnsFill) {
    pnsFill.style.width = pnsPct + "%";
    pnsFill.style.background =
      pns >= 0
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : "linear-gradient(90deg, #B91C1C, #F87171)";
  }

  const snsFill = document.getElementById("snsFill");
  if (snsFill) {
    snsFill.style.width = snsPct + "%";
    snsFill.style.background =
      sns <= 0
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : "linear-gradient(90deg, #B91C1C, #F87171)";
  }

  const stressFill = document.getElementById("stressFill");
  if (stressFill) {
    stressFill.style.width = stressPct + "%";
  }
}

/* ── Poincaré-analyysi ───────────────────── */
function renderPoincareCard(p) {
  const sd1 = p.sd1_ms ?? 0;
  const sd2 = p.sd2_ms ?? 0;
  const ratio = sd1 > 0 ? (sd2 / sd1).toFixed(2) : "–";

  document.getElementById("paramSd1").textContent = sd1.toFixed(1);
  document.getElementById("paramSd2").textContent = sd2.toFixed(1);
  document.getElementById("paramSdRatio").textContent = ratio;
}

/* ── Mittauksen laatu ────────────────────── */
function renderQualityCard(p) {
  const level = p.artefact_level ?? "GOOD";
  const badge = document.getElementById("qualityBadge");
  const desc = document.getElementById("qualityDesc");
  const pct = document.getElementById("qualityPct");
  const fill = document.getElementById("qualityFill");

  const labels = {
    GOOD: {
      text: "Hyvä",
      cls: "good",
      pct: 95,
      desc: "Mittauksen laatu on erinomainen.",
    },
    MODERATE: {
      text: "Kohtalainen",
      cls: "moderate",
      pct: 65,
      desc: "Mittauksessa pieniä häiriöitä.",
    },
    BAD: {
      text: "Heikko",
      cls: "poor",
      pct: 30,
      desc: "Mittauksessa merkittäviä häiriöitä.",
    },
  };

  const info = labels[level] ?? labels.GOOD;
  badge.textContent = info.text;
  badge.className = "quality-badge " + info.cls;
  desc.textContent = info.desc;
  pct.textContent = info.pct + "%";
  fill.style.width = info.pct + "%";
}

/* ── Autonomisen hermoston palkit ─────── */
function renderAnsBars(p) {
  const pns = p.pns_index ?? 0;
  const sns = Math.abs(p.sns_index ?? 0);
  const stress = p.stress_index ?? 0;

  // PNS: 0..2 -> 0..100%
  const pnsPct = Math.min(100, Math.max(0, ((pns + 1) / 3) * 100));
  // SNS: 0..2 -> 0..100%
  const snsPct = Math.min(100, Math.max(0, (sns / 2) * 100));
  // Stress: 0..20 -> 0..100%
  const stressPct = Math.min(100, Math.max(0, (stress / 20) * 100));

  document.getElementById("ansPnsFill").style.width = pnsPct + "%";
  document.getElementById("ansPnsVal").textContent = pns.toFixed(2);

  document.getElementById("ansSnsFill").style.width = snsPct + "%";
  document.getElementById("ansSnsVal").textContent = (p.sns_index ?? 0).toFixed(
    2,
  );

  document.getElementById("ansStressFill").style.width = stressPct + "%";
  document.getElementById("ansStressVal").textContent = stress.toFixed(1);
}

/* ── HRV-aikasarjakaavio ─────────────────── */
function renderTimeseries(analysis) {
  let timevarying = null;

  // Jos saadaan suoraan timevarying-objekti
  if (analysis?.labels && analysis?.hr) {
    timevarying = analysis;
    // Jos saadaan analysis-objekti jossa timevarying_data
  } else if (analysis?.timevarying_data) {
    try {
      timevarying =
        typeof analysis.timevarying_data === "string"
          ? JSON.parse(analysis.timevarying_data)
          : analysis.timevarying_data;
    } catch (_) {
      /* ignore */
    }
  }

  if (!timevarying) {
    // Mock-data fallback
    timevarying = {
      labels: Array.from({ length: 60 }, (_, i) => i * 5),
      hr: Array.from({ length: 60 }, () => 55 + Math.random() * 25),
      rmssd: Array.from({ length: 60 }, () => 40 + Math.random() * 40),
    };
  }

  renderDualTimeseries("hrvTimeseriesChart", {
    ...timevarying,
    recorded_at: analysis.recorded_at,
  });
}

/* ── Kahden sarjan kaavio (syke + RMSSD) ── */
let hrvRoot = null;

function renderDualTimeseries(canvasId, timevarying) {
  const el = document.getElementById(canvasId);
  if (!el) return;

  if (hrvRoot) {
    hrvRoot.dispose();
    hrvRoot = null;
  }

  const rawLabels = timevarying.labels ?? [];
  const hrData = timevarying.hr ?? [];

  // Näytteistä data
  const MAX_POINTS = 600;
  const step =
    rawLabels.length > MAX_POINTS
      ? Math.floor(rawLabels.length / MAX_POINTS)
      : 1;

  const sampledLabels = rawLabels.filter((_, i) => i % step === 0);
  const sampledHr = hrData.filter((_, i) => i % step === 0);

  const startTime = timevarying.recorded_at
    ? new Date(timevarying.recorded_at).getTime()
    : null;

  const data = sampledLabels.map((t, i) => {
    let timeStr;
    if (startTime) {
      const ms = startTime + Math.round(t) * 1000;
      const d = new Date(ms);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      timeStr = `${h}:${m}`;
    } else {
      const totalSec = Math.round(t);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
    return {
      time: timeStr,
      hr: sampledHr[i] ?? 0,
    };
  });

  const root = am5.Root.new(canvasId);
  hrvRoot = root;
  root._logo?.dispose();

  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingLeft: 0,
      paddingRight: 0,
    }),
  );

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "none" }),
  );
  cursor.lineY.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "time",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 80 }),
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  xAxis.children.push(
    am5.Label.new(root, {
      text: "Aika (hh:mm)",
      x: am5.percent(50),
      centerX: am5.percent(50),
      fontSize: 11,
      fill: am5.color("#8A9BB0"),
      paddingTop: 8,
    }),
  );

  const minHrVal = Math.min(...sampledHr.filter((v) => v > 0));

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: Math.floor(minHrVal * 0.95),
      strictMinMax: true,
      extraMax: 0.1,
    }),
  );

  yAxis.children.unshift(
    am5.Label.new(root, {
      text: "Syke (bpm)",
      rotation: -90,
      y: am5.percent(50),
      centerX: am5.percent(50),
      fontSize: 11,
      fill: am5.color("#8A9BB0"),
    }),
  );
  const hrSeries = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "hr",
      categoryXField: "time",
      stroke: am5.color("#10D4A0"),
      fill: am5.color("#10D4A0"),
      tooltip: am5.Tooltip.new(root, { labelText: "Syke: {valueY} bpm" }),
    }),
  );
  hrSeries.strokes.template.setAll({ strokeWidth: 2 });
  hrSeries.fills.template.setAll({ fillOpacity: 0.1, visible: true });
  hrSeries.bullets.clear();

  xAxis.data.setAll(data);
  hrSeries.data.setAll(data);
  hrSeries.appear(1000);
  chart.appear(1000, 100);
}
