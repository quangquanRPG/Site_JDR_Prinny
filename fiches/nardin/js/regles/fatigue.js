/* ================================================================
   RÈGLES — fatigue : l'endurance, c'est la jauge d'Énergie (en %)
   Malus cumulables :
     ≤ 50 % : −1 dé · ≤ 25 % : −1 dé de plus (−2 en tout)
     ≤ 10 % : réussite +1 (plus dure) · ≤ 5 % : réussite +2 (en tout)
   Pas de malus de fatigue pendant un effort (quand on utilise l'énergie).
   Le black-out à 0 % n'est pas géré par la fiche.
   ================================================================ */
"use strict";

const FATIGUE_DES      = [{ seuil: 50, des: -1 }, { seuil: 25, des: -1 }];
const FATIGUE_REUSSITE = [{ seuil: 5, reussite: 2 }, { seuil: 10, reussite: 1 }];   // le palier le plus bas l'emporte
const enduranceEnPourcent = fiche => {
  const e = fiche.ressources.energie;
  return e.base > 0 ? (e.actuel / e.base) * 100 : 0;
};
function fatigue(fiche) {
  const pct = enduranceEnPourcent(fiche);
  const des = FATIGUE_DES.filter(p => pct <= p.seuil).reduce((t, p) => t + p.des, 0);
  const reussite = FATIGUE_REUSSITE.find(p => pct <= p.seuil)?.reussite ?? 0;
  const touche = des !== 0 || reussite !== 0;
  const ignoree = touche && !!effortActif(fiche);       // effort en cours : pas de malus
  return { pct, des: ignoree ? 0 : des, reussite: ignoree ? 0 : reussite, ignoree, desSansEffort: des, reussiteSansEffort: reussite };
}
function texteFatigue(f, sansEffort = false) {
  const des = sansEffort ? f.desSansEffort : f.des;
  const reu = sansEffort ? f.reussiteSansEffort : f.reussite;
  return [des ? `−${Math.abs(des)} dé${des < -1 ? "s" : ""}` : "", reu ? `réussite +${reu}` : ""].filter(Boolean).join(", ");
}
