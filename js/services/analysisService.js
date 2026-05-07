// js/services/analysisService.js
// Vastaa kaiken HRV- ja päiväkirjadatan hakemisesta backendiltä.
// Kaikki Kubios-data haetaan suoraan Kubios Cloud -pilvestä backendin kautta.

import api from "../api/client.js";
import { mockAnalysis, mockTrend } from "../data/mockData.js";

// Aseta true käyttääksesi mock-dataa ilman backendiä
export const USE_MOCK = false;

/**
 * Muuntaa Kubios Cloud -tuloksen sovelluksen sisäiseen formaattiin.
 * Kubios palauttaa tulokset result-objektin sisällä — tämä funktio
 * litistää rakenteen ja asettaa oletusarvot puuttuville kentille.
 *
 * @param {Object} result - Kubios-tuloksen yksittäinen rivi (results[])
 * @returns {Object} Sovelluksen käyttämä analyysi-objekti
 */
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
    sleep_duration_h: null, // lasketaan timevarying-datasta dashboard.js:ssä
    recorded_at: result.create_timestamp,
    timevarying_data: null, // haetaan erikseen getTimevaryingData():lla
    sleep_stages: null, // vaatii kiihtyvyysanturidatan — ei toteutettu
  };
}

// Tyhjät stub-funktiot — synkronointi tapahtuu automaattisesti backendillä
export async function syncFromKubios() {}
export async function syncTimevarying() {}

/**
 * Hakee viimeisimmän time-varying HRV-analyysin omasta tietokannasta.
 * Data on tallennettu sinne kun Elsi on kirjautunut sovellukseen.
 *
 * @returns {Object|null} Time-varying data tai null jos ei saatavilla
 */
export async function getTimevaryingData() {
  if (USE_MOCK) return null;
  try {
    const res = await api.get("/api/kubios/timevarying");
    return res.data;
  } catch (err) {
    console.warn("Timevarying haku epäonnistui:", err.message);
    return null;
  }
}

/**
 * Hakee viimeisimmän HRV-analyysin suoraan Kubios Cloud -pilvestä.
 * Järjestää tulokset uusimmasta vanhimpaan ja palauttaa ensimmäisen.
 *
 * @returns {Object} Analyysi-objekti tai mock-data jos haku epäonnistuu
 */
export async function getLatestAnalysis() {
  if (USE_MOCK) return mockAnalysis;
  try {
    const res = await api.get("/api/kubios/user-data");
    const results = res.data.results ?? [];
    if (results.length === 0) return mockAnalysis;

    results.sort(
      (a, b) => new Date(b.create_timestamp) - new Date(a.create_timestamp),
    );
    return mapKubiosResult(results[0]);
  } catch (err) {
    console.warn("Kubios-haku epäonnistui, käytetään mock-dataa:", err.message);
    return mockAnalysis;
  }
}

/**
 * Hakee HRV-trendidata viimeiseltä N päivältä Kubios Cloud -pilvestä.
 * Käytetään trendit-sivun kaavioissa ja tilastokorteissa.
 *
 * @param {number} days - Haettava aikaväli päivinä (7, 14 tai 30)
 * @returns {Array} Lista analyysi-objekteista vanhimmasta uusimpaan
 */
export async function getAnalysisTrend(days = 7) {
  if (USE_MOCK) return mockTrend;
  try {
    const res = await api.get("/api/kubios/user-data");
    const results = res.data.results ?? [];
    if (results.length === 0) return mockTrend;

    // Järjestä vanhimmasta uusimpaan trendikaavioita varten
    results.sort(
      (a, b) => new Date(a.create_timestamp) - new Date(b.create_timestamp),
    );

    // Suodata valitun aikavälin ulkopuoliset tulokset pois
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

/**
 * Hakee viimeisimmän päiväkirjamerkinnän omasta tietokannasta.
 * Näytetään dashboardin "Viimeisin merkintä" -kortissa.
 *
 * @returns {Object|null} Päiväkirjamerkintä tai null jos ei merkintöjä
 */
export async function getLatestDiaryEntry() {
  if (USE_MOCK) return null;
  try {
    const res = await api.get("/api/diary");
    const entries = res.data.entries ?? [];
    return entries.length > 0 ? entries[0] : null; // backend palauttaa uusimman ensin
  } catch (err) {
    console.warn("Päiväkirja haku epäonnistui:", err.message);
    return null;
  }
}
