import {
  getLatestAnalysis,
  getAnalysisTrend,
  getTimevaryingData
} from "../services/analysisService.js";
import { renderHrvNightChart } from "../components/hrvChart.js";
import { renderSleepStagesChart } from "../components/sleepChart.js";
import { renderSidebar } from "../components/sidebar.js";
import { getRecoveryText, getRecoveryLevel } from "../utils/helpers.js";

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
    getRecoveryText(readiness);
  document.getElementById("metricDuration").textContent = data.sleep_duration_h
    ? data.sleep_duration_h + "h"
    : "-";
  document.getElementById("metricHrv").textContent = rmssd.toFixed(1) + " ms";
  document.getElementById("metricRecovery").textContent =
    Math.round(readiness) + "%";
  document.getElementById("dateLabel").textContent = data.recorded_at
    ? new Date(data.recorded_at).toLocaleDateString("fi-FI")
    : new Date().toLocaleDateString("fi-FI");

  // Päivitetyt käyttäjäystävälliset labelit
  const lblDuration =
    document.getElementById("metricDuration")?.nextElementSibling;
  const lblHrv = document.getElementById("metricHrv")?.nextElementSibling;
  const lblRecovery =
    document.getElementById("metricRecovery")?.nextElementSibling;
  if (lblDuration) lblDuration.textContent = "Unen kesto";
  if (lblHrv) lblHrv.textContent = "Sykevälivaihtelu";
  if (lblRecovery) lblRecovery.textContent = "Palautuminen";

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

  const recoveryEl = document.getElementById("metricRecovery");
  if (recoveryEl) {
    recoveryEl.style.color =
      readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171";
  }
}

let currentData = null;

let miniTrendRoot = null;

function renderMiniTrend(trendData) {
  const el = document.getElementById("miniTrendChart");
  if (!el) return;

  // Näytä viesti jos dataa liian vähän
  if (!trendData || trendData.length < 3) {
    el.innerHTML = `
            <div style="
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:8px;
                color:var(--muted);
                text-align:center;
                padding:20px
            ">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5" opacity="0.4">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
                <div style="font-size:13px;font-weight:600;color:var(--text);opacity:0.6">
                    Ei tarpeeksi dataa
                </div>
                <div style="font-size:13px;opacity:0.5;line-height:1.5">
                    Tee vähintään 3 mittausta<br>nähdäksesi kehityskaavion
                </div>
            </div>
        `;
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

  // Poista amCharts logo
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

  // Ei zoomia eikä kursoria
  chart.zoomOutButton.set("forceHidden", true);

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "none",
    }),
  );
  cursor.lineX.set("visible", false);
  cursor.lineY.set("visible", false);

  // X-akseli
  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
  });
  xRenderer.grid.template.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: xRenderer,
    }),
  );

  // Y-akseli
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

  // Sarja
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

  series.fills.template.setAll({
    fillOpacity: 0.15,
    visible: true,
  });

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

function updateMeters(data) {
  const readiness = data.readiness ?? 0;
  const pns = data.pns_index ?? 0;
  const stress = data.stress_index ?? 0;
  const quality = data.artefact_level ?? "GOOD";

  // Arvot
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
  const readinessEl = document.getElementById("meterReadiness");
  if (readinessEl)
    readinessEl.style.color =
      readiness >= 70 ? "#10D4A0" : readiness >= 40 ? "#F59E0B" : "#F87171";

  const pnsEl = document.getElementById("meterPns");
  if (pnsEl) pnsEl.style.color = pns >= 0 ? "#10D4A0" : "#F87171";

  const stressEl = document.getElementById("meterStress");
  if (stressEl)
    stressEl.style.color =
      stress < 10 ? "#10D4A0" : stress < 15 ? "#F59E0B" : "#F87171";

  const qualityEl = document.getElementById("meterQuality");
  if (qualityEl)
    qualityEl.style.color =
      quality === "GOOD"
        ? "#10D4A0"
        : quality === "MODERATE"
          ? "#F59E0B"
          : "#F87171";

  // Laske ensin
  const pnsPct = Math.min(Math.max(((pns + 3) / 6) * 100, 0), 100);
  const stressPct = Math.min((stress / 20) * 100, 100);

  // Palkit + värit
  const readinessFill = document.getElementById("meterReadinessFill");
  if (readinessFill) {
    readinessFill.style.width = Math.round(readiness) + "%";
    readinessFill.style.background =
      readiness >= 70
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : readiness >= 40
          ? "linear-gradient(90deg, #B45309, #F59E0B)"
          : "linear-gradient(90deg, #B91C1C, #F87171)";
  }

  const pnsFill = document.getElementById("meterPnsFill");
  if (pnsFill) {
    pnsFill.style.width = pnsPct + "%";
    pnsFill.style.background =
      pns >= 0
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : "linear-gradient(90deg, #B91C1C, #F87171)";
  }

  const stressFill = document.getElementById("meterStressFill");
  if (stressFill) {
    stressFill.style.width = stressPct + "%";
    stressFill.style.background =
      stress < 10
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : stress < 15
          ? "linear-gradient(90deg, #B45309, #F59E0B)"
          : "linear-gradient(90deg, #B91C1C, #F87171)";
  }

  const qualityFill = document.getElementById("meterQualityFill");
  if (qualityFill) {
    qualityFill.style.width =
      quality === "GOOD" ? "90%" : quality === "MODERATE" ? "55%" : "25%";
    qualityFill.style.background =
      quality === "GOOD"
        ? "linear-gradient(90deg, #0A8A68, #10D4A0)"
        : quality === "MODERATE"
          ? "linear-gradient(90deg, #B45309, #F59E0B)"
          : "linear-gradient(90deg, #B91C1C, #F87171)";
  }
}

