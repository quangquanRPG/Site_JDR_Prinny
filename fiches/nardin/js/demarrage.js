/* ================================================================
   DÉMARRAGE — affiche la fiche et la redessine après chaque changement
   C'est le seul fichier qui lance quelque chose au chargement : il doit rester
   le DERNIER <script> de index.html.
   ================================================================ */
"use strict";

let fiche = creerFiche(FICHE_EXEMPLE);   // remplacée par le vrai personnage quand le site l'envoie

const choixRole = document.getElementById("choix-role");
const utilisateurCourant = () => utilisateurIntegre ?? UTILISATEURS_DEMO[choixRole.value];

// Redessine toute la fiche (appelée après chaque action)
function rafraichir() {
  if (INTEGRE && !utilisateurIntegre) return;   // en attente du personnage envoyé par le site
  const u = utilisateurCourant();
  document.getElementById("nom-perso").textContent = fiche.nom;
  afficherRessources(fiche, u);
  afficherDegats(fiche, u);
  afficherBlessures(fiche, u);
  afficherArmures(fiche, u);
  afficherArmes(fiche, u);
  afficherBourse(fiche, u);
  for (const i of INVENTAIRES) afficherInventaire(fiche, u, i.cle);
  afficherCompetences(fiche);
  afficherDons(fiche, u);
  afficherZoneMJ(fiche, u);
  afficherReglagesMJ(fiche, u);
  afficherReussite(fiche, u);
  if (INTEGRE) prevenirLeSite();
}

if (INTEGRE) {
  brancherAuSite();
} else {
  choixRole.addEventListener("change", rafraichir);
  rafraichir();
}
