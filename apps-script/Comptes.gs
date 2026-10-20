      // ─────────────────────────────────────────────────────────────
//  Comptes : inscription, connexion, déconnexion
// ─────────────────────────────────────────────────────────────

function inscription(req) {
  if (!INSCRIPTION_OUVERTE) return { ok: false, erreur: 'Les inscriptions sont fermées. Demande au MJ de créer ton compte.' };
  const pseudo = String(req.pseudo || '').trim();
  const err = erreurPseudo(pseudo);
  if (err) return { ok: false, erreur: err };
  if (!estEmpreinte(req.empreinte)) return { ok: false, erreur: 'Mot de passe invalide.' };

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuille();
    if (trouver(f, pseudo)) return { ok: false, erreur: 'Ce pseudo est déjà pris.' };

    const sel = Utilities.getUuid();
    const role = req.role === 'MJ' ? 'MJ' : 'Joueur'; // choisi à la création du compte
    const maintenant = new Date();
    f.appendRow([pseudo, hacher(sel + ':' + req.empreinte), sel, role, maintenant, maintenant]);
    return ouvrirSession(pseudo, role, req.rester);
  } finally {
    verrou.releaseLock();
  }
}

function connexion(req) {
  const pseudo = String(req.pseudo || '').trim();
  if (!pseudo || !estEmpreinte(req.empreinte)) return { ok: false, erreur: 'Pseudo ou mot de passe incorrect.' };

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuille();
    const c = trouver(f, pseudo);
    if (!c) return { ok: false, erreur: 'Pseudo ou mot de passe incorrect.' };

    let nouveau = false;
    if (!c.empreinte) {
      // Empreinte vide dans le Sheet = compte pré-créé par le MJ ou mot de passe réinitialisé :
      // le mot de passe saisi maintenant devient le nouveau mot de passe.
      const sel = Utilities.getUuid();
      f.getRange(c.ligne, COL.EMPREINTE, 1, 2).setValues([[hacher(sel + ':' + req.empreinte), sel]]);
      nouveau = true;
    } else if (hacher(c.sel + ':' + req.empreinte) !== c.empreinte) {
      Utilities.sleep(400); // ralentit un peu les essais en rafale
      return { ok: false, erreur: 'Pseudo ou mot de passe incorrect.' };
    }

    f.getRange(c.ligne, COL.DERNIERE).setValue(new Date());
    if (!c.role) f.getRange(c.ligne, COL.ROLE).setValue('Joueur');
    const rep = ouvrirSession(c.pseudo, c.role || 'Joueur', req.rester);
    rep.nouveau = nouveau;
    return rep;
  } finally {
    verrou.releaseLock();
  }
}

function moi(req) {
  const c = compteConnecte(req); // relit le Sheet : un changement de rôle s'applique tout de suite
  if (!c) return SESSION_EXPIREE;
  return { ok: true, pseudo: c.pseudo, role: c.role || 'Joueur' };
}

function compteConnecte(req) {
  const s = lireSession(req.jeton);
  return s ? trouver(feuille(), s.pseudo) : null;
}

function deconnexion(req) {
  if (estJeton(req.jeton)) PropertiesService.getScriptProperties().deleteProperty('s_' + req.jeton);
  return { ok: true };
}
