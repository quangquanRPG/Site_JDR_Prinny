/* ================================================================
   RÈGLES — efforts : dépenser de l'énergie pour un bonus temporaire
   Un seul effort actif à la fois ; il dure jusqu'à ce qu'on clique « Terminer ».
   L'énergie dépensée n'est pas rendue.
   ================================================================ */
"use strict";

const EFFORTS = [
  { id: "des1", cout: 5,  des: 1,      nom: "+1 dé" },
  { id: "des2", cout: 10, des: 2,      nom: "+2 dés" },
  { id: "des3", cout: 20, des: 3,      nom: "+3 dés" },
  { id: "reu1", cout: 40, reussite: 1, nom: "Réussite −1" },
  { id: "reu2", cout: 80, reussite: 2, nom: "Réussite −2" },
];
const effortActif = fiche => EFFORTS.find(e => e.id === fiche.effort) ?? null;
