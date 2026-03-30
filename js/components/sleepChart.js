// js/components/sleepChart.js

let sleepChartRoot = null;

export function renderSleepStagesChart(canvasId, sleepStages) {
    const el = document.getElementById(canvasId);
    if (!el) return;

    if (sleepChartRoot) {
        sleepChartRoot.dispose();
        sleepChartRoot = null;
    }

    const labels = sleepStages?.labels ?? ['22:00','23:00','00:00','01:00','02:00','03:00','04:00','05:00','06:00'];
    const deep   = sleepStages?.deep   ?? [0, 25, 45, 50, 35, 40, 45, 30, 20];
    const light  = sleepStages?.light  ?? [40, 30, 20, 15, 30, 25, 20, 35, 45];
    const rem    = sleepStages?.rem    ?? [10, 20, 25, 20, 25, 20, 25, 30, 25];
    const awake  = sleepStages?.awake  ?? [5, 10, 5, 5, 5, 5, 5, 5, 10];

    // Muodosta data
    const data = labels.map((label, i) => ({
        label,
        deep:  deep[i]  ?? 0,
        light: light[i] ?? 0,
        rem:   rem[i]   ?? 0,
        awake: awake[i] ?? 0
    }));

    const root = am5.Root.new(canvasId);
    sleepChartRoot = root;

    root.setThemes([
        am5themes_Animated.new(root),
        am5themes_Dark.new(root)
    ]);

    const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            paddingLeft: 0,
            paddingRight: 0,
            layout: root.verticalLayout
        })
    );

    // X-akseli
    const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: 'label',
            renderer: am5xy.AxisRendererX.new(root, {
                minGridDistance: 20,
                cellStartLocation: 0.1,
                cellEndLocation:   0.9
            })
        })
    );

    // Y-akseli
    const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
        min:          0,
        max:          60,
        strictMinMax: true,
        renderer:     am5xy.AxisRendererY.new(root, {}),
        numberFormat: "#'min'"
    })
);

    // Apufunktio sarjan luontiin
    function createSeries(name, field, color) {
        const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name,
                xAxis,
                yAxis,
                valueYField:    field,
                categoryXField: 'label',
                stacked:        true,
                fill:   am5.color(color),
                stroke: am5.color(color),
                tooltip: am5.Tooltip.new(root, {
                    labelText: '{name}: {valueY} min'
                })
            })
        );

        series.columns.template.setAll({
            cornerRadiusTL: 0,
            cornerRadiusTR: 0,
            strokeOpacity:  0
        });

        series.data.setAll(data);
        series.appear(1000);
        return series;
    }

    createSeries('Syvä uni',  'deep',  '#1a5fb4');
    createSeries('Kevyt uni', 'light', '#4a90d9');
    createSeries('REM-uni',   'rem',   '#c061cb');
    createSeries('Hereillä',  'awake', '#e66100');

    xAxis.data.setAll(data);
    chart.appear(1000, 100);
}