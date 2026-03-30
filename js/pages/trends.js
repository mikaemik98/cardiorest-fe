import { getAnalysisTrend } from "../services/analysisService.js";
import { renderSidebar } from "../components/sidebar.js";
import {
  formatDate,
  getRecoveryLevel,
  getRecoveryText,
  round,
  average,
} from "../utils/helpers.js";

// ── Vaihdettu Chart.js → amCharts root-objektit ──
let trendRoot = null;
let pnsRoot = null;
let snsRoot = null;

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
  grid: "rgba(255,255,255,0.04)",
};

// ── Apufunktiot ensin ──

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

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "none",
    }),
  );
  cursor.lineY.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40,
      }),
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  );

  xAxis.data.setAll(chartData);

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
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
    }),
  );
  legend.data.setAll(chart.series.values);

  chart.appear(1000, 100);
}

function renderPnsChart(data) {
  const el = document.getElementById("pnsChart");
  if (!el) return;

  const chartData = data.map((d) => ({
    date: formatDate(d.created_at),
    value: round(d.pns_index ?? 0, 2),
  }));

  const root = am5.Root.new("pnsChart");
  pnsRoot = root;

  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      paddingLeft: 0,
      paddingRight: 0,
    }),
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "PNS: {valueY}",
      }),
    }),
  );

  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    strokeOpacity: 0,
  });

  // Väri positiivinen/negatiivinen
  series.columns.template.adapters.add("fill", (fill, target) => {
    const val = target.dataItem?.get("valueY") ?? 0;
    return am5.color(val >= 0 ? "#10D4A0" : "#F87171");
  });

  xAxis.data.setAll(chartData);
  series.data.setAll(chartData);
  series.appear(1000);
  chart.appear(1000, 100);
}

function renderSnsChart(data) {
  const el = document.getElementById("snsChart");
  if (!el) return;

  const chartData = data.map((d) => ({
    date: formatDate(d.created_at),
    value: round(d.sns_index ?? 0, 2),
  }));

  const root = am5.Root.new("snsChart");
  snsRoot = root;

  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      paddingLeft: 0,
      paddingRight: 0,
    }),
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }),
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "SNS: {valueY}",
      }),
    }),
  );

  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    strokeOpacity: 0,
  });

  series.columns.template.adapters.add("fill", (fill, target) => {
    const val = target.dataItem?.get("valueY") ?? 0;
    return am5.color(val <= 0 ? "#10D4A0" : "#F87171");
  });

  xAxis.data.setAll(chartData);
  series.data.setAll(chartData);
  series.appear(1000);
  chart.appear(1000, 100);
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

// Tarkista että käyttäjä on kirjautunut
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index.html";
  }
}

async function init() {
  checkAuth();
  renderSidebar("trends");

  const periodSelect = document.getElementById("periodSelect");
  periodSelect?.addEventListener("change", (e) => {
    loadTrends(parseInt(e.target.value));
  });

  await loadTrends(7);
}

init();
