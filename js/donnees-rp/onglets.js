// ─────────────────────────────────────────────────────────────
//  Données du RP : description des trois listes de l'éditeur
//  (métaux, raretés, types d'armure = ingrédients des armures uniques, voir panneau-objets.js)
//  Pour ajouter un champ à une liste, il suffit de l'ajouter ici.
// ─────────────────────────────────────────────────────────────
"use strict";

const ONGLETS_RP = [
  {
    cle: "materiaux", titre: "Métaux", prefixe: "met",
    nouveau: () => ({ nom: "Nouveau métal", valeur: 1, valeurMagie: 0 }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "valeur", label: "Valeur", type: "nombre", pas: "any" },
      { k: "valeurMagie", label: "Valeur magie", type: "nombre" },
    ],
  },
  {
    cle: "raretes", titre: "Raretés", prefixe: "rar",
    nouveau: () => ({ nom: "Nouvelle rareté", multArmure: 1 }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "multArmure", label: "Multiplicateur armure (×)", type: "nombre", pas: "any" },
    ],
  },
  {
    cle: "typesArmure", titre: "Types d'armure", prefixe: "piece",
    nouveau: () => ({ nom: "Nouvelle pièce", armure: 1 }),
    champs: [
      { k: "nom", label: "Type" },
      { k: "armure", label: "Armure", type: "nombre" },
    ],
  },
];
