/* ================================================================
   RÈGLES — ressources (actuel / base)
   groupe   : section où elle s'affiche ("etat" ou "defense")
   baseFixe : base imposée, non modifiable
   seulMax  : pas de valeur actuelle, juste un maximum
   min      : plus petite base autorisée (1 par défaut)
   defaut   : base si rien n'est fourni (10 par défaut)
   source   : "armure" = le maximum suit l'armure équipée
   ================================================================ */
"use strict";

const RESSOURCES = [
  { id: "pv",          nom: "PV",                 groupe: "etat" },
  { id: "mana",        nom: "Mana",               groupe: "etat" },
  { id: "energie",     nom: "Énergie",            groupe: "etat", baseFixe: 100, unite: "%" },   // pourcentage
  { id: "protection",  nom: "Protection",         groupe: "defense", min: 0, defaut: 0, source: "armure" }, // max = armure équipée
  { id: "protMagique", nom: "Protection magique", groupe: "defense", min: 0, defaut: 0, seulMax: true },
];
