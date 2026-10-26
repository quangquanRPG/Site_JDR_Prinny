// ─────────────────────────────────────────────────────────────
//  Images de personnage, rangées dans un dossier de ton Google Drive
//  (« Grimoire des Aventuriers — Images », créé tout seul).
//  Les fichiers restent PRIVÉS : le site les lit à travers ce script, avec les mêmes
//  droits que la fiche (MJ du JDR, joueur du personnage, compagnons en lecture).
//  Seuls le MJ du JDR et le joueur du personnage peuvent changer ou retirer l'image.
//  La colonne « Image » de l'onglet Personnages garde l'identifiant du fichier.
// ─────────────────────────────────────────────────────────────

/** À lancer une fois depuis l'éditeur (▶ Exécuter) : Google demande l'accès au Drive. */
function autoriserDrive() {
  const d = dossierImages();
  SpreadsheetApp.getActiveSpreadsheet().toast('Accès au Drive autorisé : dossier « ' + d.getName() + ' » prêt.');
}

function dossierImages() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('DOSSIER_IMAGES');
  if (id) {
    try {
      const d = DriveApp.getFolderById(id);
      if (!d.isTrashed()) return d;
    } catch (e) { /* dossier supprimé : on en recrée un */ }
  }
  const d = DriveApp.createFolder(DOSSIER_IMAGES);
  props.setProperty('DOSSIER_IMAGES', d.getId());
  return d;
}

// Image d'un personnage (accès « lecture » compris) : { ok, image: id | null, type, donnees: base64 }
function voirImage(req) {
  const a = accesPerso(req, true);
  if (a.refus) return a.refus;
  if (!a.perso.image) return { ok: true, image: null };
  try {
    const blob = DriveApp.getFileById(a.perso.image).getBlob();
    return { ok: true, image: a.perso.image, type: blob.getContentType(), donnees: Utilities.base64Encode(blob.getBytes()) };
  } catch (e) {
    return { ok: true, image: null, erreur: 'Image introuvable dans le Drive.' };
  }
}

// Remplace l'image du personnage : { jeton, id, type, donnees (base64) }
function envoyerImage(req) {
  const ext = TYPES_IMAGE[String(req.type || '')];
  if (!ext) return { ok: false, erreur: 'Format d\'image non pris en charge (JPEG, PNG, WebP ou GIF).' };
  if (typeof req.donnees !== 'string' || !req.donnees) return { ok: false, erreur: 'Image vide.' };
  if (req.donnees.length > Math.ceil(TAILLE_MAX_IMAGE / 3) * 4 + 4) return { ok: false, erreur: 'Image trop lourde (8 Mo au plus).' };
  const avant = accesPerso(req);   // vérifié avant d'écrire dans le Drive
  if (avant.refus) return avant.refus;

  let octets;
  try { octets = Utilities.base64Decode(req.donnees); } catch (e) { return { ok: false, erreur: 'Image illisible.' }; }
  if (octets.length > TAILLE_MAX_IMAGE) return { ok: false, erreur: 'Image trop lourde (8 Mo au plus).' };
  const fichier = dossierImages().createFile(Utilities.newBlob(octets, req.type, 'perso-' + req.id + '-' + Date.now() + '.' + ext));

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  let ancienne = '';
  try {
    const a = accesPerso(req);   // relu sous verrou : la ligne ne peut pas bouger entre-temps
    if (a.refus) { fichier.setTrashed(true); return a.refus; }
    ancienne = a.perso.image;
    feuillePersos().getRange(a.perso.ligne, COL_PERSO.IMAGE).setValue(fichier.getId());
  } finally {
    verrou.releaseLock();
  }
  mettreImageALaCorbeille(ancienne);
  return { ok: true, image: fichier.getId() };
}

function retirerImage(req) {
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  let ancienne = '';
  try {
    const a = accesPerso(req);
    if (a.refus) return a.refus;
    ancienne = a.perso.image;
    feuillePersos().getRange(a.perso.ligne, COL_PERSO.IMAGE).setValue('');
  } finally {
    verrou.releaseLock();
  }
  mettreImageALaCorbeille(ancienne);
  return { ok: true, image: null };
}

// Met l'ancien fichier à la corbeille du Drive (récupérable 30 jours)
function mettreImageALaCorbeille(id) {
  if (!id) return;
  try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* déjà supprimé */ }
}
