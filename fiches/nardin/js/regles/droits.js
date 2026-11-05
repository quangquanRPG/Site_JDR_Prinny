/* ================================================================
   RÈGLES — droits : qui peut faire quoi sur la fiche
   utilisateur = { id, role: "mj" | "joueur" }
   ================================================================ */
"use strict";

const droits = {
  gererDons:  (u)        => u.role === "mj",                                   // créer / supprimer
  activerDon: (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,    // activer / désactiver
  modifierBaseRessource: (u) => u.role === "mj",                               // PV / Mana par défaut
  modifierActuelRessource: (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire, // PV / Mana / Énergie actuels
  changerArmure: (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,   // équiper / retirer un set
  changerArmes:  (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,   // porter / ranger / prendre en main
  modifierBourse: (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,
  gererInventaire:      (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,  // ajouter / enlever des objets
  modifierMaxInventaire: (u)       => u.role === "mj",
  voirCaches:           (u, fiche) => u.role === "mj" || u.id === fiche.proprietaire,
  reglerFiche:          (u)        => u.role === "mj",   // nom, compétences de base, armes possédées
  modifierReussite:     (u)        => u.role === "mj",
  autoriserUsure:       (u)        => u.role === "mj",   // armure divine : autoriser / bloquer l'usure
};
