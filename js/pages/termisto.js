// js/pages/termisto.js
// Sama rakenne kuin muissa sivuissa – lisää vain sidebar + hamburger

import { renderSidebar } from "../components/sidebar.js";

renderSidebar("termisto");

// Tooltip "Lue lisää" -laajennus
document.addEventListener("DOMContentLoaded", () => {
  addReadMoreLinks();
});

export function addReadMoreLinks() {
  document.querySelectorAll(".tooltip-wrap[data-term-id]").forEach((wrap) => {
    const termId = wrap.dataset.termId;
    const box = wrap.querySelector(".tooltip-box");
    if (!box || box.querySelector(".tooltip-read-more")) return;

    const link = document.createElement("a");
    link.href = `/termisto.html#${termId}`;
    link.className = "tooltip-read-more";
    link.textContent = "Lue lisää →";
    box.appendChild(link);
    box.style.pointerEvents = "auto";
  });
}
