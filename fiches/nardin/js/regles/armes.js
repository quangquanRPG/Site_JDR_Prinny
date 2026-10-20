/* ================================================================
   RÈGLES — armes : possédées → portées (max 3) → en main (2 mains)
   Catalogue d'exemple : dans le site, il est remplacé par les Données du RP du MJ
   (voir integration/donnees-rp.js).
   ================================================================ */
"use strict";

const CATALOGUE_ARMES = [
  { id: "epee",     nom: "Épée courte" },
  { id: "dague",    nom: "Dague" },
  { id: "arc",      nom: "Arc court",     deuxMains: true },
  { id: "bouclier", nom: "Bouclier rond" },
  { id: "hache",    nom: "Hache" },
  { id: "espadon",  nom: "Espadon",       deuxMains: true },
];
const trouverArme = id => CATALOGUE_ARMES.find(a => a.id === id) ?? null;
const MAX_ARMES_PORTEES = 3;   // sur soi
const NB_MAINS = 2;            // une arme à 1 main prend 1 main, une arme à 2 mains en prend 2

// Nombre de mains que prend une arme pour ce personnage
function mainsArme(fiche, id) {
  return trouverArme(id)?.deuxMains && !aRegle(fiche, "deuxMainsAUneMain") ? 2 : 1;
}
const mainsOccupees = fiche => fiche.armesEnMain.reduce((s, id) => s + mainsArme(fiche, id), 0);

// Garde seulement ce qui tient dans les mains (dans l'ordre de prise en main).
// Utile si un don est désactivé alors qu'on tenait 2 armes dont une à 2 mains.
function ajusterMains(fiche) {
  let total = 0;
  fiche.armesEnMain = fiche.armesEnMain.filter(id => {
    if (!fiche.armesPortees.includes(id)) return false;
    const m = mainsArme(fiche, id);
    if (total + m > NB_MAINS) return false;
    total += m;
    return true;
  });
}
