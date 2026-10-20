/* ================================================================
   ACTIONS — dons & connaissances
   ================================================================ */
"use strict";

function ajouterDon(fiche, don, u) {
  if (!droits.gererDons(u)) throw new Error("Seul le MJ peut ajouter un don.");
  fiche.dons.push(creerDon(don));
}
function supprimerDon(fiche, donId, u) {
  if (!droits.gererDons(u)) throw new Error("Seul le MJ peut supprimer un don.");
  fiche.dons = fiche.dons.filter(d => d.id !== donId);
  ajusterMains(fiche);
}
function basculerDon(fiche, donId, u) {
  if (!droits.activerDon(u, fiche)) throw new Error("Tu ne peux pas modifier ce don.");
  const don = fiche.dons.find(d => d.id === donId);
  if (don) don.actif = !don.actif;
  ajusterMains(fiche);
}