async function switchView(view) {
  document
    .getElementById("tabReadiness")
    ?.classList.toggle("active", view === "readiness");
  document
    .getElementById("tabTimevarying")
    ?.classList.toggle("active", view === "timevarying");

  const readinessCharts = document.getElementById("readinessCharts");
  const hrvCard = document.getElementById("hrvChartCard");
  const sleepCard = document.getElementById("sleepChartCard");

  if (view === "readiness") {
    if (readinessCharts) readinessCharts.style.display = "grid";
    if (hrvCard) hrvCard.style.display = "none";
    if (sleepCard) sleepCard.style.display = "none";

    if (currentData) {
      updateScoreCard(currentData);
      renderRecommendations(currentData.readiness);
    }
  } else if (view === "timevarying") {
    if (readinessCharts) readinessCharts.style.display = "none";
    if (hrvCard) hrvCard.style.display = "block";
    if (sleepCard) sleepCard.style.display = "block";

    try {
        const tvData = await getTimevaryingData();

        if (tvData?.timevarying) {
            const tv = tvData.timevarying;
            const avgHr = tv.hr?.length
                ? Math.round(tv.hr.reduce((a, b) => a + b, 0) / tv.hr.length)
                : null;
            const maxHr = tv.hr?.length ? Math.round(Math.max(...tv.hr)) : null;
            const minHr = tv.hr?.length ? Math.round(Math.min(...tv.hr)) : null;

            document.getElementById("scoreVal").textContent = avgHr ?? "–";
            document.getElementById("scoreRating").textContent = "Yönaikainen analyysi";
            document.getElementById("metricDuration").textContent = minHr ? minHr + " bpm" : "–";
            document.getElementById("metricHrv").textContent = avgHr ? avgHr + " bpm" : "–";
            document.getElementById("metricRecovery").textContent = maxHr ? maxHr + " bpm" : "–";

            const lblDuration = document.getElementById("metricDuration")?.nextElementSibling;
            const lblHrv      = document.getElementById("metricHrv")?.nextElementSibling;
            const lblRecovery = document.getElementById("metricRecovery")?.nextElementSibling;
            if (lblDuration) lblDuration.textContent = "Alin syke";
            if (lblHrv)      lblHrv.textContent      = "Keskisyke";
            if (lblRecovery) lblRecovery.textContent  = "Korkein syke";

            const arc = document.getElementById("scoreArc");
            if (arc && avgHr) {
                const circumference = 2 * Math.PI * 46;
                const pct = Math.min((avgHr - 40) / 60, 1);
                arc.style.strokeDasharray  = circumference;
                arc.style.strokeDashoffset = circumference - pct * circumference;
                arc.setAttribute("stroke", "#60A5FA");
            }

            const scoreValEl = document.getElementById("scoreVal");
            if (scoreValEl) scoreValEl.style.color = "#60A5FA";

            renderHrvNightChart("hrvNightChart", { labels: tv.labels, hr: tv.hr });
            renderSleepStagesChart("sleepStagesChart", null);

        } else {
            if (hrvCard) hrvCard.innerHTML = `
                <div class="card-header">
                    <span class="card-title">Yönaikainen sykedata</span>
                </div>
                <div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">
                    Ei HRV-aikasarjadataa saatavilla.
                </div>`;
        }
    } catch (err) {
        console.error('Timevarying haku epäonnistui:', err);
    }
  }
}
window.switchView = switchView;

// Tarkista että käyttäjä on kirjautunut
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index.html";
  }
}

async function init() {
  checkAuth();
  renderSidebar("dashboard");

  try {
    document.getElementById("scoreRating").textContent = "Ladataan...";

    const [data, trendData] = await Promise.all([
      getLatestAnalysis(),
      getAnalysisTrend(7),
    ]);

    currentData = data;

    updateScoreCard(data);
    updateMeters(data);
    renderRecommendations(data.readiness);
    renderMiniTrend(trendData);

    const hrvCard = document.getElementById("hrvChartCard");
    if (hrvCard) hrvCard.style.display = "none";
  } catch (err) {
    console.error("Virhe:", err);
    document.getElementById("scoreRating").textContent =
      "Analyysiä ei saatavilla";
  }
}

init();
