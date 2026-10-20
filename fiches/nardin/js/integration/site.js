/* ================================================================
   INTÉGRATION AU SITE
   Ouverte depuis le Grimoire (fiches/nardin/index.html?integre=1 dans un cadre),
   la page reçoit le personnage et l'utilisateur, puis renvoie la fiche
   après chaque modification ; le site l'enregistre dans le Google Sheet.
     site → fiche : jdr:charger
     fiche → site : jdr:pret, jdr:modif, jdr:reussite, jdr:hauteur
   ================================================================ */
"use strict";

const INTEGRE = window.parent !== window && new URLSearchParams(location.search).has("integre");
let utilisateurIntegre = null;   // { id, role: "mj" | "joueur" } envoyé par le site
const envoyerAuSite = msg => window.parent.postMessage(msg, "*");

// Après chaque affichage : le site met à jour son cadre « Réussite » et enregistre la fiche
function prevenirLeSite() {
  envoyerAuSite({ type: "jdr:reussite", ...etatReussite(fiche) });
  envoyerAuSite({ type: "jdr:modif", donnees: JSON.parse(JSON.stringify(fiche)) });
}

function surMessageDuSite(e) {
  if (e.source !== window.parent || !e.data || e.data.type !== "jdr:charger") return;
  const m = e.data;
  utilisateurIntegre = m.utilisateur;                       // { id, role: "mj" | "joueur" }
  if (m.donneesRp) appliquerDonneesRp(m.donneesRp);       // listes du MJ pour ce JDR
  fiche = creerFiche({ ...(m.donnees || {}), nom: m.nom, proprietaire: m.proprietaire ?? null });
  rafraichir();
}

function brancherAuSite() {
  document.body.classList.add("integre");
  document.documentElement.dataset.theme = "dark";
  window.addEventListener("message", surMessageDuSite);
  // Le site ajuste la hauteur du cadre à celle de la fiche
  new ResizeObserver(() => envoyerAuSite({ type: "jdr:hauteur", hauteur: Math.ceil(document.body.getBoundingClientRect().height) }))
    .observe(document.body);
  envoyerAuSite({ type: "jdr:pret" });
}
