// ─────────────────────────────────────────────────────────────
//  Appels au serveur (Apps Script)
//  En mode démo (pas d'API_URL dans config.js), tout part vers serveur/demo.js.
// ─────────────────────────────────────────────────────────────
"use strict";

// ── Appels au serveur (Apps Script) ───────────────────────────
async function appel(action, donnees = {}) {
  if (DEMO) return demo(action, donnees);
  let rep;
  try {
    // text/plain évite la requête "preflight" CORS qu'Apps Script ne gère pas
    rep = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...donnees }),
    });
  } catch (e) {
    throw new Error("Impossible de joindre le serveur. Vérifie ta connexion ou l'URL dans config.js.");
  }
  if (!rep.ok) throw new Error("Le serveur a répondu une erreur (" + rep.status + ").");
  try { return await rep.json(); } catch (e) { throw new Error("Réponse illisible du serveur. Le déploiement Apps Script est-il bien en accès « Tout le monde » ?"); }
}
const appelConnecte = (action, donnees = {}) => appel(action, { jeton: jeton.lire(), ...donnees });

async function infosServeur() {
  if (DEMO) return { ok: true, inscription: true };
  try {
    const rep = await fetch(API);
    return await rep.json();
  } catch (e) {
    return { ok: false, inscription: true };
  }
}
