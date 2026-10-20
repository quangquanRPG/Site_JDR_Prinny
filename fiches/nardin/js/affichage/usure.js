/* ================================================================
   AFFICHAGE — armure divine : usure de la Protection
   ================================================================ */
"use strict";

// Armure divine : état de l'usure (et bouton du MJ) sous la jauge de Protection
function afficherUsure(carte, fiche, u) {
  if (!armureDivine(fiche)) return;
  const sUse = protectionSUse(fiche);
  const zone = document.createElement("div");
  zone.className = "usure" + (sUse ? " active" : "");
  zone.innerHTML = `<span>✦ Armure divine (valeur ${valeurArmure(fiche)}) :
      ${sUse ? "usure autorisée par le MJ" : `la Protection ne s'use pas, dégâts ÷ ${VALEUR_DIVINE}`}</span>
    ${droits.autoriserUsure(u) ? `<button class="btn usure-btn">${sUse ? "Bloquer l'usure" : "Autoriser l'usure"}</button>` : ""}`;
  zone.querySelector(".usure-btn")?.addEventListener("click", () => { basculerUsure(fiche, u); rafraichir(); });
  carte.appendChild(zone);
}
