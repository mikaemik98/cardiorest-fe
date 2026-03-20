// js/components/hrvChart.js

export function renderHrvNightChart(canvasId, timevarying) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const rawLabels = timevarying?.labels ?? [];
    const hrData    = timevarying?.hr     ?? [];
    const rmssd     = timevarying?.rmssd  ?? [];

    // Valitse oikea datasetti pituuden perusteella
    const data = hrData.length === rawLabels.length ? hrData :
                 rmssd.length  === rawLabels.length ? rmssd  :
                 hrData;

    // Muunna sekunnit minuuteiksi ja sekunneiksi
    const formattedLabels = rawLabels.map(t => {
        const totalSec = Math.round(t);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    });

    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedLabels,
            datasets: [{
                label: 'Syke (bpm)',
                data,
                borderColor: '#10D4A0',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: 'rgba(16,212,160,0.1)',
                tension: 0.45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { maxTicksLimit: 10, maxRotation: 0 }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { callback: v => v + ' bpm' }
                }
            }
        }
    });
}
