/* ================================================================
   ACTIONS — armure équipée et armes (portées, en main)
   Les fonctions d'armes renvoient true si le changement a été fait.
   ================================================================ */
"use strict";

// Équipe une armure portée (ou null pour tout retirer).
// Chaque armure garde son usure : l'ancienne garde sa Protection actuelle,
// la nouvelle arrive avec la sienne (pas remise à neuf).
function equiperArmure(fiche, armureId, u) {
  if (!droits.changerArmure(u, fiche)) throw new Error("Changement d'armure non autorisé.");
  if (armureId !== null && !fiche.armures.includes(armureId)) return;
  synchroniserArmureEquipee(fiche);                 // l'armure retirée garde son usure
  fiche.armureEquipee = armureId;
  const prot = fiche.ressources.protection;
  prot.base = protectionArmure(fiche);
  prot.actuel = protectionActuelleArmure(fiche);
}

function basculerUsure(fiche, u) {
  if (!droits.autoriserUsure(u)) throw new Error("Seul le MJ peut autoriser l'usure d'une armure divine.");
  const a = trouverArmure(fiche.armureEquipee);
  if (!a || !armureDivine(fiche)) return;
  a.usureAutorisee = !a.usureAutorisee;
}

function porterArme(fiche, id, u) {
  if (!droits.changerArmes(u, fiche)) return false;
  if (!fiche.armes.includes(id) || fiche.armesPortees.includes(id)) return false;
  if (fiche.armesPortees.length >= MAX_ARMES_PORTEES) return false;
  fiche.armesPortees.push(id);
  return true;
}
function rangerArme(fiche, id, u) {        // retire de sur soi (et donc des mains)
  if (!droits.changerArmes(u, fiche)) return false;
  fiche.armesPortees = fiche.armesPortees.filter(a => a !== id);
  fiche.armesEnMain  = fiche.armesEnMain.filter(a => a !== id);
  return true;
}
function prendreEnMain(fiche, id, u) {
  if (!droits.changerArmes(u, fiche)) return false;
  if (!fiche.armesPortees.includes(id) || fiche.armesEnMain.includes(id)) return false;
  if (mainsOccupees(fiche) + mainsArme(fiche, id) > NB_MAINS) return false;
  fiche.armesEnMain.push(id);
  return true;
}
// Passe une arme à deux formes de l'une à l'autre (refusé si elle est en main et qu'il manque une main)
function changerFormeArme(fiche, id, u) {
  if (!droits.changerArmes(u, fiche)) return false;
  if (!fiche.armes.includes(id) || !changementFormePossible(fiche, id)) return false;
  if (formeActuelle(fiche, id) === 2) delete fiche.formesArmes[id];
  else fiche.formesArmes[id] = 2;
  return true;
}
function lacherArme(fiche, id, u) {        // reste portée, mais plus en main
  if (!droits.changerArmes(u, fiche)) return false;
  fiche.armesEnMain = fiche.armesEnMain.filter(a => a !== id);
  return true;
}
