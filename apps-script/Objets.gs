// ─────────────────────────────────────────────────────────────
//  Objets uniques d'un JDR : armures et armes
//  Chaque objet est une ligne de l'onglet « Objets », avec son propre état (comme un objet en programmation) :
//    - armure : métal, rareté et pièces choisis à la création ; Protection max calculée par le site
//      (somme des pièces × valeur du métal × multiplicateur de rareté, avec les Données du RP) ;
//      Protection actuelle (son usure) ; valeur (= valeur du métal) ; usure autorisée (armure divine) ;
//    - arme : roll, à deux mains, 2e forme facultative, forme en cours (1 ou 2).
//  L'objet garde cet état quand il change de porteur (un personnage du JDR, ou personne).
//    - Le MJ du JDR crée, modifie, attribue et supprime les objets (page du JDR, tuile « Objets uniques »).
//    - Depuis la fiche, le MJ et le joueur du porteur changent la Protection actuelle (usure, réparation)
//      et la forme d'une arme ; seul le MJ autorise l'usure d'une armure divine.
//    - Les objets portés sont envoyés avec la fiche (action « fiche »), compagnons compris.
//  Colonne « Détails » : JSON des champs propres au type (voir detailsObjet).
// ─────────────────────────────────────────────────────────────

const TYPES_OBJET = ['armure', 'arme'];

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
  // Onglet créé avant l'ajout des armes : on ajoute la colonne « Détails »
  if (String(f.getRange(1, COL_OBJET.DETAILS).getValue()) === '') {
    f.getRange(1, COL_OBJET.DETAILS).setValue(ENTETES_OBJETS[COL_OBJET.DETAILS - 1]).setFontWeight('bold').setBackground('#efe3c6');
    f.getRange(1, COL_OBJET.DETAILS, f.getMaxRows(), 1).setNumberFormat('@');
  }
  return f;
}

function lireDetails(texte) {
  try {
    const d = JSON.parse(String(texte || '') || '{}');
    return d && typeof d === 'object' ? d : {};
  } catch (e) {
    return {};
  }
}

function lignesObjets() {
  const f = feuilleObjets();
  const n = f.getLastRow() - 1;
  if (n < 1) return [];
  return f.getRange(2, 1, n, ENTETES_OBJETS.length).getValues().map(function (l, i) {
    const max = Math.max(0, Number(l[5]) || 0);
    return {
      ligne: i + 2, id: String(l[0]), jdr: String(l[1]),
      type: TYPES_OBJET.indexOf(String(l[2])) >= 0 ? String(l[2]) : 'armure',
      nom: String(l[3]), description: String(l[4]),
      protectionMax: max, protectionActuelle: Math.max(0, Math.min(max, Number(l[6]) || 0)),
      valeur: Math.max(0, Number(l[7]) || 0), porteur: String(l[8] || ''),
      usureAutorisee: l[9] === true || String(l[9]).toUpperCase() === 'TRUE',
      cree: l[10],
      details: lireDetails(l[11]),
    };
  });
}

// Champs propres au type, remis dans une forme sûre
function detailsObjet(type, d) {
  d = d && typeof d === 'object' ? d : {};
  const t = function (v, max) { return String(v == null ? '' : v).trim().slice(0, max); };
  if (type === 'arme') {
    const f2 = d.forme2 && typeof d.forme2 === 'object' ? d.forme2 : null;
    const forme2 = f2 && t(f2.nom, 60)
      ? { nom: t(f2.nom, 60), degats: t(f2.degats, 60), deuxMains: f2.deuxMains === true, description: t(f2.description, 300) }
      : null;
    return { degats: t(d.degats, 60), deuxMains: d.deuxMains === true, forme2: forme2, forme: forme2 && Number(d.forme) === 2 ? 2 : 1 };
  }
  return {
    materiau: t(d.materiau, 40), rarete: t(d.rarete, 40),
    pieces: Array.isArray(d.pieces) ? d.pieces.map(function (p) { return t(p, 40); }).filter(String).slice(0, 30) : [],
  };
}

function objetPublic(o) {
  const base = { id: o.id, type: o.type, nom: o.nom, description: o.description, porteur: o.porteur };
  const d = detailsObjet(o.type, o.details);
  if (o.type === 'arme') return Object.assign(base, d);
  return Object.assign(base, d, {
    protectionMax: o.protectionMax, protectionActuelle: o.protectionActuelle,
    valeur: o.valeur, usureAutorisee: o.usureAutorisee,
  });
}

function objetsDuJdr(jdrId) {
  return lignesObjets().filter(function (o) { return o.jdr === jdrId; }).map(objetPublic);
}
function objetsPortes(persoId) {
  return lignesObjets().filter(function (o) { return o.porteur && o.porteur === persoId; }).map(objetPublic);
}

