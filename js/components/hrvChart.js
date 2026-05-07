// js/components/hrvChart.js

let hrvChartRoot = null;

export function renderHrvNightChart(canvasId, timevarying) {
  const el = document.getElementById(canvasId);
  if (!el) return;

  if (hrvChartRoot) {
    hrvChartRoot.dispose();
    hrvChartRoot = null;
  }

  const rawLabels = timevarying?.labels ?? [];
  const hrData = timevarying?.hr ?? [];
  const rmssdData = timevarying?.rmssd ?? [];

  // Laske tilastot
  const validHr = hrData.filter((v) => v != null && !isNaN(v));
  const avgHr = validHr.length
    ? Math.round(validHr.reduce((a, b) => a + b, 0) / validHr.length)
    : null;
  const minHr = validHr.length ? Math.round(Math.min(...validHr)) : null;
  const maxHr = validHr.length ? Math.round(Math.max(...validHr)) : null;
  const validRmssd = rmssdData.filter((v) => v != null && !isNaN(v));
  const avgRmssd = validRmssd.length
    ? Math.round(validRmssd.reduce((a, b) => a + b, 0) / validRmssd.length)
    : null;

  // Päivitä tilastokortit jos elementit löytyvät
  const statAvgHr = document.getElementById("statAvgHr");
  const statMinHr = document.getElementById("statMinHr");
  const statMaxHr = document.getElementById("statMaxHr");
  const statAvgRmssd = document.getElementById("statAvgRmssd");
  if (statAvgHr) statAvgHr.textContent = avgHr ? avgHr + " bpm" : "–";
  if (statMinHr) statMinHr.textContent = minHr ? minHr + " bpm" : "–";
  if (statMaxHr) statMaxHr.textContent = maxHr ? maxHr + " bpm" : "–";
  if (statAvgRmssd)
    statAvgRmssd.textContent = avgRmssd ? avgRmssd + " ms" : "–";

  // Näytteistä data jos liikaa pisteitä
  const MAX_POINTS = 600;
  const step =
    rawLabels.length > MAX_POINTS
      ? Math.floor(rawLabels.length / MAX_POINTS)
      : 1;

  const sampledLabels = rawLabels.filter((_, i) => i % step === 0);
  const sampledHr = hrData.filter((_, i) => i % step === 0);
  const sampledRmssd = rmssdData.filter((_, i) => i % step === 0);

  const startTime = timevarying.recorded_at
    ? new Date(timevarying.recorded_at).getTime()
    : null;

  // Muunna sekunnit kellonaikaan
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
      hr: sampledHr[i] ?? null,
      rmssd: sampledRmssd[i] ?? null,
    };
  });

  const root = am5.Root.new(canvasId);
  hrvChartRoot = root;
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

  // X-akseli
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

  // Y-akseli (vain yksi)
  const yAxisHr = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      extraMax: 0.15,
      extraMin: 0.1,
    }),
  );

  yAxisHr.children.unshift(
    am5.Label.new(root, {
      text: "Syke (bpm)",
      rotation: -90,
      y: am5.percent(50),
      centerX: am5.percent(50),
      fontSize: 11,
      fill: am5.color("#8A9BB0"),
    }),
  );

  // Vain syke-sarja
  const hrSeries = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: "Syke",
      xAxis,
      yAxis: yAxisHr,
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

  // Legenda
  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 8,
    }),
  );
  legend.data.setAll(chart.series.values);

  xAxis.data.setAll(data);
  hrSeries.data.setAll(data);

  hrSeries.appear(1000);
  chart.appear(1000, 100);
}
