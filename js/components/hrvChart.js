// js/components/hrvChart.js

let hrvChartRoot = null;

export function renderHrvNightChart(canvasId, timevarying) {
    const el = document.getElementById(canvasId);
    if (!el) return;

    // Tuhoa vanha kaavio
    if (hrvChartRoot) {
        hrvChartRoot.dispose();
        hrvChartRoot = null;
    }

    const rawLabels = timevarying?.labels ?? [];
    const hrData    = timevarying?.hr     ?? [];
    const rmssd     = timevarying?.rmssd  ?? [];

    // Valitse oikea datasetti
    const values = hrData.length === rawLabels.length ? hrData :
                   rmssd.length  === rawLabels.length ? rmssd  :
                   hrData;

    // Muunna sekunnit mm:ss
    const data = rawLabels.map((t, i) => {
        const totalSec = Math.round(t);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return {
            time:  `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`,
            value: values[i] ?? 0
        };
    });

    // Luo amCharts
    const root = am5.Root.new(canvasId);
    hrvChartRoot = root;

    root.setThemes([
        am5themes_Animated.new(root),
        am5themes_Dark.new(root)
    ]);

    const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: true,
            panY: false,
            wheelX: 'panX',
            wheelY: 'zoomX',
            paddingLeft: 0,
            paddingRight: 0
        })
    );

    // Kursori
    const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
        behavior: 'none'
    }));
    cursor.lineY.set('visible', false);

    // X-akseli
    const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: 'time',
            renderer: am5xy.AxisRendererX.new(root, {
                minGridDistance: 60
            }),
            tooltip: am5.Tooltip.new(root, {})
        })
    );

    // Y-akseli
    const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {}),
            extraMax: 0.1
        })
    );

    // Sarja
    const series = chart.series.push(
        am5xy.LineSeries.new(root, {
            xAxis,
            yAxis,
            valueYField:    'value',
            categoryXField: 'time',
            stroke: am5.color('#10D4A0'),
            fill:   am5.color('#10D4A0'),
            tooltip: am5.Tooltip.new(root, {
                labelText: '{valueY} bpm'
            })
        })
    );

    series.strokes.template.setAll({ strokeWidth: 2 });

    // Täyttö alle
    series.fills.template.setAll({
        fillOpacity: 0.1,
        visible: true
    });

    // Ei pisteitä (paljon dataa)
    series.bullets.clear();

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
}