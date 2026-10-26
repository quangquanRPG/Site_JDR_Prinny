/* ================================================================
   ACTIONS — consommer du mana pour un sort (et annuler)
   ================================================================ */
"use strict";

// Retire le mana du sort. Refusé s'il n'y en a pas assez. Renvoie le récap (pour l'annuler).
function consommerMana(fiche, montant, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  const mana = fiche.ressources.mana;
  montant = Math.max(0, Math.floor(Number(montant) || 0));
  if (!montant || montant > mana.actuel) return null;
  const avant = mana.actuel;
  mana.actuel -= montant;
  return { montant, avant, apres: mana.actuel };
}

// Rend le mana d'un sort (sans dépasser le maximum)
function rendreMana(fiche, montant, u) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  const mana = fiche.ressources.mana;
  mana.actuel = Math.min(mana.base, mana.actuel + Math.max(0, Math.floor(Number(montant) || 0)));
}
