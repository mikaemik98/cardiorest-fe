// js/pages/trends.js
import { getAnalysisTrend } from "../services/analysisService.js";
import { renderSidebar } from "../components/sidebar.js";
import {
  formatDate,
  getRecoveryLevel,
  getRecoveryText,
  round,
  average,
} from "../utils/helpers.js";

// amCharts root-objektit — tallennetaan jotta voidaan tuhota ennen uudelleenrenderöintiä
let trendRoot = null;
let pnsRoot = null;
let snsRoot = null;

/** Tuhoaa kaikki aktiiviset kaaviot ennen uuden datan renderöintiä */
function destroyCharts() {
  if (trendRoot) {
    trendRoot.dispose();
    trendRoot = null;
  }
  if (pnsRoot) {
    pnsRoot.dispose();
    pnsRoot = null;
  }
  if (snsRoot) {
    snsRoot.dispose();
    snsRoot = null;
  }
}

const COLORS = {
  teal: "#10D4A0",
  blue: "#60A5FA",
  amber: "#F59E0B",
  red: "#F87171",
};

/**
 * Laskee trendinuolen kahden aikavälin välille.
 * Vertaa jakson jälkipuoliskon keskiarvoa alkupuoliskoon.
 * @param {string} elId - Elementin ID johon tulos kirjoitetaan
 * @param {number} current - Jakson loppupuoliskon keskiarvo
 * @param {number} previous - Jakson alkupuoliskon keskiarvo
 * @param {boolean} higherIsBetter - true = korkeampi arvo on parempi (readiness, RMSSD)
 */
function setDelta(elId, current, previous, higherIsBetter = true) {
  const el = document.getElementById(elId);
  if (!el || !previous) return;
  const diff = round(current - previous, 1);
  const up = diff > 0;
  const good = higherIsBetter ? up : !up;
  el.textContent = (up ? "↑ +" : "↓ ") + Math.abs(diff);
  el.className = "stat-delta " + (good ? "up" : "down");
}

/**
 * Renderöi tilastokortit (readiness ka., RMSSD ka., stress-indeksi ka.)
 * edistymispalkkeineen ja trendinuoleineen
 */
function renderStatCards(data) {
  if (!data.length) return;

  const half = Math.floor(data.length / 2);
  const recent = data.slice(half);
  const older = data.slice(0, half);

  const avgReadiness = round(average(data.map((d) => d.readiness ?? 0)), 0);
  const avgRmssd = round(average(data.map((d) => d.rmssd_ms ?? 0)), 1);
  const avgStress = round(average(data.map((d) => d.stress_index ?? 0)), 1);

  // Arvot
  document.getElementById("statReadiness").textContent = avgReadiness;
  document.getElementById("statRmssd").textContent = avgRmssd + " ms";
  document.getElementById("statStress").textContent = avgStress;

  // Värikoodaus
  document.getElementById("statReadiness").style.color =
    avgReadiness >= 70 ? "#10D4A0" : avgReadiness >= 40 ? "#F59E0B" : "#F87171";
  document.getElementById("statRmssd").style.color =
    avgRmssd >= 50 ? "#10D4A0" : avgRmssd >= 30 ? "#F59E0B" : "#F87171";
  document.getElementById("statStress").style.color =
    avgStress < 10 ? "#10D4A0" : avgStress < 15 ? "#F59E0B" : "#F87171";

  // Edistymispalkit
  const setBar = (id, width, bg) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = width;
      el.style.background = bg;
    }
  };

  setBar(
    "statReadinessFill",
    avgReadiness + "%",
    avgReadiness >= 70
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : avgReadiness >= 40
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );

  setBar(
    "statRmssdFill",
    Math.min(avgRmssd, 100) + "%",
    avgRmssd >= 50
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : avgRmssd >= 30
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );

  setBar(
    "statStressFill",
    Math.min((avgStress / 20) * 100, 100) + "%",
    avgStress < 10
      ? "linear-gradient(90deg,#0A8A68,#10D4A0)"
      : avgStress < 15
        ? "linear-gradient(90deg,#B45309,#F59E0B)"
        : "linear-gradient(90deg,#B91C1C,#F87171)",
  );

  // Trendinuolet — vertaa jakson loppupuolta alkupuoleen
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

/**
 * Renderöi päätrendi-kaavion (readiness, RMSSD, stress-indeksi)
 * amCharts 5 -viivakaaviona
 */
function renderTrendChart(data) {
  const el = document.getElementById("trendChart");
  if (!el) return;

  const chartData = data.map((d) => ({
    date: formatDate(d.created_at),
    readiness: round(d.readiness ?? 0, 0),
    rmssd: round(d.rmssd_ms ?? 0, 1),
    stress: round(d.stress_index ?? 0, 1),
  }));

  const root = am5.Root.new("trendChart");
  trendRoot = root;
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
  chart.zoomOutButton.set("forceHidden", true);

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "none" }),
  );
  cursor.lineY.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 40 }),
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  );

  xAxis.data.setAll(chartData);

  // Apufunktio sarjan luontiin
  function createSeries(name, field, color) {
    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: field,
        categoryXField: "date",
        stroke: am5.color(color),
        fill: am5.color(color),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: [bold]{valueY}[/]",
        }),
      }),
    );
    series.strokes.template.setAll({ strokeWidth: 2.5 });
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series.get("fill"),
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
        }),
      }),
    );
    series.data.setAll(chartData);
    series.appear(1000);
    return series;
  }

  createSeries("Readiness", "readiness", "#10D4A0");
  createSeries("RMSSD", "rmssd", "#60A5FA");
  createSeries("Stress", "stress", "#F59E0B");

  const legend = chart.children.push(
    am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }),
  );
  legend.data.setAll(chart.series.values);
  chart.appear(1000, 100);
}

