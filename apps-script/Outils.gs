// ─────────────────────────────────────────────────────────────
//  Outils : chiffrement, contrôles, réponse JSON
// ─────────────────────────────────────────────────────────────

function hacher(texte) {
  const octets = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texte, Utilities.Charset.UTF_8);
  return octets.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
}

function erreurPseudo(p) {
  if (p.length < 2 || p.length > 24) return 'Le pseudo doit faire entre 2 et 24 caractères.';
  if (!REGLE_PSEUDO.test(p)) return "Pseudo : lettres, chiffres, espaces, - _ ' (commence par une lettre ou un chiffre).";
  return '';
}

// Empêche Sheets d'interpréter un texte comme une formule (=, +, -, @ en tête)
function texteSur(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

const estEmpreinte =(v) => /^[0-9a-f]{64}$/.test(String(v || ''));
const estJeton = (v) => /^[0-9a-f]{64}$/.test(String(v || ''));

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function lireJson(texte) {
  if (!texte) return null;
  try { return JSON.parse(texte); } catch (e) { return null; }
}
