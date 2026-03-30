// js/services/analysisService.js
import api from "../api/client.js";
import { mockAnalysis, mockTrend } from "../data/mockData.js";

export const USE_MOCK = false;

// Muunna Kubios-data dashboard-formaattiin
function mapKubiosResult(result) {
  const r = result.result;
  return {
    readiness: r.readiness ?? 0,
    rmssd_ms: r.rmssd_ms ?? 0,
    sdnn_ms: r.sdnn_ms ?? 0,
    pns_index: r.pns_index ?? 0,
    sns_index: r.sns_index ?? 0,
    stress_index: r.stress_index ?? 0,
    mean_hr_bpm: r.mean_hr_bpm ?? 0,
    artefact_level: r.artefact_level ?? "GOOD",
    sd1_ms: r.sd1_ms ?? 0,
    sd2_ms: r.sd2_ms ?? 0,
    sleep_duration_h: null,
    recorded_at: result.create_timestamp,
    timevarying_data: null,
    sleep_stages: null,
  };
}

export async function syncFromKubios() {
  // Ei tarvita — haetaan suoraan Kubios-reitistä
}

export async function syncTimevarying() {
  // Ei tarvita vielä
}

export async function getLatestAnalysis() {
  if (USE_MOCK) return mockAnalysis;
  try {
    const res = await api.get("/api/kubios/user-data");
    const results = res.data.results ?? [];
    if (results.length === 0) return mockAnalysis;

    // Järjestä uusimmasta vanhimpaan ja ota ensimmäinen
    results.sort(
      (a, b) => new Date(b.create_timestamp) - new Date(a.create_timestamp),
    );
    return mapKubiosResult(results[0]);
  } catch (err) {
    console.warn("Kubios-haku epäonnistui, käytetään mock-dataa:", err.message);
    return mockAnalysis;
  }
}

export async function getAnalysisTrend(days = 7) {
  if (USE_MOCK) return mockTrend;
  try {
    const res = await api.get("/api/kubios/user-data");
    const results = res.data.results ?? [];
    if (results.length === 0) return mockTrend;

    // Järjestä vanhimmasta uusimpaan trendiä varten
    results.sort(
      (a, b) => new Date(a.create_timestamp) - new Date(b.create_timestamp),
    );

    // Suodata viimeisen N päivän tulokset
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return results
      .filter((r) => new Date(r.create_timestamp) >= cutoff)
      .map((r) => ({
        readiness: r.result.readiness ?? 0,
        rmssd_ms: r.result.rmssd_ms ?? 0,
        stress_index: r.result.stress_index ?? 0,
        pns_index: r.result.pns_index ?? 0,
        sns_index: r.result.sns_index ?? 0,
        created_at: r.create_timestamp,
      }));
  } catch (err) {
    console.warn(
      "Kubios-trendit epäonnistui, käytetään mock-dataa:",
      err.message,
    );
    return mockTrend;
  }
}
