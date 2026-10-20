// ─────────────────────────────────────────────────────────────
//  Petits outils d'affichage
//  Raccourcis pour trouver et créer des éléments de la page.
// ─────────────────────────────────────────────────────────────
"use strict";

const $ = (s) => document.querySelector(s);

// ── Petits outils d'affichage ─────────────────────────────────
function el(tag, props = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === false || v == null) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  n.append(...enfants.filter((e) => e != null && e !== false));
  return n;
}

const pluriel = (n, mot, motPluriel) => n + " " + (n > 1 ? motPluriel || mot + "s" : mot);

function ecrireMessage(noeud, texte, type = "erreur") {
  noeud.textContent = texte || "";
  noeud.className = "message " + (texte ? type : "");
}
