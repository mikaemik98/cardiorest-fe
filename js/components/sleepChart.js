// js/components/sleepChart.js

export function renderSleepStagesChart(canvasId, sleepStages) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = sleepStages?.labels ?? ['22:00','23:00','00:00','01:00','02:00','03:00','04:00','05:00','06:00'];
    const deep   = sleepStages?.deep   ?? [0, 25, 45, 50, 35, 40, 45, 30, 20];
    const light  = sleepStages?.light  ?? [40, 30, 20, 15, 30, 25, 20, 35, 45];
    const rem    = sleepStages?.rem    ?? [10, 20, 25, 20, 25, 20, 25, 30, 25];
    const awake  = sleepStages?.awake  ?? [5, 10, 5, 5, 5, 5, 5, 5, 10];

    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Syvä uni',  data: deep,  backgroundColor: '#1a5fb4', stack: 's' },
                { label: 'Kevyt uni', data: light, backgroundColor: '#4a90d9', stack: 's' },
                { label: 'REM-uni',   data: rem,   backgroundColor: '#c061cb', stack: 's' },
                { label: 'Hereillä',  data: awake, backgroundColor: '#e66100', stack: 's' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    });
}