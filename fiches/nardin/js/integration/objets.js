/* ================================================================
   INTÉGRATION — objets uniques portés (armures et armes)
   Le site envoie les objets portés par le personnage (avec jdr:charger / jdr:maj) ;
   ils remplacent les exemples (regles/armures.js, regles/armes.js).
   Chaque objet garde son état, même quand il change de porteur :
     armure → Protection actuelle (usure) et usure autorisée (armure divine) ;
     arme   → forme en cours (1 ou 2).
   Quand cet état change dans la fiche, elle prévient le site (jdr:objet)
   qui l'enregistre dans l'onglet « Objets » du Google Sheet.
   ================================================================ */
"use strict";

let objetsConnus = {};   // dernier état reçu du site / envoyé au site : { id: { actuel, usureAutorisee } | { forme } }

// De quoi est faite une armure (métal · rareté · pièces), d'après les Données du RP
function ingredientsArmure(o) {
  const d = donneesRpFiche;
  const m = (d.materiaux || []).find(x => x.id === o.materiau);
  const r = (d.raretes || []).find(x => x.id === o.rarete);
  const pieces = (d.typesArmure || []).filter(p => (o.pieces || []).includes(p.id)).map(p => p.nom);
  return [m?.nom, r?.nom, pieces.join(", ")].filter(Boolean).join(" · ");
}
const texteRoll = degats => (degats ? "Roll " + degats : "");

function appliquerObjets(liste) {
  const tous = Array.isArray(liste) ? liste : [];
  CATALOGUE_ARMURES.splice(0, CATALOGUE_ARMURES.length, ...tous.filter(o => (o.type || "armure") === "armure").map(o => ({
    id: o.id, nom: o.nom,
    detail: [ingredientsArmure(o), o.description].filter(Boolean).join(" — "),
    protection: Math.max(0, Number(o.protectionMax) || 0),
    actuel: Math.max(0, Math.min(Number(o.protectionMax) || 0, Number(o.protectionActuelle) || 0)),
    valeur: Number(o.valeur) || 0,
    usureAutorisee: !!o.usureAutorisee,
  })));
  CATALOGUE_ARMES.splice(0, CATALOGUE_ARMES.length, ...tous.filter(o => o.type === "arme").map(o => ({
    id: o.id, nom: o.nom, deuxMains: !!o.deuxMains,
    detail: texteRoll(o.degats), description: o.description || "",
    forme2: o.forme2 ? {
      nom: o.forme2.nom, deuxMains: !!o.forme2.deuxMains,
      detail: texteRoll(o.forme2.degats), description: o.forme2.description || "",
    } : null,
    forme: o.forme2 && Number(o.forme) === 2 ? 2 : 1,
  })));
  objetsConnus = Object.fromEntries([
    ...CATALOGUE_ARMURES.map(a => [a.id, { actuel: a.actuel, usureAutorisee: !!a.usureAutorisee }]),
    ...CATALOGUE_ARMES.map(a => [a.id, { forme: a.forme }]),
  ]);
}

// Changements à envoyer au site depuis le dernier envoi : [{ objet, protectionActuelle?, usureAutorisee?, forme? }]
function objetsModifies() {
  const changes = [];
  for (const a of CATALOGUE_ARMURES) {
    const avant = objetsConnus[a.id];
    if (!avant) continue;
    const c = { objet: a.id };
    if (a.actuel !== avant.actuel) c.protectionActuelle = a.actuel;
    if (!!a.usureAutorisee !== avant.usureAutorisee) c.usureAutorisee = !!a.usureAutorisee;
    if (Object.keys(c).length > 1) {
      changes.push(c);
      objetsConnus[a.id] = { actuel: a.actuel, usureAutorisee: !!a.usureAutorisee };
    }
  }
  for (const a of CATALOGUE_ARMES) {
    const avant = objetsConnus[a.id];
    if (!avant || avant.forme === a.forme) continue;
    changes.push({ objet: a.id, forme: a.forme });
    objetsConnus[a.id] = { forme: a.forme };
  }
  return changes;
}
