/* ================================================================
   ACTIONS — bourse
   ================================================================ */
"use strict";

function modifierBourse(fiche, valeurs, u) {
  if (!droits.modifierBourse(u, fiche)) throw new Error("Tu ne peux pas modifier cette bourse.");
  for (const m of MONNAIES) {
    if (valeurs[m.id] != null) fiche.bourse[m.id] = Math.max(0, Math.floor(Number(valeurs[m.id]) || 0));
  }
}

// Échange les pièces pour en avoir le moins possible (ex. 145 cuivre → 1 argent 45 cuivre)
function regrouperBourse(fiche, u) {
  if (!droits.modifierBourse(u, fiche)) throw new Error("Tu ne peux pas modifier cette bourse.");
  fiche.bourse = bourseDepuisCuivre(totalEnCuivre(fiche.bourse));
}
