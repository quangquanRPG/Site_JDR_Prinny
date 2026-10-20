// ─────────────────────────────────────────────────────────────
//  Chiffrement
//  Le mot de passe ne quitte jamais le navigateur en clair.
// ─────────────────────────────────────────────────────────────
"use strict";

// ── Chiffrement : le mot de passe ne quitte jamais le navigateur en clair ──
async function sha256(texte) {
  if (!(window.crypto && crypto.subtle)) {
    throw new Error("Ton navigateur bloque le chiffrement ici. Ouvre le site en https (GitHub Pages) ou via un serveur local.");
  }
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const empreinte = (mdp) => sha256("jdr:" + mdp);

function aleatoire() {
  const t = new Uint8Array(16);
  crypto.getRandomValues(t);
  return [...t].map((b) => b.toString(16).padStart(2, "0")).join("");
}
