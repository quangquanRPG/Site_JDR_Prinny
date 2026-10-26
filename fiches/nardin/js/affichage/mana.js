/* ================================================================
   AFFICHAGE — gestionnaire de mana (sorts)
   Bloc « Sort » à côté de « Encaisser des dégâts » : mana à dépenser,
   cases Bonus / Malus, bouton Consommer (avec confirmation, puis récap annulable).
   Le jet à faire (dés, minimum, moyenne, maximum) s'affiche sous la Réussite
   (panneau de la fiche, ou cadre Réussite du site quand la fiche est dans le site).
   ================================================================ */
"use strict";

// Réglages du sort en cours (gardés quand la fiche se redessine)
const sortMana = { montant: "", bonus: false, malus: false, confirmation: false };
let dernierSort = null;   // { montant, avant, apres } pour le récap et l'annulation

const nombreFr = v => v.toLocaleString("fr-FR");

// Jet du sort en préparation (null si rien à afficher)
function jetSortEnCours(fiche, u) {
  if (!droits.modifierActuelRessource(u, fiche)) return null;
  const j = jetMana(sortMana.montant, sortMana.bonus, sortMana.malus);
  if (!j.mana) return null;
  return { ...j, mods: [sortMana.bonus ? "bonus" : "", sortMana.malus ? "malus" : ""].filter(Boolean).join(" + ") };
}

// Bloc « Sort » sous la Réussite (panneau de la fiche ouverte seule)
function htmlJetSort(j) {
  if (!j) return "";
  return `
    <div class="label">Jet du sort <small>${nombreFr(j.mana)} mana</small></div>
    <div class="jet">${j.texte}</div>
    ${j.mult !== 1 ? `<div class="mult">dégâts × ${nombreFr(j.mult)} (${j.mods})</div>` : ""}
    <div class="stats">
      <span><small>min</small><b>${nombreFr(j.min)}</b></span>
      <span class="moy"><small>moy.</small><b>${nombreFr(j.moyenne)}</b></span>
      <span><small>max</small><b>${nombreFr(j.max)}</b></span>
    </div>`;
}

// Met à jour le jet sous la Réussite pendant la saisie, sans redessiner toute la fiche
function majJetSort(fiche, u) {
  const j = jetSortEnCours(fiche, u);
  const zone = document.querySelector("#reussite .sort-reussite");
  if (zone) { zone.innerHTML = htmlJetSort(j); zone.hidden = !j; }
  if (INTEGRE) envoyerAuSite({ type: "jdr:reussite", ...etatReussite(fiche), sort: j });
}

function afficherMana(fiche, u) {
  const zone = document.getElementById("zone-mana");
  zone.innerHTML = "";
  if (!droits.modifierActuelRessource(u, fiche)) return;

  const carte = document.createElement("div");
  carte.className = "mana-sort";
  carte.innerHTML = `
    <div class="titre-bloc">Sort <small>Mana ${nombreFr(fiche.ressources.mana.actuel)} / ${nombreFr(fiche.ressources.mana.base)}</small></div>
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
    </div>` : ""}`;

  const champ = carte.querySelector("[name=manaSort]");
  const action = carte.querySelector(".mana-action");

  // Bouton (ou confirmation) + jet sous la Réussite, mis à jour à chaque frappe
  const majCalcul = () => {
    const j = jetMana(sortMana.montant, sortMana.bonus, sortMana.malus);
    const dispo = fiche.ressources.mana.actuel;
    if (sortMana.confirmation && j.mana && j.mana <= dispo) {
      action.innerHTML = `
        <div class="mana-confirmer">
          <span>Consommer <b>${nombreFr(j.mana)}</b> mana ? Il restera ${nombreFr(dispo - j.mana)}.</span>
          <span class="boutons">
            <button type="button" class="btn principal confirmer">Confirmer</button>
            <button type="button" class="btn annuler">Annuler</button>
          </span>
        </div>`;
      action.querySelector(".confirmer").addEventListener("click", () => {
        const r = consommerMana(fiche, j.mana, u);
        sortMana.confirmation = false;
        if (r) dernierSort = r;   // le montant reste affiché : le jet reste visible sous la Réussite
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
  const changer = () => { majCalcul(); majJetSort(fiche, u); };

  champ.addEventListener("input", () => { sortMana.montant = champ.value; sortMana.confirmation = false; changer(); });
  champ.addEventListener("keydown", ev => {
    if (ev.key === "Enter") action.querySelector(".consommer:not(:disabled), .confirmer")?.click();
    if (ev.key === "Escape" && sortMana.confirmation) { sortMana.confirmation = false; majCalcul(); }
  });
  for (const nom of ["bonus", "malus"]) {
    const c = carte.querySelector(`[name=${nom}]`);
    c.addEventListener("change", () => { sortMana[nom] = c.checked; changer(); });
  }
  carte.querySelector(".annuler-sort")?.addEventListener("click", () => {
    rendreMana(fiche, dernierSort.montant, u);
    dernierSort = null;
    rafraichir();
  });

  majCalcul();
  zone.appendChild(carte);
}
