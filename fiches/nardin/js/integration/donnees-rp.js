/* ================================================================
   INTÉGRATION — Données du RP (listes du MJ du JDR : métaux, raretés, types d'armure)
   Les armures et les armes ne viennent plus d'ici : ce sont des objets uniques
   (integration/objets.js). On garde seulement ces listes pour afficher de quoi
   est faite une armure (métal · rareté · pièces).
   ================================================================ */
"use strict";

let donneesRpFiche = { materiaux: [], raretes: [], typesArmure: [] };

function appliquerDonneesRp(d) {
  if (d && typeof d === "object") donneesRpFiche = d;
}
