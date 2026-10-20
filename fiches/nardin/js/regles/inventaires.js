/* ================================================================
   RÈGLES — inventaires : un nombre limité d'emplacements
   Important     : objet = 1, armure rangée = 3, arme rangée = 2.
                   Ce qui est sur soi (armure équipée, armes portées) ne compte pas.
   Non important : tout objet = 1 emplacement, pas d'équipement.
   Les deux ont le même fonctionnement (max MJ, objets cachés…).
   ================================================================ */
"use strict";

const INVENTAIRES = [
  { cle: "inventaire",             titre: "Inventaire important",     equipement: true,  maxDefaut: 20 },
  { cle: "inventaireNonImportant", titre: "Inventaire non important", equipement: false, maxDefaut: 20 },
];
const defInventaire = cle => INVENTAIRES.find(i => i.cle === cle);
const EMPLACEMENTS_ARMURE = 3;
const EMPLACEMENTS_ARME   = 2;

function creerObjet(donnees = {}) {
  return {
    id:          donnees.id ?? nouvelId("obj"),
    titre:       donnees.titre ?? "Objet",
    quantite:    Math.max(0, Math.floor(donnees.quantite ?? 1)),
    description: donnees.description ?? "",
    cache:       !!donnees.cache,             // caché aux autres joueurs (visible proprio + MJ)
  };
}

function creerInventaire(donnees = {}, maxDefaut = 20) {
  return {
    max:       donnees.max ?? maxDefaut,          // nombre d'emplacements (réglé par le MJ)
    maxCaches: donnees.maxCaches ?? 3,            // objets cachables (réglé par le MJ)
    objets:    (donnees.objets ?? []).map(creerObjet),
  };
}

const objetsCaches = (fiche, cle = "inventaire") => fiche[cle].objets.filter(o => o.cache);

const armuresRangees = fiche => fiche.armures.filter(id => id !== fiche.armureEquipee);
const armesRangees   = fiche => fiche.armes.filter(id => !fiche.armesPortees.includes(id));
const emplacementsUtilises = (fiche, cle = "inventaire") =>
  (defInventaire(cle).equipement
    ? armuresRangees(fiche).length * EMPLACEMENTS_ARMURE + armesRangees(fiche).length * EMPLACEMENTS_ARME
    : 0)
  + fiche[cle].objets.length;
const emplacementsLibres = (fiche, cle = "inventaire") => fiche[cle].max - emplacementsUtilises(fiche, cle);
