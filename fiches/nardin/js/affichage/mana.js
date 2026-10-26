/* ================================================================
   AFFICHAGE — gestionnaire de mana (sorts)
   Gauche : mana à dépenser, cases Bonus / Malus, bouton Consommer
            (avec confirmation, puis récap annulable).
   Droite : jet de dés à faire, dégâts minimum, moyenne, maximum.
   ================================================================ */
"use strict";

// Réglages du sort en cours (gardés quand la fiche se redessine)
const sortMana = { montant: "", bonus: false, malus: false, confirmation: false };
let dernierSort = null;   // { montant, avant, apres } pour le récap et l'annulation

const nombreFr = v => v.toLocaleString("fr-FR");

function afficherMana(fiche, u) {
  const zone = document.getElementById("zone-mana");
  zone.innerHTML = "";
  if (!droits.modifierActuelRessource(u, fiche)) return;

  const carte = document.createElement("div");
  carte.className = "mana-sort";
  carte.innerHTML = `
    <div class="mana-gauche">
      <div class="mana-titre">Sort <small>· Mana ${nombreFr(fiche.ressources.mana.actuel)} / ${nombreFr(fiche.ressources.mana.base)}</small></div>
      <label class="champ-degat"><span class="label">Mana à dépenser</span>
        <input name="manaSort" type="number" min="0" step="1" placeholder="0" value="${echap(sortMana.montant)}"></label>
      <div class="mana-cases">
        <label class="case-sort bonus"><input type="checkbox" name="bonus" ${sortMana.bonus ? "checked" : ""}> Bonus <small>× ${nombreFr(MULT_BONUS_SORT)}</small></label>
        <label class="case-sort malus"><input type="checkbox" name="malus" ${sortMana.malus ? "checked" : ""}> Malus <small>× ${nombreFr(MULT_MALUS_SORT)}</small></label>
      </div>
      <div class="mana-action"></div>
      ${dernierSort ? `<div class="recap">
        <span>Sort lancé : <span class="m">−${nombreFr(dernierSort.montant)}</span> mana (${nombreFr(dernierSort.avant)} → ${nombreFr(dernierSort.apres)})</span>
        <button type="button" class="lien annuler-sort">Annuler</button>
      </div>` : ""}
    </div>
    <div class="mana-droite" aria-live="polite"></div>`;

  const champ = carte.querySelector("[name=manaSort]");
  const droite = carte.querySelector(".mana-droite");
  const action = carte.querySelector(".mana-action");

  // Partie droite + bouton, mis à jour à chaque frappe (sans redessiner toute la fiche)
  const majCalcul = () => {
    const j = jetMana(sortMana.montant, sortMana.bonus, sortMana.malus);
    const dispo = fiche.ressources.mana.actuel;
    if (!j.mana) {
      droite.innerHTML = `<div class="mana-vide">Indique le mana à dépenser pour voir le jet.</div>`;
    } else {
      const mods = [sortMana.bonus ? "bonus" : "", sortMana.malus ? "malus" : ""].filter(Boolean).join(" + ");
      droite.innerHTML = `
        <div class="mana-jet">
          <span class="label">Jet à faire</span>
          <span class="valeur">${j.texte}</span>
          ${j.mult !== 1 ? `<span class="mult">dégâts × ${nombreFr(j.mult)} (${mods})</span>` : ""}
        </div>
        <div class="mana-stats">
          <div><span class="label">Minimum</span><b>${nombreFr(j.min)}</b></div>
          <div class="moy"><span class="label">Moyenne</span><b>${nombreFr(j.moyenne)}</b></div>
          <div><span class="label">Maximum</span><b>${nombreFr(j.max)}</b></div>
        </div>`;
    }
    if (sortMana.confirmation && j.mana && j.mana <= dispo) {
      action.innerHTML = `
        <div class="mana-confirmer">
          <span>Consommer <b>${nombreFr(j.mana)}</b> mana ? Il restera ${nombreFr(dispo - j.mana)}.</span>
          <button type="button" class="btn principal confirmer">Confirmer</button>
          <button type="button" class="btn annuler">Annuler</button>
        </div>`;
      action.querySelector(".confirmer").addEventListener("click", () => {
        const r = consommerMana(fiche, j.mana, u);
        sortMana.confirmation = false;
        if (r) { dernierSort = r; sortMana.montant = ""; }
        rafraichir();
      });
      action.querySelector(".annuler").addEventListener("click", () => { sortMana.confirmation = false; majCalcul(); });
    } else {
      sortMana.confirmation = false;
      const manque = j.mana > dispo;
      action.innerHTML = `<button type="button" class="btn principal consommer" ${!j.mana || manque ? "disabled" : ""}>Consommer le mana</button>
        ${manque ? `<span class="erreur">Pas assez de mana (${nombreFr(dispo)} restant).</span>` : ""}`;
      action.querySelector(".consommer").addEventListener("click", () => { sortMana.confirmation = true; majCalcul(); });
    }
  };

  champ.addEventListener("input", () => { sortMana.montant = champ.value; sortMana.confirmation = false; majCalcul(); });
  champ.addEventListener("keydown", ev => {
    if (ev.key === "Enter") action.querySelector(".consommer:not(:disabled), .confirmer")?.click();
    if (ev.key === "Escape" && sortMana.confirmation) { sortMana.confirmation = false; majCalcul(); }
  });
  for (const nom of ["bonus", "malus"]) {
    const c = carte.querySelector(`[name=${nom}]`);
    c.addEventListener("change", () => { sortMana[nom] = c.checked; majCalcul(); });
  }
  carte.querySelector(".annuler-sort")?.addEventListener("click", () => {
    rendreMana(fiche, dernierSort.montant, u);
    dernierSort = null;
    rafraichir();
  });

  majCalcul();
  zone.appendChild(carte);
}
