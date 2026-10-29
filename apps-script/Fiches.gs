// ─────────────────────────────────────────────────────────────
//  Fiches perso : le MJ du JDR et le joueur du personnage peuvent les ouvrir et les modifier.
//  Les autres joueurs du même JDR peuvent ouvrir les fiches des personnages joueurs
//  en lecture seule (accès « lecture »), sans les objets cachés.
// ─────────────────────────────────────────────────────────────

function ouvrirFiche(req) {
  const a = accesPerso(req, true);
  if (a.refus) return a.refus;
  let donnees = null;
  if (a.perso.fiche) {
    try { donnees = JSON.parse(a.perso.fiche); } catch (e) { donnees = null; }
  }
  if (a.acces === 'lecture') donnees = sansObjetsCaches(donnees);
  return { ok: true, acces: a.acces, perso: persoPublic(a.perso), jdr: jdrPublic(a.jdr), fiche: donnees,
           objets: objetsPortes(a.perso.id) };   // objets uniques portés (armures), voir Objets.gs
}

function enregistrerFiche(req) {
  if (!req.fiche || typeof req.fiche !== 'object' || Array.isArray(req.fiche)) return { ok: false, erreur: 'Fiche illisible.' };
  const texte = JSON.stringify(req.fiche);
  if (texte.length > TAILLE_MAX_FICHE) return { ok: false, erreur: 'Fiche trop volumineuse pour le Google Sheet.' };

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const a = accesPerso(req); // relu sous verrou : la ligne ne peut pas bouger entre-temps
    if (a.refus) return a.refus;
    const f = feuillePersos();
    f.getRange(a.perso.ligne, COL_PERSO.FICHE).setValue(texte);

    // Le MJ peut renommer le personnage depuis la fiche
    let nom = a.perso.nom;
    const nouveauNom = String(req.fiche.nom || '').trim();
    if (a.acces === 'mj' && nouveauNom && nouveauNom.length <= 60 && nouveauNom !== nom) {
      f.getRange(a.perso.ligne, COL_PERSO.NOM).setValue(texteSur(nouveauNom));
      nom = nouveauNom;
    }
    return { ok: true, nom: nom };
  } finally {
    verrou.releaseLock();
  }
}

// Retire les objets cachés des inventaires avant d'envoyer la fiche à un autre joueur
function sansObjetsCaches(donnees) {
  if (!donnees || typeof donnees !== 'object') return donnees;
  INVENTAIRES_FICHE.forEach(function (cle) {
    const inv = donnees[cle];
    if (inv && Array.isArray(inv.objets)) inv.objets = inv.objets.filter(function (o) { return !(o && o.cache); });
  });
  return donnees;
}

// lecture = true : un autre joueur du même JDR peut aussi ouvrir la fiche d'un PJ (accès « lecture »)
function accesPerso(req, lecture) {
  const c = compteConnecte(req);
  if (!c) return { refus: SESSION_EXPIREE };
  const p = trouverPerso(req.id);
  if (!p) return { refus: { ok: false, erreur: 'Personnage introuvable.' } };
  const j = lireJdr(p.jdr);
  if (!j) return { refus: { ok: false, erreur: 'JDR introuvable.' } };
  const moi = c.pseudo.toLowerCase();
  let acces = null;
  if (c.role === 'MJ' && j.mj.toLowerCase() === moi) acces = 'mj';
  else if (p.type === 'PJ' && p.joueur.toLowerCase() === moi) acces = 'joueur';
  else if (lecture && p.type === 'PJ' && aUnPersoDansLeJdr(moi, j.id)) acces = 'lecture';
  if (!acces) return { refus: { ok: false, erreur: "Tu n'as pas accès à cette fiche." } };
  return { compte: c, perso: p, jdr: j, acces: acces };
}

// Le compte a-t-il au moins un personnage joueur dans ce JDR ?
function aUnPersoDansLeJdr(pseudoMinuscules, jdrId) {
  return lignesPersos().some(function (p) {
    return p.jdr === jdrId && p.type === 'PJ' && p.joueur.toLowerCase() === pseudoMinuscules;
  });
}