/**
 * Renderöi PNS-indeksin pylväskaavion.
 * Positiiviset arvot (vihreä) = parasympaattinen hermosto aktiivinen = hyvä palautuminen.
 * Negatiiviset arvot (punainen) = kehon kuormitus koholla.
 */
function renderPnsChart(data) {
  const el = document.getElementById("pnsChart");
  if (!el) return;

  // Lyhennä päivämäärä jos dataa paljon (yli 14 pistettä)
  const chartData = data.map((d) => ({
    date:
      data.length > 14
        ? `${new Date(d.created_at).getDate()}.${new Date(d.created_at).getMonth() + 1}.`
        : formatDate(d.created_at),
    value: round(d.pns_index ?? 0, 2),
  }));

  const root = am5.Root.new("pnsChart");
  pnsRoot = root;
  root._logo?.dispose();
  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 30,
    }),
  );

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });
  if (data.length > 10) {
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      fontSize: 10,
      paddingRight: 15,
      maxWidth: 60,
      oversizedBehavior: "truncate",
    });
  }

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: xRenderer,
    }),
  );
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }),
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "date",
      tooltip: am5.Tooltip.new(root, { labelText: "PNS: {valueY}" }),
    }),
  );
  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    strokeOpacity: 0,
  });

  // Värikoodaus: positiivinen = vihreä, negatiivinen = punainen
  series.columns.template.adapters.add("fill", (fill, target) =>
    am5.color(
      (target.dataItem?.get("valueY") ?? 0) >= 0 ? "#10D4A0" : "#F87171",
    ),
  );
  series.columns.template.adapters.add("stroke", (stroke, target) =>
    am5.color(
      (target.dataItem?.get("valueY") ?? 0) >= 0 ? "#10D4A0" : "#F87171",
    ),
  );

  xAxis.data.setAll(chartData);
  series.data.setAll(chartData);
  series.appear(1000);
  chart.appear(1000, 100);
}

/**
 * Renderöi SNS-indeksin pylväskaavion.
 * Negatiiviset arvot (vihreä) = sympaattinen hermosto matala = hyvä palautuminen.
 * Positiiviset arvot (punainen) = stressitaso koholla.
 */
function renderSnsChart(data) {
  const el = document.getElementById("snsChart");
  if (!el) return;

  const chartData = data.map((d) => ({
    date:
      data.length > 14
        ? `${new Date(d.created_at).getDate()}.${new Date(d.created_at).getMonth() + 1}.`
        : formatDate(d.created_at),
    value: round(d.sns_index ?? 0, 2),
  }));

  const root = am5.Root.new("snsChart");
  snsRoot = root;
  root._logo?.dispose();
  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      paddingLeft: 20,
      paddingRight: 0,
      paddingBottom: 30,
    }),
  );

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });
  if (data.length > 10) {
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      fontSize: 10,
      paddingRight: 15,
      maxWidth: 60,
      oversizedBehavior: "truncate",
    });
  }

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: xRenderer,
    }),
  );
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }),
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "date",
      tooltip: am5.Tooltip.new(root, { labelText: "SNS: {valueY}" }),
    }),
  );
  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    strokeOpacity: 0,
  });

  // Värikoodaus: negatiivinen = vihreä (matala SNS = hyvä), positiivinen = punainen
  series.columns.template.adapters.add("fill", (fill, target) =>
    am5.color(
      (target.dataItem?.get("valueY") ?? 0) <= 0 ? "#10D4A0" : "#F87171",
    ),
  );
  series.columns.template.adapters.add("stroke", (stroke, target) =>
    am5.color(
      (target.dataItem?.get("valueY") ?? 0) <= 0 ? "#10D4A0" : "#F87171",
    ),
  );

  xAxis.data.setAll(chartData);
  series.data.setAll(chartData);
  series.appear(1000);
  chart.appear(1000, 100);
}

/** Renderöi mittaushistoria-taulukon uusimmasta vanhimpaan */
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
        <td><span class="status-badge status-${level}">${text}</span></td>
      </tr>`;
  });
}

/**
 * Vaihtaa aikavälin (7/14/30 päivää) ja lataa trendit uudelleen.
 * Kutsutaan suoraan HTML:stä onclick-attribuutilla.
 */
function selectPeriod(days, btn) {
  document
    .querySelectorAll(".period-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  loadTrends(days);
}
window.selectPeriod = selectPeriod;

/** Hakee trendidata ja renderöi kaikki kaaviot ja tilastot */
async function loadTrends(days) {
  try {
    destroyCharts();
    const data = await getAnalysisTrend(days);
    if (!data?.length) return;

    renderStatCards(data);
    renderTrendChart(data);
    renderPnsChart(data);
    renderSnsChart(data);
    renderHistoryTable(data);
  } catch (err) {
    console.error("Trendien lataus epäonnistui:", err);
  }
}

/** Tarkistaa kirjautumisen — ohjaa kirjautumissivulle jos token puuttuu */
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "/index.html";
}

/** Alustaa trendit-sivun */
async function init() {
  checkAuth();
  renderSidebar("trends");
  await loadTrends(7);
}

init();
