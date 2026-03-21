// js/utils/helpers.js

export function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString("fi-FI");
  return new Date(dateStr).toLocaleDateString("fi-FI");
}

export function getRecoveryLevel(readiness) {
  if (readiness >= 70) return "good";
  if (readiness >= 40) return "moderate";
  return "poor";
}

export function getRecoveryText(readiness) {
  if (readiness >= 70) return "Erinomainen";
  if (readiness >= 40) return "Kohtalainen";
  return "Heikko";
}

export function secondsToTime(seconds) {
  const totalSec = Math.round(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function average(arr) {
  if (!arr?.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function round(num, decimals = 1) {
  if (num === null || num === undefined) return 0;
  return Number(Number(num).toFixed(decimals));
}