// Le MJ crée (sans id) ou modifie (avec id) un objet de son JDR. Le type ne change pas après la création.
function enregistrerObjet(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const j = trouverJdr(req.jdr, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };
  const o = req.objet && typeof req.objet === 'object' ? req.objet : null;
  if (!o) return { ok: false, erreur: 'Objet illisible.' };

  const nom = String(o.nom || '').trim().replace(/\s+/g, ' ');
  const description = String(o.description || '').trim();
  if (nom.length < 1 || nom.length > 60) return { ok: false, erreur: "Le nom de l'objet doit faire entre 1 et 60 caractères." };
  if (description.length > 300) return { ok: false, erreur: 'La description est limitée à 300 caractères.' };
  const porteur = String(o.porteur || '');
  if (porteur && !lignesPersos().some(function (p) { return p.id === porteur && p.jdr === j.id; })) {
    return { ok: false, erreur: "Ce personnage ne fait pas partie du JDR." };
  }

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuilleObjets();
    const ex = o.id ? lignesObjets().find(function (x) { return x.id === String(o.id) && x.jdr === j.id; }) : null;
    if (o.id && !ex) return { ok: false, erreur: 'Objet introuvable.' };
    const type = ex ? ex.type : (TYPES_OBJET.indexOf(String(o.type)) >= 0 ? String(o.type) : 'armure');
    const details = detailsObjet(type, o);
    if (type === 'arme' && o.forme2 && !details.forme2) return { ok: false, erreur: 'La 2e forme doit avoir un nom.' };

    let max = 0, actuelle = 0, valeur = 0;
    if (type === 'armure') {
      max = Math.round(Number(o.protectionMax));
      valeur = Number(o.valeur);
      if (!isFinite(max) || max < 0 || max > 100000) return { ok: false, erreur: 'Protection max invalide.' };
      if (!isFinite(valeur) || valeur < 0 || valeur > 1000) return { ok: false, erreur: 'Valeur invalide.' };
      actuelle = o.protectionActuelle === undefined || o.protectionActuelle === '' ? max
        : Math.max(0, Math.min(max, Math.round(Number(o.protectionActuelle) || 0)));
    }

    const valeurs = [texteSur(nom), texteSur(description), max, actuelle, valeur, porteur];
    const texteDetails = JSON.stringify(details);
    if (ex) {
      f.getRange(ex.ligne, COL_OBJET.NOM, 1, valeurs.length).setValues([valeurs]);
      f.getRange(ex.ligne, COL_OBJET.DETAILS).setValue(texteDetails);
      Object.assign(ex, { nom: nom, description: description, protectionMax: max, protectionActuelle: actuelle, valeur: valeur, porteur: porteur, details: details });
      return { ok: true, objet: objetPublic(ex), objets: objetsDuJdr(j.id) };
    }
    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    f.appendRow([id, j.id, type].concat(valeurs, [false, new Date(), texteDetails]));
    return {
      ok: true,
      objet: objetPublic({ id: id, type: type, nom: nom, description: description, protectionMax: max, protectionActuelle: actuelle, valeur: valeur, porteur: porteur, usureAutorisee: false, details: details }),
      objets: objetsDuJdr(j.id),
    };
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

// Depuis la fiche (id = personnage porteur), MJ ou joueur du personnage :
//   armure : Protection actuelle (usure, réparation) ; usure divine autorisée (MJ seulement)
//   arme   : forme en cours (1 ou 2)
function modifierObjet(req) {
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const a = accesPerso(req);   // MJ du JDR ou joueur du personnage (pas la lecture)
    if (a.refus) return a.refus;
    const ex = lignesObjets().find(function (x) { return x.id === String(req.objet || '') && x.porteur === a.perso.id; });
    if (!ex) return { ok: false, erreur: "Cet objet n'est pas porté par ce personnage." };
    const f = feuilleObjets();
    if (req.protectionActuelle !== undefined && ex.type === 'armure') {
      ex.protectionActuelle = Math.max(0, Math.min(ex.protectionMax, Math.round(Number(req.protectionActuelle) || 0)));
      f.getRange(ex.ligne, COL_OBJET.PROTECTION_ACTUELLE).setValue(ex.protectionActuelle);
    }
    if (req.usureAutorisee !== undefined && ex.type === 'armure') {
      if (a.acces !== 'mj') return { ok: false, erreur: "Seul le MJ peut autoriser l'usure d'une armure divine." };
      ex.usureAutorisee = req.usureAutorisee === true;
      f.getRange(ex.ligne, COL_OBJET.USURE).setValue(ex.usureAutorisee);
    }
    if (req.forme !== undefined) {
      if (ex.type !== 'arme') return { ok: false, erreur: 'Seule une arme change de forme.' };
      const d = detailsObjet('arme', ex.details);
      if (!d.forme2) return { ok: false, erreur: "Cette arme n'a qu'une forme." };
      d.forme = Number(req.forme) === 2 ? 2 : 1;
      ex.details = d;
      f.getRange(ex.ligne, COL_OBJET.DETAILS).setValue(JSON.stringify(d));
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
