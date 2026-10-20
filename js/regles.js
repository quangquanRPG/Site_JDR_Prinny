// ─────────────────────────────────────────────────────────────
//  Règles communes (identiques côté serveur, dans apps-script/Outils.gs)
//  Pseudo, mot de passe, personnage.
// ─────────────────────────────────────────────────────────────
"use strict";

// ── Règles communes (identiques côté serveur) ─────────────────
const REGLE_PSEUDO = /^[\p{L}\p{N}][\p{L}\p{N} _'\-]{1,23}$/u;
const MDP_MIN = 4;

function erreurPseudo(p) {
  p = String(p || "").trim();
  if (!p) return "Indique ton pseudo.";
  if (p.length < 2 || p.length > 24) return "Le pseudo doit faire entre 2 et 24 caractères.";
  if (!REGLE_PSEUDO.test(p)) return "Pseudo : lettres, chiffres, espaces, - _ ' (commence par une lettre ou un chiffre).";
  return "";
}

function erreurPerso(d) {
  const nom = String(d.nom || "").trim();
  if (nom.length < 1 || nom.length > 60) return "Le nom du personnage doit faire entre 1 et 60 caractères.";
  if (d.type !== "PJ" && d.type !== "PNJ") return "Type de personnage inconnu.";
  if (d.type === "PJ" && !String(d.joueur || "").trim()) return "Choisis le joueur qui incarne ce personnage.";
  if (String(d.notes || "").length > 500) return "Les notes sont limitées à 500 caractères.";
  return "";
}
