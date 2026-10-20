/* ================================================================
   RÈGLES — compétences
   ================================================================ */
"use strict";

const COMPETENCES = [
  { id: "force",        nom: "Force" },
  { id: "agilite",      nom: "Agilité" },
  { id: "constitution", nom: "Constitution" },
  { id: "volonte",      nom: "Volonté" },
  { id: "perception",   nom: "Perception" },
  { id: "vise",         nom: "Visé" },
  { id: "eloquence",    nom: "Éloquence" },
  { id: "aura",         nom: "Aura" },
  { id: "intelligence", nom: "Intelligence" },
];
const nomCompetence = id => COMPETENCES.find(c => c.id === id)?.nom ?? id;
