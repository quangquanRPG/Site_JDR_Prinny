/* ================================================================
   AFFICHAGE — panneau « Réussite » (fiche ouverte seule)
   Dans le site, c'est la page parente qui l'affiche (voir integration/site.js).
   ================================================================ */
"use strict";

let reussiteEnEdition = false;

function afficherReussite(fiche, u) {
  const zone = document.getElementById("reussite");
  const peut = droits.modifierReussite(u);
  const r = etatReussite(fiche);
  const mieux = r.reussite < r.base, pire = r.reussite > r.base;
  const edition = reussiteEnEdition && peut;
  zone.innerHTML = `
    <div class="label">Réussite
      ${peut && !edition ? `<button class="btn-icone crayon" title="Changer le seuil de base (MJ)">✎</button>` : ""}</div>
    ${edition
      ? `<div class="seuil-edit"><input type="number" min="${SEUIL_MIN}" max="${SEUIL_MAX}" step="1" value="${r.base}"><b>+</b>
           <button class="btn-icone ok" title="Valider">✓</button><button class="btn-icone annuler" title="Annuler">✕</button></div>`
      : `<div class="seuil${mieux ? " mieux" : pire ? " pire" : ""}">${r.reussite}+</div>
         ${mieux || pire ? `<div class="seuil-base">au lieu de ${r.base}+</div>` : ""}`}
    <div class="faces">${[1, 2, 3, 4, 5, 6].map(f => `<span class="face ${f >= r.reussite ? "ok" : ""}">${f}</span>`).join("")}</div>
    <div class="chance"><b>${pourcent(r.chance)}</b> par dé</div>
    ${r.effort ? `<div class="effet-reussite">Effort : ${echap(r.effort)}</div>` : ""}
    ${r.fatigue ? `<div class="fatigue-reussite">Fatigue : ${r.fatigue}</div>` : ""}`;

  const fermer = () => { reussiteEnEdition = false; rafraichir(); };
  const valider = () => { modifierReussite(fiche, zone.querySelector("input").value, u); fermer(); };
  zone.querySelector(".crayon")?.addEventListener("click", () => {
    reussiteEnEdition = true; rafraichir();
    const i = document.querySelector("#reussite input"); i?.focus(); i?.select();
  });
  zone.querySelector(".ok")?.addEventListener("click", valider);
  zone.querySelector(".annuler")?.addEventListener("click", fermer);
  zone.querySelector("input")?.addEventListener("keydown", ev => {
    if (ev.key === "Enter") valider();
    if (ev.key === "Escape") fermer();
  });
}
