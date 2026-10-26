/* ================================================================
   RÈGLES — réussite des d6
   Un d6 réussit s'il fait au moins le seuil (4 = « 4+ »).
   Le seuil de base est réglé par le MJ (2+ à 6+) ; un effort ou un don peut l'abaisser,
   la fatigue l'augmenter. Le seuil final reste entre 1+ et 6+.
   ================================================================ */
"use strict";

const REUSSITE_DEFAUT = 4;
const SEUIL_MIN = 2, SEUIL_MAX = 6;
const seuilReussite = fiche => Math.max(1, Math.min(SEUIL_MAX,
  fiche.reussite - (effortActif(fiche)?.reussite ?? 0) + fatigue(fiche).reussite + reussiteDons(fiche).total));

const chanceParDe = fiche => (7 - seuilReussite(fiche)) / 6;           // 4+ → 0,5
// Chance d'avoir au moins une réussite avec n dés
const chanceAuMoinsUne = (fiche, n) => 1 - Math.pow(1 - chanceParDe(fiche), n);

// Réussite des d6 (le site affiche la sienne quand la fiche est intégrée)
function etatReussite(fiche) {
  const effort = effortActif(fiche);
  const f = fatigue(fiche);
  const dons = reussiteDons(fiche).sources;
  return {
    reussite: seuilReussite(fiche), base: fiche.reussite,
    chance: chanceParDe(fiche), effort: effort ? effort.nom : null,
    fatigue: f.ignoree ? null : texteFatigue(f) || null,
    dons: dons.length ? dons.map(d => d.nom + " " + signe(d.valeur)).join(", ") : null,   // ex. « Nécromancienne −1 »
  };
}
