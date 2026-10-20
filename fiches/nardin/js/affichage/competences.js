/* ================================================================
   AFFICHAGE — compétences
   ================================================================ */
"use strict";

function afficherCompetences(fiche) {
  const zone = document.getElementById("competences");
  zone.innerHTML = "";
  for (const c of COMPETENCES) {
    const base = fiche.competences[c.id].base;
    const { sources } = bonusDes(fiche, c.id);
    const actuel = valeurActuelle(fiche, c.id);
    const etat = actuel > base ? "up" : actuel < base ? "down" : "";
    const el = document.createElement("div");
    el.className = "comp";
    el.innerHTML = `
      <div class="comp-nom">${c.nom}</div>
      <div class="comp-valeurs">
        <span class="actuel ${etat}">${actuel}<small>d6</small></span>
        <span class="defaut">${base}</span>
      </div>
      <div class="comp-legende"><span>Actuel</span><span>Défaut</span></div>
      ${sources.length ? `<div class="comp-sources">${sources.map(s =>
        `<span class="${s.valeur > 0 ? "p" : "m"}">${signe(s.valeur)}</span> ${echap(s.nom)}`).join("<br>")}</div>` : ""}`;
    zone.appendChild(el);
  }
}
