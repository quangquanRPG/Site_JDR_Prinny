/* ================================================================
   RÈGLES — armures = objets uniques portés par le personnage
   Chaque armure est un objet à part (comme en programmation objet) :
     { id, nom, protection (max), actuel (Protection actuelle = son usure),
       valeur, detail (description), usureAutorisee (armure divine) }
   Dans le site, cette liste vient du serveur (objets portés, voir integration/objets.js) ;
   la fiche ouverte seule utilise les exemples ci-dessous.
   L'usure reste attachée à l'armure : on peut en changer sans rien perdre.
   ================================================================ */
"use strict";

const CATALOGUE_ARMURES = [
  { id: "cuir",   nom: "Armure de cuir",        protection: 10,  actuel: 10,  valeur: 2,  detail: "" },
  { id: "maille", nom: "Cotte de mailles",      protection: 40,  actuel: 32,  valeur: 4,  detail: "Bosselée sur l'épaule gauche." },
  { id: "robe",   nom: "Robe ténébreuse",       protection: 0,   actuel: 0,   valeur: 1,  detail: "" },
  { id: "egide",  nom: "Égide des Anciens",     protection: 100, actuel: 100, valeur: 10, detail: "Forgée par les dieux.", usureAutorisee: false },
];
const trouverArmure = id => CATALOGUE_ARMURES.find(a => a.id === id) ?? null;

// Valeur de l'armure équipée (0 sans armure)
const valeurArmure = fiche => trouverArmure(fiche.armureEquipee)?.valeur ?? 0;

/* ARMURE DIVINE — valeur exactement 10 : résistance créée par les dieux.
   Tant que l'usure est bloquée : la Protection ne bouge pas et les dégâts sont
   simplement divisés par 10 (120 dégâts → 12 PV), rien de plus.
   Si le MJ autorise l'usure (usureAutorisee de l'objet), le calcul normal s'applique.
   Un métal de valeur plus haute suit toujours le calcul normal (avec usure). */
const VALEUR_DIVINE = 10;
const armureDivine = fiche => !!fiche.armureEquipee && valeurArmure(fiche) === VALEUR_DIVINE;
const protectionSUse = fiche => !armureDivine(fiche) || !!trouverArmure(fiche.armureEquipee)?.usureAutorisee;

// Max de protection donné par l'armure équipée (0 sans armure)
const protectionArmure = fiche => trouverArmure(fiche.armureEquipee)?.protection ?? 0;

// Protection actuelle de l'armure équipée (son usure, gardée par l'objet)
const protectionActuelleArmure = fiche => trouverArmure(fiche.armureEquipee)?.actuel ?? 0;

// La jauge Protection reflète l'armure équipée : on recopie son état dans l'objet
// (appelé avant chaque affichage : dégâts, réparation, changement d'armure)
function synchroniserArmureEquipee(fiche) {
  const a = trouverArmure(fiche.armureEquipee);
  if (a) a.actuel = Math.max(0, Math.min(a.protection, fiche.ressources.protection.actuel));
}
