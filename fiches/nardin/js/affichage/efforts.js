/* ================================================================
   AFFICHAGE — efforts (dépenser de l'énergie) et fatigue
   Dans la carte « Efforts » (#zone-efforts) sous la jauge d'Énergie,
   comme « Encaisser des dégâts » sous les PV et « Sort » sous le Mana.
   ================================================================ */
"use strict";

function afficherEfforts(carte, fiche, u) {
  const peut = droits.modifierActuelRessource(u, fiche);
  const actif = effortActif(fiche);
  const energie = fiche.ressources.energie.actuel;
  const zone = document.createElement("div");
  const f = fatigue(fiche);
  if (f.ignoree) {
    zone.insertAdjacentHTML("beforeend", `<div class="fatigue-info ignoree">Fatigue (${texteFatigue(f, true)}) ignorée pendant l'effort</div>`);
  } else if (f.des || f.reussite) {
    zone.insertAdjacentHTML("beforeend", `<div class="fatigue-info">Fatigue : ${texteFatigue(f)}</div>`);
  }
  if (carte.id === "zone-efforts") {   // carte à part : un titre, comme les autres outils
    zone.className = "efforts-carte";
    zone.insertAdjacentHTML("afterbegin", `<div class="titre-bloc">Efforts <small>Énergie ${energie} %</small></div>`);
  }
  if (!peut && !actif) {   // lecture seule sans effort en cours : seulement la fatigue, s'il y en a
    if (zone.querySelector(".fatigue-info")) carte.appendChild(zone);
    return;
  }
  if (peut) {
    zone.insertAdjacentHTML("beforeend", `<div class="efforts">${EFFORTS.map(e => {
      const estActif = actif?.id === e.id;
      const raison = estActif ? "Effort en cours" : actif ? "Termine d'abord l'effort en cours"
                   : energie < e.cout ? "Pas assez d'énergie" : `Dépenser ${e.cout} d'énergie`;
      return `<button class="effort${estActif ? " actif" : ""}" data-effort="${e.id}" title="${raison}"
                ${actif || energie < e.cout ? "disabled" : ""}>${e.nom}<small>−${e.cout} %</small></button>`;
    }).join("")}</div>`);
  }
  if (actif) {
    zone.insertAdjacentHTML("beforeend", `<div class="effort-actif"><span>Effort : ${actif.nom}</span>
      ${peut ? `<button class="btn terminer">Terminer l'effort</button>` : ""}</div>`);
  }
  zone.querySelectorAll("[data-effort]").forEach(b => b.addEventListener("click", () => {
    activerEffort(fiche, b.dataset.effort, u); rafraichir();
  }));
  zone.querySelector(".terminer")?.addEventListener("click", () => { terminerEffort(fiche, u); rafraichir(); });
  carte.appendChild(zone);
}
