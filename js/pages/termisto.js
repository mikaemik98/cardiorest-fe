// js/pages/termisto.js
// Sama rakenne kuin muissa sivuissa – lisää vain sidebar + hamburger

import { renderSidebar } from '../components/sidebar.js';

renderSidebar('termisto');
  // 'termisto' = aktiivinen nav-kohta

// Hamburger (sama logiikka kuin muissa sivuissa)
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('sidebarOverlay');

hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
});
overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
});

// ────────────────────────────────────────────────────────────────────
// TOOLTIP "LUE LISÄÄ" -LAAJENNUS
// ────────────────────────────────────────────────────────────────────
// Lisää tämä koodi KAIKKIIN sivuihin (tai yhteiseen init-funktioon).
// Se etsii kaikki .tooltip-wrap -elementit joilla on data-term-id
// ja lisää niihin "Lue lisää →" -linkin tooltip-boxin loppuun.
//
// HTML-esimerkki muissa sivuissa (esim. yhteenveto.html):
//
//   <span class="tooltip-wrap" data-term-id="rmssd">
//       <span class="data-label">Sykevälivaihtelu</span>
//       <span class="tooltip-icon">?</span>
//       <span class="tooltip-box">
//           Peräkkäisten sydämenlyöntien välinen aikaero.
//       </span>
//   </span>
//
// Kun data-term-id on asetettu, tooltip saa automaattisesti "Lue lisää →"
// -linkin joka vie /termisto.html#rmssd -ankkuriin.
// ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    addReadMoreLinks();
});

export function addReadMoreLinks() {
    document.querySelectorAll('.tooltip-wrap[data-term-id]').forEach(wrap => {
        const termId  = wrap.dataset.termId;
        const box     = wrap.querySelector('.tooltip-box');
        if (!box || box.querySelector('.tooltip-read-more')) return; // ei duplikaatteja

        const link = document.createElement('a');
        link.href      = `/termisto.html#${termId}`;
        link.className = 'tooltip-read-more';
        link.textContent = 'Lue lisää →';
        box.appendChild(link);

        // Tooltip-boxin pointer-events pitää olla auto jotta linkki toimii
        box.style.pointerEvents = 'auto';
    });
}