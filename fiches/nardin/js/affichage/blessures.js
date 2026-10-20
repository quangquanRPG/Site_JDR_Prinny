/* ================================================================
   AFFICHAGE — blessures graves
   ================================================================ */
"use strict";

function afficherBlessures(fiche, u) {
  const zone = document.getElementById("blessures");
  const peut = droits.modifierActuelRessource(u, fiche);
  const n = fiche.blessuresGraves;
  const malus = malusBlessures(fiche);
  zone.className = "blessures";
  zone.innerHTML = `
    <span class="blessures-nom">Blessures graves</span>
    <span class="pips">${Array.from({ length: MAX_BLESSURES }, (_, i) => `
      <button class="pip ${i < n ? "on" : ""}" data-n="${i + 1}" ${peut ? "" : "disabled"}
        title="${peut ? (i + 1 === n ? `Retirer une blessure` : `${i + 1} blessure${i ? "s" : ""}`) : ""}"></button>`).join("")}
    </span>
    <span class="blessures-compte">${n} / ${MAX_BLESSURES}</span>
    <span class="blessures-malus">${malus
      ? `<b>${signe(malus)} dé${malus < -1 ? "s" : ""}</b> sur toutes les compétences`
      : "Aucun malus"}</span>`;
  zone.querySelectorAll(".pip:not(:disabled)").forEach(b => b.addEventListener("click", () => {
    const cible = Number(b.dataset.n);
    modifierBlessures(fiche, cible === n ? cible - 1 : cible, u);   // re-cliquer la dernière la retire
    rafraichir();
  }));
}
