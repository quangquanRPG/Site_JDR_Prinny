// ─────────────────────────────────────────────────────────────
//  JDR (réservé aux MJ) : liste, création, page d'un JDR, type de fiche, Données du RP
// ─────────────────────────────────────────────────────────────

function mesJdr(req) {
  const c = compteConnecte(req);
  if (!c) return SESSION_EXPIREE;
  if (c.role !== 'MJ') return { ok: false, erreur: 'Réservé au maître du jeu.' };

  const f = feuilleJdr();
  const n = f.getLastRow() - 1;
  const liste = [];
  if (n > 0) {
    f.getRange(2, 1, n, ENTETES_JDR.length).getValues().forEach(function (l) {
      if (String(l[3]).trim().toLowerCase() !== c.pseudo.toLowerCase()) return;
      liste.push({
        id: String(l[0]),
        nom: String(l[1]),
        description: String(l[2]),
        cree: l[4] instanceof Date ? l[4].toISOString() : String(l[4]),
      });
    });
  }
  return { ok: true, jdr: liste.reverse() }; // le plus récent en premier
}

function creerJdr(req) {
  const c = compteConnecte(req);
  if (!c) return SESSION_EXPIREE;
  if (c.role !== 'MJ') return { ok: false, erreur: 'Seul un maître du jeu peut créer un JDR.' };

  const nom = String(req.nom || '').trim().replace(/\s+/g, ' ');
  const description = String(req.description || '').trim();
  if (nom.length < 2 || nom.length > 60) return { ok: false, erreur: 'Le nom doit faire entre 2 et 60 caractères.' };
  if (description.length > 300) return { ok: false, erreur: 'La description est limitée à 300 caractères.' };

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuilleJdr();
    const n = f.getLastRow() - 1;
    if (n > 0) {
      const doublon = f.getRange(2, 2, n, 3).getValues().some(function (l) {
        return String(l[0]).trim().toLowerCase() === nom.toLowerCase()
            && String(l[2]).trim().toLowerCase() === c.pseudo.toLowerCase();
      });
      if (doublon) return { ok: false, erreur: 'Tu as déjà un JDR avec ce nom.' };
    }
    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    const maintenant = new Date();
    f.appendRow([id, texteSur(nom), texteSur(description), c.pseudo, maintenant]);
    return { ok: true, jdr: { id: id, nom: nom, description: description, cree: maintenant.toISOString() } };
  } finally {
    verrou.releaseLock();
  }
}

function voirJdr(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const j = trouverJdr(req.id, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };
  return { ok: true, jdr: jdrPublic(j), personnages: lirePersos(j.id) };
}

function choisirFiche(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const type = String(req.typeFiche || '');
  if (type && !/^[a-z0-9_-]{1,40}$/.test(type)) return { ok: false, erreur: 'Type de fiche invalide.' };
  const j = trouverJdr(req.id, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };
  feuilleJdr().getRange(j.ligne, COL_JDR.TYPE_FICHE).setValue(type);
  return { ok: true, typeFiche: type };
}

// Le MJ du JDR enregistre ses listes (métaux, raretés, types d'armure, armes, sets d'armure)
function enregistrerDonneesRp(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const d = req.donneesRp;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, erreur: 'Données illisibles.' };
  const texte = JSON.stringify(d);
  if (texte.length > TAILLE_MAX_FICHE) return { ok: false, erreur: 'Trop de données pour une cellule du Google Sheet.' };
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const j = trouverJdr(req.id, m.compte.pseudo);
    if (!j) return { ok: false, erreur: 'JDR introuvable.' };
    feuilleJdr().getRange(j.ligne, COL_JDR.DONNEES_RP).setValue(texte);
    return { ok: true };
  } finally {
    verrou.releaseLock();
  }
}

function mjConnecte(req) {
  const c = compteConnecte(req);
  if (!c) return { refus: SESSION_EXPIREE };
  if (c.role !== 'MJ') return { refus: { ok: false, erreur: 'Réservé au maître du jeu.' } };
  return { compte: c };
}

// JDR par son id, quel que soit son MJ
function lireJdr(id) {
  id = String(id || '');
  if (!/^[0-9a-f]{8}$/.test(id)) return null;
  const f = feuilleJdr();
  const n = f.getLastRow() - 1;
  if (n < 1) return null;
  const lignes = f.getRange(2, 1, n, ENTETES_JDR.length).getValues();
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    if (String(l[0]) !== id) continue;
    return { ligne: i + 2, id: id, nom: String(l[1]), description: String(l[2]), mj: String(l[3]).trim(), cree: l[4], typeFiche: String(l[5] || ''), donneesRp: String(l[6] || '') };
  }
  return null;
}

// JDR seulement s'il appartient à ce MJ
function trouverJdr(id, pseudoMj) {
  const j = lireJdr(id);
  return j && j.mj.toLowerCase() === String(pseudoMj).toLowerCase() ? j : null;
}

function jdrPublic(j) {
  return {
    id: j.id, nom: j.nom, description: j.description, typeFiche: j.typeFiche,
    cree: j.cree instanceof Date ? j.cree.toISOString() : String(j.cree),
    donneesRp: lireJson(j.donneesRp),   // null tant que le MJ n'a rien enregistré
  };
}
