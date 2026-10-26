/* ================================================================
   RÈGLES — dons & connaissances
   Un don porte une liste d'effets. Types d'effet :
     "des"   → ajoute / retire des dés à une compétence
     "regle"    → débloque une règle spéciale (REGLES_SPECIALES)
     "reussite" → change le seuil de réussite des d6 (−1 = plus facile : 4+ devient 3+)
   ================================================================ */
"use strict";

/* Règles spéciales qu'un don peut débloquer (effet de type "regle") */
const REGLES_SPECIALES = {
  deuxMainsAUneMain: "Arme à 2 mains tenue à une main",
};

const TYPES_DON = { don: "Don", connaissance: "Connaissance" };

function creerDon(donnees = {}) {
  return {
    id:          donnees.id ?? nouvelId("don"),
    nom:         donnees.nom ?? "Nouveau don",
    type:        donnees.type ?? "don",           // "don" | "connaissance"
    description: donnees.description ?? "",
    actif:       donnees.actif ?? true,
    effets: (donnees.effets ?? []).map(e => {
      const type = e.type ?? "des";
      if (type === "regle")    return { type: "regle", regle: e.regle };                     // clé de REGLES_SPECIALES
      if (type === "reussite") return { type: "reussite", valeur: Number(e.valeur) || 0 };   // −1 = réussite plus facile
      return {
        type:        "des",
        competence:  e.competence,              // id de COMPETENCES
        valeur:      Number(e.valeur) || 0,     // +2 = deux dés de plus, -1 = un dé de moins
      };
    }),
  };
}

// Dons actifs qui changent la réussite des d6 : [{ nom, valeur }] (valeur −1 = plus facile)
function reussiteDons(fiche) {
  const sources = [];
  for (const don of fiche.dons) {
    if (!don.actif) continue;
    const v = don.effets.filter(e => e.type === "reussite").reduce((t, e) => t + e.valeur, 0);
    if (v) sources.push({ nom: don.nom, valeur: v });
  }
  return { total: sources.reduce((t, s) => t + s.valeur, 0), sources };
}

// Un don actif débloque-t-il cette règle spéciale ?
function aRegle(fiche, regle) {
  return fiche.dons.some(d => d.actif && d.effets.some(e => e.type === "regle" && e.regle === regle));
}
