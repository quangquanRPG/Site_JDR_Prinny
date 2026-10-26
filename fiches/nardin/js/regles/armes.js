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
  { id: "epee-bouclier", nom: "Épée et bouclier", forme2: { nom: "Hache de guerre", deuxMains: true } },
];
const trouverArme = id => CATALOGUE_ARMES.find(a => a.id === id) ?? null;
const MAX_ARMES_PORTEES = 3;   // sur soi
const NB_MAINS = 2;            // une arme à 1 main prend 1 main, une arme à 2 mains en prend 2

/* ARMES À DEUX FORMES — une arme peut avoir une forme2 (ex. Épée et bouclier ⇄ Hache de guerre).
   fiche.formesArmes = { idArme: 2 } quand l'arme est dans sa 2e forme ; absente = 1re forme.
   La forme en cours donne le nom, le roll, la description et le nombre de mains. */
const formeActuelle = (fiche, id) => (fiche.formesArmes?.[id] === 2 && trouverArme(id)?.forme2) ? 2 : 1;

// L'arme telle qu'elle est en ce moment pour ce personnage (null si inconnue)
function armeEffective(fiche, id) {
  const a = trouverArme(id);
  if (!a) return null;
  if (!a.forme2) return a;
  const deux = formeActuelle(fiche, id) === 2;
  const f = deux ? a.forme2 : a;
  return {
    id: a.id, nom: f.nom, deuxMains: !!f.deuxMains, detail: f.detail ?? "", description: f.description ?? "",
    forme: deux ? 2 : 1, autreForme: deux ? a.nom : a.forme2.nom,
  };
}

// Nombre de mains que prend une arme dans une forme donnée
function mainsPourForme(fiche, id, forme) {
  const a = trouverArme(id);
  const deux = forme === 2 && a?.forme2 ? a.forme2.deuxMains : a?.deuxMains;
  return deux && !aRegle(fiche, "deuxMainsAUneMain") ? 2 : 1;
}
// Nombre de mains que prend une arme pour ce personnage (dans sa forme actuelle)
const mainsArme = (fiche, id) => mainsPourForme(fiche, id, formeActuelle(fiche, id));

// Peut-on changer de forme maintenant ? Une arme en main ne peut pas prendre plus de mains qu'il n'en reste.
function changementFormePossible(fiche, id) {
  if (!trouverArme(id)?.forme2) return false;
  if (!fiche.armesEnMain.includes(id)) return true;
  const autre = formeActuelle(fiche, id) === 2 ? 1 : 2;
  return mainsOccupees(fiche) - mainsArme(fiche, id) + mainsPourForme(fiche, id, autre) <= NB_MAINS;
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
