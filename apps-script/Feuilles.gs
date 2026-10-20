// ─────────────────────────────────────────────────────────────
//  Google Sheet : onglets Comptes, JDR, Personnages (créés au besoin)
// ─────────────────────────────────────────────────────────────

function feuille() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  let f = classeur.getSheetByName(ONGLET_COMPTES);
  if (!f) {
    f = classeur.insertSheet(ONGLET_COMPTES);
    f.getRange(1, 1, 1, ENTETES.length).setValues([ENTETES]).setFontWeight('bold').setBackground('#efe3c6');
    f.setFrozenRows(1);
    f.getRange('A:C').setNumberFormat('@');  // texte brut : pas de formule ni de date involontaire
    f.setColumnWidth(COL.EMPREINTE, 160);
    f.setColumnWidth(COL.SEL, 120);
  }
  return f;
}

function feuilleJdr() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  let f = classeur.getSheetByName(ONGLET_JDR);
  if (!f) {
    f = classeur.insertSheet(ONGLET_JDR);
    f.getRange(1, 1, 1, ENTETES_JDR.length).setValues([ENTETES_JDR]).setFontWeight('bold').setBackground('#efe3c6');
    f.setFrozenRows(1);
    f.getRange('A:D').setNumberFormat('@');
    f.getRange('F:G').setNumberFormat('@');
    f.setColumnWidth(2, 200);
    f.setColumnWidth(3, 320);
  }
  if (f.getRange(1, COL_JDR.DONNEES_RP).getValue() === '') {
    // onglet créé par une version précédente : ajoute les en-têtes manquants
    f.getRange(1, 1, 1, ENTETES_JDR.length).setValues([ENTETES_JDR]).setFontWeight('bold').setBackground('#efe3c6');
    f.getRange('F:G').setNumberFormat('@');
  }
  return f;
}

function feuillePersos() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  let f = classeur.getSheetByName(ONGLET_PERSOS);
  if (!f) {
    f = classeur.insertSheet(ONGLET_PERSOS);
    f.getRange(1, 1, 1, ENTETES_PERSOS.length).setValues([ENTETES_PERSOS]).setFontWeight('bold').setBackground('#efe3c6');
    f.setFrozenRows(1);
    f.getRange('A:F').setNumberFormat('@');
    f.getRange('H:H').setNumberFormat('@');
    f.setColumnWidth(3, 180);
    f.setColumnWidth(6, 260);
  }
  return f;
}

function trouver(f, pseudo) {
  const n = f.getLastRow() - 1;
  if (n < 1) return null;
  const cle = String(pseudo).trim().toLowerCase();
  const lignes = f.getRange(2, 1, n, 4).getValues();
  for (let i = 0; i < lignes.length; i++) {
    if (String(lignes[i][0]).trim().toLowerCase() === cle) {
      return {
        ligne: i + 2,
        pseudo: String(lignes[i][0]).trim(),
        empreinte: String(lignes[i][1]).trim(),
        sel: String(lignes[i][2]).trim(),
        role: String(lignes[i][3]).trim(),
      };
    }
  }
  return null;
}

/** À lancer une fois depuis l'éditeur (▶ Exécuter) pour créer l'onglet et autoriser le script. */
function installer() {
  feuille();
  feuilleJdr();
  feuillePersos();
  SpreadsheetApp.getActiveSpreadsheet().toast('Onglets « Comptes », « JDR » et « Personnages » prêts. Tu peux déployer l\'application web.');
}
