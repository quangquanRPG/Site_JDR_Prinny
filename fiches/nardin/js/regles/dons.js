/* ================================================================
   RÈGLES — dons & connaissances
   Un don porte une liste d'effets. Types d'effet :
     "des"   → ajoute / retire des dés à une compétence
     "regle" → débloque une règle spéciale (REGLES_SPECIALES)
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
    effets: (donnees.effets ?? []).map(e => (e.type ?? "des") === "regle"
      ? { type: "regle", regle: e.regle }         // clé de REGLES_SPECIALES
      : {
          type:        "des",
          competence:  e.competence,              // id de COMPETENCES
          valeur:      Number(e.valeur) || 0,     // +2 = deux dés de plus, -1 = un dé de moins
        }),
  };
}

// Un don actif débloque-t-il cette règle spéciale ?
function aRegle(fiche, regle) {
  return fiche.dons.some(d => d.actif && d.effets.some(e => e.type === "regle" && e.regle === regle));
}
