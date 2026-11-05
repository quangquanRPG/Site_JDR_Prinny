// ─────────────────────────────────────────────────────────────
//  Données du RP : listes du MJ propres à chaque JDR (métaux, raretés, types d'armure)
//  Ce sont les ingrédients des armures uniques (tuile « Objets uniques ») :
//  armure = somme de l'armure de ses pièces (types d'armure) × valeur du métal × multiplicateur de la rareté.
//  Le métal donne aussi la valeur de l'armure (diviseur des dégâts encaissés).
//  Il n'y a plus de modèles tout faits (sets d'armure, armes) : chaque armure et chaque arme est un objet unique.
// ─────────────────────────────────────────────────────────────
"use strict";

const DONNEES_RP_DEFAUT = {
  materiaux: [
    { id: "tissu", nom: "Tissu", valeur: 1, valeurMagie: 1 },
    { id: "cuir", nom: "Cuir", valeur: 2, valeurMagie: 0 },
    { id: "fer", nom: "Fer", valeur: 4, valeurMagie: 0 },
  ],
  raretes: [
    { id: "commun", nom: "Commun", multArmure: 1 },
    { id: "rare", nom: "Rare", multArmure: 2 },
  ],
  typesArmure: [
    { id: "bras", nom: "Bras", armure: 2 },
    { id: "plastron", nom: "Plastron", armure: 3 },
    { id: "jambieres", nom: "Jambière", armure: 2 },
    { id: "casque", nom: "Casque", armure: 2 },
  ],
};

// Remet les données dans une forme sûre (listes présentes, nombres, textes).
// Les anciennes listes « armes » et « setsArmure » sont ignorées (et disparaissent au prochain enregistrement).
function normaliserDonneesRp(d) {
  const src = d && typeof d === "object" ? d : DONNEES_RP_DEFAUT;
  const liste = (k) => (Array.isArray(src[k]) ? src[k] : []).filter((x) => x && x.id);
  const n = (v) => Number(v) || 0;
  const t = (v) => String(v ?? "");
  return {
    materiaux: liste("materiaux").map((x) => ({ id: t(x.id), nom: t(x.nom), valeur: n(x.valeur), valeurMagie: n(x.valeurMagie) })),
    raretes: liste("raretes").map((x) => ({
      id: t(x.id), nom: t(x.nom),
      multArmure: x.multArmure == null || x.multArmure === "" ? 1 : n(x.multArmure),   // multiplicateur d'armure (1 par défaut)
    })),
    typesArmure: liste("typesArmure").map((x) => ({ id: t(x.id), nom: t(x.nom), armure: n(x.armure) })),
  };
}

// Armure = somme de l'armure des types de pièces × valeur du métal × multiplicateur de rareté, arrondie
// (calcul détaillé d'une armure : calculArmure dans js/vues/jdr/panneau-objets.js)
const armureSet = (base, fMetal, fRarete) => Math.round(base * fMetal * fRarete);
