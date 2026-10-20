// ─────────────────────────────────────────────────────────────
//  Stockage dans le navigateur
//  jeton : la session du compte connecté
//  stock : les « fausses » données du mode démo
// ─────────────────────────────────────────────────────────────
"use strict";

const CLE_JETON = "jdr_jeton";

// « Rester connecté » → localStorage (gardé), sinon sessionStorage (effacé à la fermeture)
const jeton = {
  lire() {
    try { return localStorage.getItem(CLE_JETON) || sessionStorage.getItem(CLE_JETON); } catch (e) { return null; }
  },
  ecrire(v, long) {
    try { this.effacer(); (long ? localStorage : sessionStorage).setItem(CLE_JETON, v); } catch (e) {}
  },
  effacer() {
    try { localStorage.removeItem(CLE_JETON); sessionStorage.removeItem(CLE_JETON); } catch (e) {}
  },
};

// Mode démo : comptes, sessions, JDR et personnages rangés en JSON
const stock = {
  lire(cle, defaut) { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch (e) { return defaut; } },
  ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {} },
};
