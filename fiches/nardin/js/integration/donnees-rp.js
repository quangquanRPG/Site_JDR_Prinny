/* ================================================================
   INTÉGRATION — Données du RP (listes du MJ du JDR)
   Elles remplacent les catalogues d'exemple (regles/armures.js, regles/armes.js).
   Set d'armure : protection = somme de l'armure de ses pièces (type d'armure)
                  × valeur du métal × multiplicateur de la rareté,
                  valeur = valeur du métal.
   Arme : nom, roll (texte libre du MJ), à deux mains, description / effet,
          et une 2e forme facultative avec les mêmes champs.
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

  CATALOGUE_ARMES.splice(0, CATALOGUE_ARMES.length, ...(d.armes || []).map(a => ({
    id: a.id, nom: a.nom, deuxMains: !!a.deuxMains,
    detail: a.degats ? "Roll " + a.degats : "",
    description: a.description || "",
    forme2: a.forme2 ? {
      nom: a.forme2.nom, deuxMains: !!a.forme2.deuxMains,
      detail: a.forme2.degats ? "Roll " + a.forme2.degats : "",
      description: a.forme2.description || "",
    } : null,
  })));
}
