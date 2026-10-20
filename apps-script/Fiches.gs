// ─────────────────────────────────────────────────────────────
//  Fiches perso : le MJ du JDR et le joueur du personnage peuvent les ouvrir et les modifier
// ─────────────────────────────────────────────────────────────

function ouvrirFiche(req) {
  const a = accesPerso(req);
  if (a.refus) return a.refus;
  let donnees = null;
  if (a.perso.fiche) {
    try { donnees = JSON.parse(a.perso.fiche); } catch (e) { donnees = null; }
  }
  return { ok: true, acces: a.acces, perso: persoPublic(a.perso), jdr: jdrPublic(a.jdr), fiche: donnees };
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

function accesPerso(req) {
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
  if (!acces) return { refus: { ok: false, erreur: "Tu n'as pas accès à cette fiche." } };
  return { compte: c, perso: p, jdr: j, acces: acces };
}
