// js/utils/helpers.js
// Yleiset apufunktiot jotka ovat käytössä useilla sivuilla

/**
 * Muuntaa päivämäärämerkkijonon suomalaiseen muotoon (pp.kk.vvvv).
 * Palauttaa tämän päivän päivämäärän jos syöte on tyhjä.
 *
 * @param {string|null} dateStr - ISO-muotoinen päivämäärämerkkijono
 * @returns {string} Suomalainen päivämäärä (esim. "7.5.2026")
 */
export function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString("fi-FI");
  return new Date(dateStr).toLocaleDateString("fi-FI");
}

/**
 * Palauttaa palautumistason CSS-luokan nimen readiness-pistemäärän perusteella.
 * Käytetään värikoodauksessa ja status-badgeissa.
 *
 * @param {number} readiness - Kubios-palautumispistemäärä (0–100)
 * @returns {"good"|"moderate"|"poor"}
 */
export function getRecoveryLevel(readiness) {
  if (readiness >= 70) return "good";
  if (readiness >= 40) return "moderate";
  return "poor";
}

/**
 * Palauttaa suomenkielisen palautumistason tekstin readiness-pistemäärän perusteella.
 * Näytetään score-kortissa ja mittaushistoriassa.
 *
 * @param {number} readiness - Kubios-palautumispistemäärä (0–100)
 * @returns {"Erinomainen"|"Kohtalainen"|"Heikko"}
 */
export function getRecoveryText(readiness) {
  if (readiness >= 70) return "Erinomainen";
  if (readiness >= 40) return "Kohtalainen";
  return "Heikko";
}

/**
 * Muuntaa sekunnit MM:SS-muotoiseksi aikajonoksi.
 * Käytetään HRV-aikasarjakaavion x-akselin aikaleimoissa.
 *
 * @param {number} seconds - Sekunnit mittauksen alusta
 * @returns {string} Aika muodossa "MM:SS" (esim. "05:30")
 */
export function secondsToTime(seconds) {
  const totalSec = Math.round(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Laskee numeroarrayn keskiarvon.
 * Palauttaa 0 jos array on tyhjä tai määrittelemätön.
 *
 * @param {number[]} arr - Numeroarray
 * @returns {number} Keskiarvo
 */
export function average(arr) {
  if (!arr?.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Pyöristää luvun haluttuun desimaalimäärään.
 * Palauttaa 0 jos syöte on null tai undefined.
 *
 * @param {number|null|undefined} num - Pyöristettävä luku
 * @param {number} decimals - Desimaalien määrä (oletus: 1)
 * @returns {number} Pyöristetty luku
 */
export function round(num, decimals = 1) {
  if (num === null || num === undefined) return 0;
  return Number(Number(num).toFixed(decimals));
}
