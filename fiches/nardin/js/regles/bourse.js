/* ================================================================
   RÈGLES — monnaie : 100 cuivre = 1 argent, 100 argent = 1 or, 100 or = 1 platine
   valeur = combien de cuivre vaut une pièce
   ================================================================ */
"use strict";

const MONNAIES = [
  { id: "cuivre",  nom: "Cuivre",  valeur: 1,         couleur: "#b87333" },
  { id: "argent",  nom: "Argent",  valeur: 100,       couleur: "#a8a9ad" },
  { id: "or",      nom: "Or",      valeur: 10000,     couleur: "#d4af37" },
  { id: "platine", nom: "Platine", valeur: 1000000,   couleur: "#7fa6b5" },
];

// Valeur totale de la bourse, en cuivre
const totalEnCuivre = bourse => MONNAIES.reduce((s, m) => s + (bourse[m.id] ?? 0) * m.valeur, 0);

// Transforme un montant en cuivre en pièces regroupées (le moins de pièces possible)
function bourseDepuisCuivre(total) {
  const b = {};
  for (const m of [...MONNAIES].reverse()) {
    b[m.id] = Math.floor(total / m.valeur);
    total -= b[m.id] * m.valeur;
  }
  return b;
}
