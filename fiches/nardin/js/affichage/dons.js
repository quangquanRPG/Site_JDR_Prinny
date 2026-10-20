/* ================================================================
   AFFICHAGE — dons & connaissances
   ================================================================ */
"use strict";

function afficherDons(fiche, u) {
  const zone = document.getElementById("dons");
  zone.innerHTML = "";
  if (!fiche.dons.length) {
    zone.innerHTML = `<div class="vide">Aucun don ni connaissance pour l'instant.</div>`;
    return;
  }
  const peutActiver = droits.activerDon(u, fiche);
  const peutGerer = droits.gererDons(u);
  for (const don of fiche.dons) {
    const el = document.createElement("div");
    el.className = "don" + (don.actif ? "" : " inactif");
    el.innerHTML = `
      <label class="switch" title="${peutActiver ? (don.actif ? "Désactiver" : "Activer") : "Seuls le MJ et le propriétaire peuvent changer ça"}">
        <input type="checkbox" ${don.actif ? "checked" : ""} ${peutActiver ? "" : "disabled"}>
        <span></span>
      </label>
      <div>
        <div class="don-titre">${echap(don.nom)} <span class="badge">${TYPES_DON[don.type] ?? don.type}</span></div>
        ${don.description ? `<div class="don-desc">${echap(don.description)}</div>` : ""}
        <div class="effets">${don.effets.map(e => e.type === "regle"
          ? `<span class="effet regle">${REGLES_SPECIALES[e.regle] ?? e.regle}</span>`
          : `<span class="effet ${e.valeur > 0 ? "p" : "m"}">${signe(e.valeur)} d6 ${nomCompetence(e.competence)}</span>`).join("")}</div>
      </div>
      ${peutGerer ? `<button class="btn suppr" title="Supprimer">✕</button>` : "<span></span>"}`;
    el.querySelector("input").addEventListener("change", () => { basculerDon(fiche, don.id, u); rafraichir(); });
    el.querySelector(".suppr")?.addEventListener("click", () => { supprimerDon(fiche, don.id, u); rafraichir(); });
    zone.appendChild(el);
  }
}
