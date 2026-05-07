// js/components/sleepChart.js
// HUOM: Tämä komponentti käyttää tällä hetkellä mock-dataa.
// Oikea univaihedata vaatii kiihtyvyysanturidatan (Acc-kanava) Kubios-mittauksesta.

let sleepChartRoot = null;

/**
 * Renderöi univaihekaavion pinotuilla pylväillä (amCharts 5).
 * Näyttää syvän unen, kevyen unen, REM-unen ja hereillä oloajan
 * kellonajan mukaan ryhmiteltynä.
 *
 * @param {string} canvasId - HTML-elementin ID johon kaavio renderöidään
 * @param {Object|null} sleepStages - Univaihedata tai null (käyttää mock-dataa)
 * @param {string[]} sleepStages.labels - Kellonajat x-akselille
 * @param {number[]} sleepStages.deep   - Syvän unen minuutit per aikaväli
 * @param {number[]} sleepStages.light  - Kevyen unen minuutit per aikaväli
 * @param {number[]} sleepStages.rem    - REM-unen minuutit per aikaväli
 * @param {number[]} sleepStages.awake  - Hereillä olon minuutit per aikaväli
 */
export function renderSleepStagesChart(canvasId, sleepStages) {
  const el = document.getElementById(canvasId);
  if (!el) return;

  // Tuhoa vanha kaavio ennen uuden luontia
  if (sleepChartRoot) {
    sleepChartRoot.dispose();
    sleepChartRoot = null;
  }

  // Käytä oikeaa dataa tai mock-dataa jos ei saatavilla
  const labels = sleepStages?.labels ?? [
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
  ];
  const deep = sleepStages?.deep ?? [0, 25, 45, 50, 35, 40, 45, 30, 20];
  const light = sleepStages?.light ?? [40, 30, 20, 15, 30, 25, 20, 35, 45];
  const rem = sleepStages?.rem ?? [10, 20, 25, 20, 25, 20, 25, 30, 25];
  const awake = sleepStages?.awake ?? [5, 10, 5, 5, 5, 5, 5, 5, 10];

  // Muodosta amCharts-datarakenne
  const data = labels.map((label, i) => ({
    label,
    deep: deep[i] ?? 0,
    light: light[i] ?? 0,
    rem: rem[i] ?? 0,
    awake: awake[i] ?? 0,
  }));

  const root = am5.Root.new(canvasId);
  sleepChartRoot = root;
  root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 0,
      paddingRight: 0,
      layout: root.verticalLayout,
    }),
  );

  // X-akseli — kellonajat
  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "label",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
      }),
    }),
  );

  // Y-akseli — minuutit (0–60 min per aikaväli)
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 60,
      strictMinMax: true,
      renderer: am5xy.AxisRendererY.new(root, {}),
      numberFormat: "#'min'",
    }),
  );

  /**
   * Luo pinotun pylvässarjan univaiheelle
   * @param {string} name  - Sarjan nimi tooltipissä
   * @param {string} field - Datakentän nimi
   * @param {string} color - Hex-värikoodi
   */
  function createSeries(name, field, color) {
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: field,
        categoryXField: "label",
        stacked: true, // pinottuna edellisen päälle
        fill: am5.color(color),
        stroke: am5.color(color),
        tooltip: am5.Tooltip.new(root, { labelText: "{name}: {valueY} min" }),
      }),
    );
    series.columns.template.setAll({
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      strokeOpacity: 0,
    });
    series.data.setAll(data);
    series.appear(1000);
    return series;
  }

  // Luo sarjat univaiheiden väreillä
  createSeries("Syvä uni", "deep", "#1a5fb4"); // tummansininen
  createSeries("Kevyt uni", "light", "#4a90d9"); // vaaleansininen
  createSeries("REM-uni", "rem", "#c061cb"); // violetti
  createSeries("Hereillä", "awake", "#e66100"); // oranssi

  xAxis.data.setAll(data);
  chart.appear(1000, 100);
}
