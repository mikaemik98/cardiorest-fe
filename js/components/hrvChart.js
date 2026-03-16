// js/components/hrvChart.js

export function renderHrvNightChart(canvasId, timevarying) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Jos oikeaa dataa ei ole vielä, käytetään testidataa
  const labels = timevarying?.labels ?? [
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
  ];
  const data = timevarying?.rmssd ?? [44, 52, 61, 70, 78, 75, 68, 60, 55, 50];

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "RMSSD (ms)",
          data,
          borderColor: "#10D4A0",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          backgroundColor: "rgba(16,212,160,0.1)",
          tension: 0.45,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.04)" } },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { callback: (v) => v + "ms" },
        },
      },
    },
  });
}

export function renderSleepStagesChart(canvasId, sleepStages) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

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

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Syvä uni",
          data: deep,
          backgroundColor: "#1a5fb4",
          stack: "s",
        },
        {
          label: "Kevyt uni",
          data: light,
          backgroundColor: "#4a90d9",
          stack: "s",
        },
        { label: "REM-uni", data: rem, backgroundColor: "#c061cb", stack: "s" },
        {
          label: "Hereillä",
          data: awake,
          backgroundColor: "#e66100",
          stack: "s",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" } },
        y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" } },
      },
    },
  });
}
