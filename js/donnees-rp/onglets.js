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
  {
    cle: "armes", titre: "Armes", prefixe: "arme",
    // Règle du MJ : une arme = un nom, un roll (décidé librement par le MJ) et une description (effets).
    // forme2 : deuxième forme facultative (ex. Épée et bouclier ⇄ Hache de guerre), null sinon
    nouveau: () => ({ nom: "Nouvelle arme", degats: "", deuxMains: false, description: "", forme2: null }),
    champs: [
      { k: "nom", label: "Nom" },
      { k: "degats", label: "Roll", placeholder: "ex. 2d6" },
      { k: "deuxMains", label: "À deux mains", type: "case" },
      { k: "description", label: "Description / effet", type: "zone" },
      { k: "forme2", label: "Arme à deux formes (le joueur peut passer de l'une à l'autre)", type: "forme", champs: [
        { k: "nom", label: "Nom de la 2e forme" },
        { k: "degats", label: "Roll", placeholder: "ex. 2d6" },
        { k: "deuxMains", label: "À deux mains", type: "case" },
        { k: "description", label: "Description / effet", type: "zone" },
      ] },
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
