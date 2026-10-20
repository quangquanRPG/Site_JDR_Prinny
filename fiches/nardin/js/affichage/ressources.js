/* ================================================================
   AFFICHAGE — jauges PV / Mana / Énergie / Protection
   ================================================================ */
"use strict";

let ressourceEnEdition = null;   // id de la ressource en cours de modification

function afficherRessources(fiche, u) {
  for (const g of new Set(RESSOURCES.map(r => r.groupe))) {
    document.getElementById("ressources-" + g).innerHTML = "";
  }
  for (const r of RESSOURCES) {
    const zone = document.getElementById("ressources-" + r.groupe);
    const { actuel, base } = fiche.ressources[r.id];
    const pct = base > 0 ? Math.max(0, Math.min(100, (actuel / base) * 100)) : 0;
    const peutActuel = !r.seulMax && droits.modifierActuelRessource(u, fiche);
    const peutBase = r.baseFixe == null && !r.source && droits.modifierBaseRessource(u);
    const enEdition = ressourceEnEdition === r.id && (peutActuel || peutBase);
    const minBase = r.min ?? 1;
    const inputBase = `<input name="base" type="number" min="${minBase}" step="1" value="${base}" title="Maximum (MJ)">`;

    let droite;
    if (enEdition) {
      let champs;
      if (r.seulMax) {
        champs = inputBase + `<small>max</small>`;
      } else {
        const champActuel = peutActuel
          ? `<input name="actuel" type="number" min="0" step="1" value="${actuel}" title="Valeur actuelle">`
          : `<span>${actuel}</span>`;
        const champBase = r.unite
          ? `<small>${r.unite}</small>`
          : `<small>/</small>` + (peutBase ? inputBase : `<small>${base}</small>`);
        champs = champActuel + champBase;
      }
      droite = `
        <span class="res-edit res-droite">
          ${champs}
          <button class="btn-icone ok" title="Valider">✓</button>
          <button class="btn-icone annuler" title="Annuler">✕</button>
        </span>`;
    } else {
      const valeur = r.seulMax
        ? `${base}<small class="etiquette">max</small>`
        : `${actuel}<small>${r.unite ? " " + r.unite : " / " + base}</small>`;
      droite = `
        <span class="res-droite">
          <span class="res-val">${valeur}</span>
          ${peutActuel || peutBase ? `<button class="btn-icone crayon" title="Modifier">✎</button>` : ""}
        </span>`;
    }

    const el = document.createElement("div");
    el.className = "res " + r.id;
    el.innerHTML = `
      <div class="res-haut">
        <span class="res-nom">${r.nom}${r.source === "armure"
          ? `<span class="res-source">${echap(trouverArmure(fiche.armureEquipee)?.nom ?? "Aucune armure")}</span>` : ""}</span>
        ${droite}
      </div>
      ${r.seulMax ? "" :`<div class="res-barre"><div style="width:${pct}%"></div></div>`}`;
    if (r.id === "energie") afficherEfforts(el, fiche, u);
    if (r.id === "protection") afficherUsure(el, fiche, u);

    const fermer = () => { ressourceEnEdition = null; rafraichir(); };
    const valider = () => {
      const champBase = el.querySelector("[name=base]");
      const champActuel = el.querySelector("[name=actuel]");
      if (champBase) modifierBaseRessource(fiche, r.id, champBase.value, u);   // base d'abord
      if (champActuel) modifierActuelRessource(fiche, r.id, champActuel.value, u);
      fermer();
    };
    el.querySelector(".crayon")?.addEventListener("click", () => {
      ressourceEnEdition = r.id;
      rafraichir();
      const champ = document.querySelector(`.res.${r.id} input`);
      champ?.focus(); champ?.select();
    });
    el.querySelector(".ok")?.addEventListener("click", valider);
    el.querySelector(".annuler")?.addEventListener("click", fermer);
    el.querySelectorAll("input").forEach(i => i.addEventListener("keydown", ev => {
      if (ev.key === "Enter") valider();
      if (ev.key === "Escape") fermer();
    }));
    zone.appendChild(el);
  }
}
