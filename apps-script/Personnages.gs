// ─────────────────────────────────────────────────────────────
//  Personnages : ajout, suppression, liste des joueurs, « Mes personnages »
// ─────────────────────────────────────────────────────────────

function listeJoueurs(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const f = feuille();
  const n = f.getLastRow() - 1;
  const joueurs = [];
  if (n > 0) {
    f.getRange(2, 1, n, 4).getValues().forEach(function (l) {
      const pseudo = String(l[0]).trim();
      if (pseudo && String(l[3]).trim() !== 'MJ') joueurs.push(pseudo);
    });
  }
  joueurs.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  return { ok: true, joueurs: joueurs };
}

function ajouterPerso(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const j = trouverJdr(req.jdr, m.compte.pseudo);
  if (!j) return { ok: false, erreur: 'JDR introuvable.' };

  const nom = String(req.nom || '').trim();
  const type = req.type === 'PJ' ? 'PJ' : req.type === 'PNJ' ? 'PNJ' : '';
  const notes = String(req.notes || '').trim();
  if (nom.length < 1 || nom.length > 60) return { ok: false, erreur: 'Le nom du personnage doit faire entre 1 et 60 caractères.' };
  if (!type) return { ok: false, erreur: 'Type de personnage inconnu.' };
  if (notes.length > 500) return { ok: false, erreur: 'Les notes sont limitées à 500 caractères.' };

  let joueur = '';
  if (type === 'PJ') {
    const cj = trouver(feuille(), String(req.joueur || ''));
    if (!cj || cj.role === 'MJ') return { ok: false, erreur: "Ce joueur n'existe pas." };
    joueur = cj.pseudo;
  }

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    const maintenant = new Date();
    feuillePersos().appendRow([id, j.id, texteSur(nom), type, joueur, texteSur(notes), maintenant, '']);
    return { ok: true, perso: { id: id, jdr: j.id, nom: nom, type: type, joueur: joueur, notes: notes, cree: maintenant.toISOString() } };
  } finally {
    verrou.releaseLock();
  }
}

function supprimerPerso(req) {
  const m = mjConnecte(req);
  if (m.refus) return m.refus;
  const id = String(req.id || '');
  if (!/^[0-9a-f]{8}$/.test(id)) return { ok: false, erreur: 'Personnage introuvable.' };

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuillePersos();
    const n = f.getLastRow() - 1;
    if (n < 1) return { ok: false, erreur: 'Personnage introuvable.' };
    const lignes = f.getRange(2, 1, n, ENTETES_PERSOS.length).getValues();
    for (let i = 0; i < lignes.length; i++) {
      if (String(lignes[i][0]) !== id) continue;
      // Le MJ ne peut supprimer que les personnages de ses propres JDR
      if (!trouverJdr(String(lignes[i][1]), m.compte.pseudo)) return { ok: false, erreur: 'Ce personnage ne fait pas partie de tes JDR.' };
      f.deleteRow(i + 2);
      mettreImageALaCorbeille(String(lignes[i][COL_PERSO.IMAGE - 1] || ''));
      return { ok: true };
    }
    return { ok: false, erreur: 'Personnage introuvable.' };
  } finally {
    verrou.releaseLock();
  }
}

// Personnages joués par le compte connecté (tous JDR confondus),
// et « compagnons » : les personnages des autres joueurs de ces mêmes JDR (fiches en lecture seule)
function mesPersos(req) {
  const c = compteConnecte(req);
  if (!c) return SESSION_EXPIREE;
  const moi = c.pseudo.toLowerCase();
  const nomsJdr = {};
  const fj = feuilleJdr();
  const n = fj.getLastRow() - 1;
  if (n > 0) fj.getRange(2, 1, n, 2).getValues().forEach(function (l) { nomsJdr[String(l[0])] = String(l[1]); });
  const lignes = lignesPersos();
  const avecJdr = function (p) { const o = persoPublic(p); o.jdrNom = nomsJdr[p.jdr] || 'JDR supprimé'; return o; };
  const miens = lignes.filter(function (p) { return p.type === 'PJ' && p.joueur.toLowerCase() === moi; });
  const mesJdr = {};
  miens.forEach(function (p) { mesJdr[p.jdr] = true; });
  const compagnons = lignes.filter(function (p) {
    return p.type === 'PJ' && mesJdr[p.jdr] && p.joueur.toLowerCase() !== moi;
  });
  return { ok: true, persos: miens.map(avecJdr), compagnons: compagnons.map(avecJdr) };
}

function lirePersos(jdrId) {
  return lignesPersos().filter(function (p) { return p.jdr === jdrId; }).map(persoPublic);
}

function lignesPersos() {
  const f = feuillePersos();
  const n = f.getLastRow() - 1;
  if (n < 1) return [];
  return f.getRange(2, 1, n, ENTETES_PERSOS.length).getValues().map(function (l, i) {
    return {
      ligne: i + 2, id: String(l[0]), jdr: String(l[1]), nom: String(l[2]),
      type: String(l[3]) === 'PJ' ? 'PJ' : 'PNJ', joueur: String(l[4]).trim(), notes: String(l[5]),
      cree: l[6], fiche: String(l[7] || ''), image: String(l[8] || ''),
    };
  });
}

function trouverPerso(id) {
  id = String(id || '');
  if (!/^[0-9a-f]{8}$/.test(id)) return null;
  return lignesPersos().find(function (p) { return p.id === id; }) || null;
}

function persoPublic(p) {
  return {
    id: p.id, jdr: p.jdr, nom: p.nom, type: p.type, joueur: p.joueur, notes: p.notes,
    cree: p.cree instanceof Date ? p.cree.toISOString() : String(p.cree),
    aFiche: !!p.fiche,
    image: p.image || '',   // identifiant du fichier image (lu avec l'action « image »)
  };
}
