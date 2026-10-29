/* ================================================================
   INTÉGRATION — Données du RP (listes du MJ du JDR)
   Elles remplacent le catalogue d'armes d'exemple (regles/armes.js).
   Les armures ne viennent plus d'ici : ce sont des objets uniques (integration/objets.js).
   Arme : nom, roll (texte libre du MJ), à deux mains, description / effet,
          et une 2e forme facultative avec les mêmes champs.
   ================================================================ */
"use strict";

function appliquerDonneesRp(d) {
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
