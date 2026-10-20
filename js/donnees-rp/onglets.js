// ─────────────────────────────────────────────────────────────
//  Données du RP : description des cinq listes de l'éditeur
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
    nouveau: () => ({ nom: "Nouvelle rareté", multArmure: 1, bonusDegats: 0 }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "multArmure", label: "Multiplicateur armure (×)", type: "nombre", pas: "any" },
      { k: "bonusDegats", label: "Bonus dégâts", type: "nombre" },
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
  {
    cle: "armes", titre: "Armes", prefixe: "arme",
    nouveau: () => ({ nom: "Nouvelle arme", degats: "", deuxMains: false, materiau: "", rarete: "", description: "" }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "degats", label: "Dégâts", placeholder: "ex. 1d6+2" },
      { k: "materiau", label: "Métal", type: "liste", source: "materiaux" },
      { k: "rarete", label: "Rareté", type: "liste", source: "raretes" },
      { k: "deuxMains", label: "À deux mains", type: "case" },
      { k: "description", label: "Description", type: "zone" },
    ],
  },
  {
    cle: "setsArmure", titre: "Sets d'armure", prefixe: "set",
    nouveau: () => ({ nom: "Nouveau set", materiau: "", rarete: "", pieces: [], description: "" }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "materiau", label: "Métal", type: "liste", source: "materiaux" },
      { k: "rarete", label: "Rareté", type: "liste", source: "raretes" },
      { k: "pieces", type: "pieces" },
      { k: "description", label: "Description", type: "zone" },
    ],
  },
];
