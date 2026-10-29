// ─────────────────────────────────────────────────────────────
//  Objets uniques d'un JDR (pour l'instant : les armures)
//  Chaque objet est une ligne de l'onglet « Objets » : il a son propre nom, sa Protection max,
//  sa Protection actuelle (qui garde l'usure), sa valeur, et son porteur (un personnage du JDR,
//  ou personne). Comme un « objet » en programmation : chacun a son état à lui.
//    - Le MJ du JDR crée, modifie, attribue et supprime les objets (page du JDR).
//    - Le MJ et le joueur du porteur peuvent changer la Protection actuelle (usure, réparation)
//      depuis la fiche ; seul le MJ autorise l'usure d'une armure divine.
//    - Les objets portés sont envoyés avec la fiche (action « fiche »), compagnons compris.
// ─────────────────────────────────────────────────────────────

function feuilleObjets() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  let f = classeur.getSheetByName(ONGLET_OBJETS);
  if (!f) {
    f = classeur.insertSheet(ONGLET_OBJETS);
    f.getRange(1, 1, 1, ENTETES_OBJETS.length).setValues([ENTETES_OBJETS]).setFontWeight('bold').setBackground('#efe3c6');
    f.setFrozenRows(1);
    f.getRange('A:E').setNumberFormat('@');
    f.getRange('I:I').setNumberFormat('@');
    f.setColumnWidth(COL_OBJET.NOM, 180);
    f.setColumnWidth(COL_OBJET.DESCRIPTION, 260);
  }
  return f;
}

function lignesObjets() {
  const f = feuilleObjets();
  const n = f.getLastRow() - 1;
  if (n < 1) return [];
  return f.getRange(2, 1, n, ENTETES_OBJETS.length).getValues().map(function (l, i) {
    const max = Math.max(0, Number(l[5]) || 0);
    return {
      ligne: i + 2, id: String(l[0]), jdr: String(l[1]), type: String(l[2]) || 'armure',
      nom: String(l[3]), description: String(l[4]),
      protectionMax: max, protectionActuelle: Math.max(0, Math.min(max, Number(l[6]) || 0)),
      valeur: Math.max(0, Number(l[7]) || 0), porteur: String(l[8] || ''),
      usureAutorisee: l[9] === true || String(l[9]).toUpperCase() === 'TRUE',
      cree: l[10],
    };
  });
}

function objetPublic(o) {
  return {
    id: o.id, type: o.type, nom: o.nom, description: o.description,
    protectionMax: o.protectionMax, protectionActuelle: o.protectionActuelle,
    valeur: o.valeur, porteur: o.porteur, usureAutorisee: o.usureAutorisee,
  };
}

function objetsDuJdr(jdrId) {
  return lignesObjets().filter(function (o) { return o.jdr === jdrId; }).map(objetPublic);
}
function objetsPortes(persoId) {
  return lignesObjets().filter(function (o) { return o.porteur && o.porteur === persoId; }).map(objetPublic);
}

// Le MJ crée (sans id) ou modifie (avec id) un objet de son JDR
function enregistrerObjet(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const j = trouverJdr(req.jdr, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };
  const o = req.objet && typeof req.objet === 'object' ? req.objet : null;
  if (!o) return { ok: false, erreur: 'Objet illisible.' };

  const nom = String(o.nom || '').trim().replace(/\s+/g, ' ');
  const description = String(o.description || '').trim();
  const max = Math.round(Number(o.protectionMax));
  const valeur = Number(o.valeur);
  if (nom.length < 1 || nom.length > 60) return { ok: false, erreur: "Le nom de l'objet doit faire entre 1 et 60 caractères." };
  if (description.length > 300) return { ok: false, erreur: 'La description est limitée à 300 caractères.' };
  if (!isFinite(max) || max < 0 || max > 100000) return { ok: false, erreur: 'Protection max invalide.' };
  if (!isFinite(valeur) || valeur < 0 || valeur > 1000) return { ok: false, erreur: 'Valeur invalide.' };
  const actuelle = o.protectionActuelle === undefined || o.protectionActuelle === '' ? max
    : Math.max(0, Math.min(max, Math.round(Number(o.protectionActuelle) || 0)));
  const porteur = String(o.porteur || '');
  if (porteur && !lignesPersos().some(function (p) { return p.id === porteur && p.jdr === j.id; })) {
    return { ok: false, erreur: "Ce personnage ne fait pas partie du JDR." };
  }

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuilleObjets();
    const valeurs = [texteSur(nom), texteSur(description), max, actuelle, valeur, porteur];
    if (o.id) {
      const ex = lignesObjets().find(function (x) { return x.id === String(o.id) && x.jdr === j.id; });
      if (!ex) return { ok: false, erreur: 'Objet introuvable.' };
      f.getRange(ex.ligne, COL_OBJET.NOM, 1, valeurs.length).setValues([valeurs]);
      return { ok: true, objet: objetPublic(Object.assign(ex, { nom: nom, description: description, protectionMax: max, protectionActuelle: actuelle, valeur: valeur, porteur: porteur })), objets: objetsDuJdr(j.id) };
    }
    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    f.appendRow([id, j.id, 'armure'].concat(valeurs, [false, new Date()]));
    return { ok: true, objet: { id: id, type: 'armure', nom: nom, description: description, protectionMax: max, protectionActuelle: actuelle, valeur: valeur, porteur: porteur, usureAutorisee: false }, objets: objetsDuJdr(j.id) };
  } finally {
    verrou.releaseLock();
  }
}

function supprimerObjet(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const j = trouverJdr(req.jdr, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const ex = lignesObjets().find(function (x) { return x.id === String(req.objet || '') && x.jdr === j.id; });
    if (!ex) return { ok: false, erreur: 'Objet introuvable.' };
    feuilleObjets().deleteRow(ex.ligne);
    return { ok: true, objets: objetsDuJdr(j.id) };
  } finally {
    verrou.releaseLock();
  }
}

// Depuis la fiche (id = personnage porteur) : Protection actuelle (MJ ou joueur), usure divine (MJ)
function modifierObjet(req) {
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const a = accesPerso(req);   // MJ du JDR ou joueur du personnage (pas la lecture)
    if (a.refus) return a.refus;
    const ex = lignesObjets().find(function (x) { return x.id === String(req.objet || '') && x.porteur === a.perso.id; });
    if (!ex) return { ok: false, erreur: "Cet objet n'est pas porté par ce personnage." };
    const f = feuilleObjets();
    if (req.protectionActuelle !== undefined) {
      ex.protectionActuelle = Math.max(0, Math.min(ex.protectionMax, Math.round(Number(req.protectionActuelle) || 0)));
      f.getRange(ex.ligne, COL_OBJET.PROTECTION_ACTUELLE).setValue(ex.protectionActuelle);
    }
    if (req.usureAutorisee !== undefined) {
      if (a.acces !== 'mj') return { ok: false, erreur: "Seul le MJ peut autoriser l'usure d'une armure divine." };
      ex.usureAutorisee = req.usureAutorisee === true;
      f.getRange(ex.ligne, COL_OBJET.USURE).setValue(ex.usureAutorisee);
    }
    return { ok: true, objet: objetPublic(ex) };
  } finally {
    verrou.releaseLock();
  }
}

// Personnage supprimé : ses objets restent dans le JDR, sans porteur
function libererObjets(persoId) {
  const f = feuilleObjets();
  lignesObjets().forEach(function (o) {
    if (o.porteur === persoId) f.getRange(o.ligne, COL_OBJET.PORTEUR).setValue('');
  });
}
