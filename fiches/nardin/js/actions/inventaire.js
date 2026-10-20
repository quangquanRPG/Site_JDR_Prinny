/* ================================================================
   ACTIONS — inventaires (objets, quantités, objets cachés, tailles)
   ================================================================ */
"use strict";

// Toutes ces fonctions prennent en dernier paramètre l'inventaire visé :
// "inventaire" (important, par défaut) ou "inventaireNonImportant".
function ajouterObjet(fiche, objet, u, cle = "inventaire") {
  if (!droits.gererInventaire(u, fiche)) throw new Error("Tu ne peux pas modifier cet inventaire.");
  if (emplacementsLibres(fiche, cle) < 1) return false;       // inventaire plein
  const peutCacher = objetsCaches(fiche, cle).length < fiche[cle].maxCaches;
  fiche[cle].objets.push(creerObjet({ ...objet, cache: !!objet.cache && peutCacher }));
  return true;
}
function retirerObjet(fiche, objetId, u, cle = "inventaire") {
  if (!droits.gererInventaire(u, fiche)) throw new Error("Tu ne peux pas modifier cet inventaire.");
  fiche[cle].objets = fiche[cle].objets.filter(o => o.id !== objetId);
}
function modifierQuantite(fiche, objetId, quantite, u, cle = "inventaire") {
  if (!droits.gererInventaire(u, fiche)) throw new Error("Tu ne peux pas modifier cet inventaire.");
  const o = fiche[cle].objets.find(o => o.id === objetId);
  if (o) o.quantite = Math.max(0, Math.floor(Number(quantite) || 0));
}
function modifierDescription(fiche, objetId, description, u, cle = "inventaire") {
  if (!droits.gererInventaire(u, fiche)) throw new Error("Tu ne peux pas modifier cet inventaire.");
  const o = fiche[cle].objets.find(o => o.id === objetId);
  if (o) o.description = String(description).trim();
}
// Cache / montre un objet aux autres joueurs (dans la limite maxCaches)
function basculerCache(fiche, objetId, u, cle = "inventaire") {
  if (!droits.gererInventaire(u, fiche)) throw new Error("Tu ne peux pas modifier cet inventaire.");
  const o = fiche[cle].objets.find(o => o.id === objetId);
  if (!o) return false;
  if (!o.cache && objetsCaches(fiche, cle).length >= fiche[cle].maxCaches) return false;
  o.cache = !o.cache;
  return true;
}
function modifierMaxCaches(fiche, max, u, cle = "inventaire") {
  if (!droits.modifierMaxInventaire(u)) throw new Error("Seul le MJ peut changer ce maximum.");
  fiche[cle].maxCaches = Math.max(0, Math.floor(Number(max) || 0));
}

function modifierMaxInventaire(fiche, max, u, cle = "inventaire") {
  if (!droits.modifierMaxInventaire(u)) throw new Error("Seul le MJ peut changer la taille de l'inventaire.");
  fiche[cle].max = Math.max(0, Math.floor(Number(max) || 0));
}
