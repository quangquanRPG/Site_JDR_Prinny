/* ================================================================
   ACTIONS — PV / Mana / Énergie, blessures, efforts, seuil de réussite
   Chaque action vérifie les droits (regles/droits.js) avant de modifier la fiche.
   ================================================================ */
"use strict";

// Le propriétaire (ou le MJ) change la valeur actuelle. Bornée entre 0 et la base.
function modifierActuelRessource(fiche, resId, valeur, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  const res = fiche.ressources[resId];
  const def = RESSOURCES.find(r => r.id === resId);
  if (!res || def?.seulMax) return;                   // la protection magique n'a pas d'actuel
  res.actuel = Math.max(0, Math.min(res.base, Math.round(Number(valeur) || 0)));
}

// Le MJ change la valeur par défaut des PV ou de la Mana.
// Si l'actuel dépasse la nouvelle base, il est ramené à la base.
function modifierBaseRessource(fiche, resId, valeur, u) {
  if (!droits.modifierBaseRessource(u)) throw new Error("Seul le MJ peut modifier cette valeur.");
  const def = RESSOURCES.find(r => r.id === resId);
  if (!def || def.baseFixe != null) return;          // l'Énergie reste à 100
  const res = fiche.ressources[resId];
  const min = def.min ?? 1;
  res.base = Math.max(min, Math.round(Number(valeur) || min));
  res.actuel = def.seulMax ? res.base : Math.min(res.actuel, res.base);
}

function modifierBlessures(fiche, nombre, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  fiche.blessuresGraves = Math.max(0, Math.min(MAX_BLESSURES, Math.floor(Number(nombre) || 0)));
}

function activerEffort(fiche, id, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  const e = EFFORTS.find(x => x.id === id);
  const energie = fiche.ressources.energie;
  if (!e || fiche.effort || energie.actuel < e.cout) return false;
  energie.actuel -= e.cout;
  fiche.effort = e.id;
  return true;
}

function terminerEffort(fiche, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  fiche.effort = null;
}

function modifierReussite(fiche, seuil, u) {
  if (!droits.modifierReussite(u)) throw new Error("Seul le MJ peut changer le seuil de réussite.");
  fiche.reussite = Math.max(SEUIL_MIN, Math.min(SEUIL_MAX, Math.round(Number(seuil) || REUSSITE_DEFAUT)));
}
