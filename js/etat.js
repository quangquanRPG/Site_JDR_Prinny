// ─────────────────────────────────────────────────────────────
//  Réglages lus au démarrage et état partagé du site
//  Toutes les variables qui changent pendant l'utilisation sont ici,
//  pour voir d'un coup d'œil ce que le site garde en mémoire.
// ─────────────────────────────────────────────────────────────
"use strict";

// Numéro de version : repris de l'adresse de ce fichier dans index.html (etat.js?v=…).
// Il est ajouté à l'adresse de la fiche pour que le navigateur recharge la nouvelle.
const VERSION = new URL(document.currentScript.src).searchParams.get("v") || "";

const CFG = window.JDR_CONFIG || {};
const FICHES = Array.isArray(window.JDR_FICHES) ? window.JDR_FICHES : [];
const API = String(CFG.API_URL || "").trim();
const DEMO = !API;

let mode = "connexion";   // onglet de l'accueil : "connexion" ou "inscription"
let moiInfo = null;       // { pseudo, role } du compte connecté
let jdrCourant = null;    // { jdr, personnages } du JDR ouvert
let panneauActif = null;  // panneau ouvert dans le menu du JDR
let brouillonRp = null;   // Données du RP en cours de modification (gardé tant qu'on reste sur le même JDR)
let ficheOuverte = null;  // fiche affichée et ce qui reste à enregistrer (voir vues/fiche/)
