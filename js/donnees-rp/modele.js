// ─────────────────────────────────────────────────────────────
//  Données du RP : listes du MJ propres à chaque JDR
//  Utilisées par les fiches : armure d'un set = somme de l'armure de ses pièces (types d'armure)
//  × valeur du métal × multiplicateur de la rareté. Le métal donne aussi la valeur (diviseur des dégâts).
// ─────────────────────────────────────────────────────────────
"use strict";

const DONNEES_RP_DEFAUT = {
  materiaux: [
    { id: "tissu", nom: "Tissu", valeur: 1, valeurMagie: 1 },
    { id: "cuir", nom: "Cuir", valeur: 2, valeurMagie: 0 },
    { id: "fer", nom: "Fer", valeur: 4, valeurMagie: 0 },
  ],
  raretes: [
    { id: "commun", nom: "Commun", multArmure: 1, bonusDegats: 0 },
    { id: "rare", nom: "Rare", multArmure: 2, bonusDegats: 1 },
  ],
  typesArmure: [
    { id: "bras", nom: "Bras", armure: 2 },
    { id: "plastron", nom: "Plastron", armure: 3 },
    { id: "jambieres", nom: "Jambière", armure: 2 },
    { id: "casque", nom: "Casque", armure: 2 },
  ],
  armes: [
    { id: "epee", nom: "Épée courte", degats: "", deuxMains: false, materiau: "fer", rarete: "commun", description: "" },
    { id: "dague", nom: "Dague", degats: "", deuxMains: false, materiau: "fer", rarete: "commun", description: "" },
    { id: "arc", nom: "Arc court", degats: "", deuxMains: true, materiau: "", rarete: "commun", description: "" },
    { id: "bouclier", nom: "Bouclier rond", degats: "", deuxMains: false, materiau: "fer", rarete: "commun", description: "" },
    { id: "hache", nom: "Hache", degats: "", deuxMains: false, materiau: "fer", rarete: "commun", description: "" },
    { id: "espadon", nom: "Espadon", degats: "", deuxMains: true, materiau: "fer", rarete: "commun", description: "" },
  ],
  setsArmure: [
    { id: "vetements", nom: "Vêtements", materiau: "tissu", rarete: "commun", pieces: ["plastron"], description: "" },
    { id: "cuir", nom: "Armure de cuir", materiau: "cuir", rarete: "commun", pieces: ["bras", "plastron", "jambieres", "casque"], description: "" },
    { id: "maille", nom: "Cotte de mailles", materiau: "fer", rarete: "commun", pieces: ["bras", "plastron", "jambieres", "casque"], description: "" },
    { id: "robe", nom: "Robe ténébreuse", materiau: "tissu", rarete: "commun", pieces: ["plastron"], description: "" },
  ],
};

// Remet les données dans une forme sûre (listes présentes, nombres, textes)
function normaliserDonneesRp(d) {
  const src = d && typeof d === "object" ? d : DONNEES_RP_DEFAUT;
  const liste = (k) => (Array.isArray(src[k]) ? src[k] : []).filter((x) => x && x.id);
  const n = (v) => Number(v) || 0;
  const t = (v) => String(v ?? "");
  return {
    materiaux: liste("materiaux").map((x) => ({ id: t(x.id), nom: t(x.nom), valeur: n(x.valeur), valeurMagie: n(x.valeurMagie) })),
    raretes: liste("raretes").map((x) => ({
      id: t(x.id), nom: t(x.nom), bonusDegats: n(x.bonusDegats),
      multArmure: x.multArmure == null || x.multArmure === "" ? 1 : n(x.multArmure),   // multiplicateur d'armure (1 par défaut)
    })),
    typesArmure: liste("typesArmure").map((x) => ({ id: t(x.id), nom: t(x.nom), armure: n(x.armure) })),
    armes: liste("armes").map((x) => ({
      id: t(x.id), nom: t(x.nom), degats: t(x.degats), deuxMains: !!x.deuxMains,
      materiau: t(x.materiau), rarete: t(x.rarete), description: t(x.description),
    })),
    setsArmure: liste("setsArmure").map((x) => ({
      id: t(x.id), nom: t(x.nom), materiau: t(x.materiau), rarete: t(x.rarete), description: t(x.description),
      // liste des types d'armure qui composent le set (ancien format { type: protection } accepté)
      pieces: Array.isArray(x.pieces) ? x.pieces.map(t) : Object.keys(x.pieces && typeof x.pieces === "object" ? x.pieces : {}),
    })),
  };
}

// Armure d'un set = somme de l'armure des types de pièces × valeur du métal × multiplicateur de rareté
const armureSet = (base, fMetal, fRarete) => Math.round(base * fMetal * fRarete);

function resumeSet(d, s) {
  const m = d.materiaux.find((x) => x.id === s.materiau);
  const r = d.raretes.find((x) => x.id === s.rarete);
  const pieces = d.typesArmure.filter((p) => s.pieces.includes(p.id));
  const base = pieces.reduce((tot, p) => tot + p.armure, 0);
  const fMetal = m ? m.valeur : 1;
  const fRarete = r ? r.multArmure : 1;
  return "Armure " + armureSet(base, fMetal, fRarete)
    + " = pièces " + base + " × " + (m ? "métal " + fMetal : "sans métal 1") + " × " + (r ? "rareté " + fRarete : "sans rareté 1")
    + (pieces.length ? "" : " · aucune pièce");
}
