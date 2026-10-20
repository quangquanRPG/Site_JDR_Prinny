/* ================================================================
   RÈGLES — sets d'armure
   Catalogue d'exemple : dans le site, il est remplacé par les Données du RP du MJ
   (voir integration/donnees-rp.js).
   ================================================================ */
"use strict";

const CATALOGUE_ARMURES = [
  { id: "vetements", nom: "Vêtements",         protection: 1,  valeur: 0 },
  { id: "cuir",      nom: "Armure de cuir",    protection: 10, valeur: 2 },
  { id: "maille",    nom: "Cotte de mailles",  protection: 40, valeur: 4 },
  { id: "harnois",   nom: "Harnois",           protection: 8,  valeur: 0 },
  { id: "robe",      nom: "Robe ténébreuse",   protection: 0,  valeur: 1 },
];
const trouverArmure = id => CATALOGUE_ARMURES.find(a => a.id === id) ?? null;

// Valeur de l'armure équipée (0 sans armure)
const valeurArmure = fiche => trouverArmure(fiche.armureEquipee)?.valeur ?? 0;

/* ARMURE DIVINE — valeur exactement 10 : résistance créée par les dieux.
   Tant que l'usure est bloquée : la Protection ne bouge pas et les dégâts sont
   simplement divisés par 10 (120 dégâts → 12 PV), rien de plus.
   Si le MJ autorise l'usure (fiche.usureAutorisee), le calcul normal s'applique.
   Un métal de valeur plus haute suit toujours le calcul normal (avec usure). */
const VALEUR_DIVINE = 10;
const armureDivine = fiche => !!fiche.armureEquipee && valeurArmure(fiche) === VALEUR_DIVINE;
const protectionSUse = fiche => !armureDivine(fiche) || !!fiche.usureAutorisee[fiche.armureEquipee];

// Max de protection donné par l'armure équipée (0 sans armure)
const protectionArmure = fiche => trouverArmure(fiche.armureEquipee)?.protection ?? 0;
