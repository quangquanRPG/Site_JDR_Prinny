/* ================================================================
   Petits outils (identifiants, texte affiché)
   ================================================================ */
"use strict";

function nouvelId(prefixe) {
  return prefixe + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const signe = v => (v > 0 ? "+" : "−") + Math.abs(v);
const echap = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

const pourcent = v => (Math.round(v * 1000) / 10).toLocaleString("fr-FR") + " %";
