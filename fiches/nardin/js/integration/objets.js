/* ================================================================
   INTÉGRATION — objets uniques portés (armures)
   Le site envoie les objets portés par le personnage (avec jdr:charger / jdr:maj) ;
   ils remplacent les armures d'exemple (regles/armures.js).
   Quand l'usure d'une armure change (dégâts, réparation) ou que le MJ autorise l'usure
   d'une armure divine, la fiche prévient le site (jdr:objet) qui l'enregistre
   dans l'onglet « Objets » du Google Sheet.
   ================================================================ */
"use strict";

let objetsConnus = {};   // dernier état envoyé par le site / au site : { id: { actuel, usureAutorisee } }

function appliquerObjets(liste) {
  const armures = (Array.isArray(liste) ? liste : []).filter(o => (o.type || "armure") === "armure");
  CATALOGUE_ARMURES.splice(0, CATALOGUE_ARMURES.length, ...armures.map(o => ({
    id: o.id, nom: o.nom, detail: o.description || "",
    protection: Math.max(0, Number(o.protectionMax) || 0),
    actuel: Math.max(0, Math.min(Number(o.protectionMax) || 0, Number(o.protectionActuelle) || 0)),
    valeur: Number(o.valeur) || 0,
    usureAutorisee: !!o.usureAutorisee,
  })));
  objetsConnus = Object.fromEntries(CATALOGUE_ARMURES.map(a => [a.id, { actuel: a.actuel, usureAutorisee: !!a.usureAutorisee }]));
}

// Changements à envoyer au site depuis le dernier envoi : [{ objet, protectionActuelle?, usureAutorisee? }]
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
  return changes;
}
