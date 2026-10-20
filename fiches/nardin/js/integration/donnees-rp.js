/* ================================================================
   INTÉGRATION — Données du RP (listes du MJ du JDR)
   Elles remplacent les catalogues d'exemple (regles/armures.js, regles/armes.js).
   Set d'armure : protection = somme de l'armure de ses pièces (type d'armure)
                  × valeur du métal × multiplicateur de la rareté,
                  valeur = valeur du métal.
   Arme : dégâts (texte) + bonus dégâts de la rareté.
   ================================================================ */
"use strict";

function appliquerDonneesRp(d) {
  const metal  = id => (d.materiaux || []).find(x => x.id === id);
  const rarete = id => (d.raretes || []).find(x => x.id === id);
  const types  = d.typesArmure || [];
  const nombre = v => Number(v) || 0;

  CATALOGUE_ARMURES.splice(0, CATALOGUE_ARMURES.length, ...(d.setsArmure || []).map(s => {
    const m = metal(s.materiau), r = rarete(s.rarete);
    const ids = Array.isArray(s.pieces) ? s.pieces : Object.keys(s.pieces || {});
    const pieces = types.filter(t => ids.includes(t.id));
    const base = pieces.reduce((t, p) => t + nombre(p.armure), 0);
    const protection = Math.round(base * (m ? nombre(m.valeur) : 1) * (r ? nombre(r.multArmure ?? 1) : 1));
    return {
      id: s.id, nom: s.nom, protection, valeur: nombre(m?.valeur),
      detail: [m?.nom, r?.nom, pieces.map(p => p.nom).join(", ")].filter(Boolean).join(" · "),
    };
  }));

  CATALOGUE_ARMES.splice(0, CATALOGUE_ARMES.length, ...(d.armes || []).map(a => {
    const m = metal(a.materiau), r = rarete(a.rarete);
    const bonus = nombre(r?.bonusDegats);
    const degats = a.degats ? "Dégâts " + a.degats + (bonus ? " +" + bonus : "") : bonus ? "Dégâts +" + bonus : "";
    return {
      id: a.id, nom: a.nom, deuxMains: !!a.deuxMains,
      detail: [degats, m?.nom, r?.nom].filter(Boolean).join(" · "),
    };
  }));
}
