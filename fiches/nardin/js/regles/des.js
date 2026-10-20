/* ================================================================
   RÈGLES — nombre de dés d'une compétence
   Base + dons actifs + blessures + effort + fatigue (jamais sous 0).
   ================================================================ */
"use strict";

// Bonus de dés venant des dons actifs, avec le détail des sources
function bonusDes(fiche, compId) {
  const sources = [];
  for (const don of fiche.dons) {
    if (!don.actif) continue;
    for (const e of don.effets) {
      if (e.type === "des" && e.competence === compId && e.valeur !== 0) {
        sources.push({ nom: don.nom, valeur: e.valeur });
      }
    }
  }
  const malus = malusBlessures(fiche);              // s'applique à toutes les compétences
  if (malus) sources.push({ nom: "Blessures graves", valeur: malus });
  const effort = effortActif(fiche);                 // effort en cours : bonus sur toutes les compétences
  if (effort?.des) sources.push({ nom: "Effort (énergie)", valeur: effort.des });
  const f = fatigue(fiche);                          // fatigue : malus sur toutes les compétences
  if (f.des) sources.push({ nom: "Fatigue", valeur: f.des });
  return { total: sources.reduce((s, x) => s + x.valeur, 0), sources };
}

// Valeur actuelle = base + bonus des dons actifs (jamais sous 0)
function valeurActuelle(fiche, compId) {
  return Math.max(0, fiche.competences[compId].base + bonusDes(fiche, compId).total);
}
