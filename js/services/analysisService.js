// js/services/analysisService.js
import api from "../api/client.js";

// Vaihda false -> true kun backend on valmis
const USE_MOCK = true;
// kun backend on valmis: const USE_MOCK = false;

const mockAnalysis = {
  readiness: 85,
  sleep_duration: 7.5,
  rmssd_ms: 68,
  recovery_pct: 88,
  stress_index: 6.4,
  pns_index: 0.75,
  sns_index: -1.02,
  artefact_level: "GOOD",
  timevarying: {
    labels: [
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
    ],
    rmssd: [44, 52, 61, 70, 78, 75, 68, 60, 55, 50],
  },
  sleep_stages: {
    labels: [
      "22:00",
      "23:00",
      "00:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
      "06:00",
    ],
    deep: [0, 25, 45, 50, 35, 40, 45, 30, 20],
    light: [40, 30, 20, 15, 30, 25, 20, 35, 45],
    rem: [10, 20, 25, 20, 25, 20, 25, 30, 25],
    awake: [5, 10, 5, 5, 5, 5, 5, 5, 10],
  },
};

const mockTrend = {
  labels: [
    "Ma 9.3",
    "Ti 10.3",
    "Ke 11.3",
    "To 12.3",
    "Pe 13.3",
    "La 14.3",
    "Su 15.3",
  ],
  rmssd: [55, 58, 52, 65, 70, 62, 68],
  stress: [8.2, 7.5, 9.0, 6.8, 5.9, 7.2, 6.4],
  heartrate: [62, 60, 64, 58, 56, 61, 58],
};

export async function getLatestAnalysis() {
  if (USE_MOCK) return mockAnalysis;
  const res = await api.get("/api/analysis/latest");
  return res.data;
}

export async function getAnalysisTrend(days = 7) {
  if (USE_MOCK) return mockTrend;
  const res = await api.get(`/api/analysis/trend?days=${days}`);
  return res.data;
}
