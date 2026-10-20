/* ================================================================
   ACTIONS — encaisser des dégâts
   Dégâts normaux : la Protection encaisse les dégâts,
     PV perdus = dégâts encaissés ÷ valeur d'armure (arrondi en dessous).
   Si la Protection ne suffit pas, le surplus va directement aux PV.
   Dégâts bruts : directement dans les PV.
   Attaque magique : la Protection magique absorbe d'abord jusqu'à
     sa valeur de dégâts (sans diminuer), le reste suit le calcul normal.
   ================================================================ */
"use strict";

function repartirDegats(degats, protection, valeur) {
  const encaisse = Math.min(degats, Math.max(0, protection));   // ce que la Protection absorbe
  const surplus  = degats - encaisse;                           // ce qui passe à travers
  const pertePV  = Math.floor(encaisse / Math.max(1, valeur)) + surplus;
  return { protection: encaisse, pv: pertePV };
}

function encaisserDegats(fiche, degats, degatsBruts, u, magique = false) {
  if (!droits.modifierActuelRessource(u, fiche)) throw new Error("Tu ne peux pas modifier cette fiche.");
  const prot = fiche.ressources.protection, pv = fiche.ressources.pv;
  const avant = { protection: prot.actuel, pv: pv.actuel };
  degats = Math.max(0, Math.round(Number(degats) || 0));
  degatsBruts = Math.max(0, Math.round(Number(degatsBruts) || 0));

  // Attaque magique : la Protection magique absorbe sans s'user
  const absorbeMagie = magique ? Math.min(degats, fiche.ressources.protMagique.base) : 0;
  const sUse = protectionSUse(fiche);
  const r = sUse
    ? repartirDegats(degats - absorbeMagie, prot.actuel, valeurArmure(fiche))
    : { protection: 0, pv: Math.floor((degats - absorbeMagie) / VALEUR_DIVINE) };   // armure divine : ÷ 10, c'est tout
  if (sUse) prot.actuel -= r.protection;
  const pertePV = Math.min(pv.actuel, r.pv + degatsBruts);   // PV jamais sous 0
  pv.actuel -= pertePV;
  return { avant, degats, degatsBruts, magique, absorbeMagie, perteProtection: r.protection, divin: !sUse, pertePV };
}
