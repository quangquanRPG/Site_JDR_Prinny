/* ================================================================
   INTÉGRATION AU SITE
   Ouverte depuis le Grimoire (fiches/nardin/index.html?integre=1 dans un cadre),
   la page reçoit le personnage et l'utilisateur, puis renvoie la fiche
   après chaque modification ; le site l'enregistre dans le Google Sheet.
     site → fiche : jdr:charger (ouverture), jdr:maj (mise à jour automatique toutes les 30 s),
                    jdr:image (image du personnage à afficher)
     fiche → site : jdr:pret, jdr:modif, jdr:reussite, jdr:hauteur,
                    jdr:saisie (un champ a le focus : le site attend avant de mettre à jour),
                    jdr:objet (usure d'une armure / usure divine autorisée, à enregistrer),
                    jdr:image-voir, jdr:image-fichier, jdr:image-retirer
   ================================================================ */
"use strict";

const INTEGRE = window.parent !== window && new URLSearchParams(location.search).has("integre");
let utilisateurIntegre = null;   // { id, role: "mj" | "joueur" } envoyé par le site
const envoyerAuSite = msg => window.parent.postMessage(msg, "*");

// Après chaque affichage : le site met à jour son cadre « Réussite », enregistre la fiche,
// et enregistre l'usure des armures (objets uniques) qui a changé
function prevenirLeSite() {
  for (const c of objetsModifies()) envoyerAuSite({ type: "jdr:objet", ...c });
  envoyerAuSite({ type: "jdr:reussite", ...etatReussite(fiche), sort: jetSortEnCours(fiche, utilisateurCourant()) });
  envoyerAuSite({ type: "jdr:modif", donnees: JSON.parse(JSON.stringify(fiche)) });
}

function surMessageDuSite(e) {
  if (e.source !== window.parent || !e.data) return;
  if (e.data.type === "jdr:image") return afficherPortraitPerso(e.data);   // image du personnage (affichage/portrait.js)
  if (e.data.type !== "jdr:charger" && e.data.type !== "jdr:maj") return;
  const m = e.data;
  utilisateurIntegre = m.utilisateur;                       // { id, role: "mj" | "joueur" }
  if (m.donneesRp) appliquerDonneesRp(m.donneesRp);       // listes du MJ pour ce JDR
  appliquerObjets(m.objets);                               // armures = objets uniques portés (integration/objets.js)
  fiche = creerFiche({ ...(m.donnees || {}), nom: m.nom, proprietaire: m.proprietaire ?? null });
  rafraichir();
}

function brancherAuSite() {
  document.body.classList.add("integre");
  document.documentElement.dataset.theme = "dark";
  window.addEventListener("message", surMessageDuSite);
  // Prévient le site quand on tape dans un champ, pour qu'il n'écrase pas la saisie en cours
  const estChamp = el => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  document.addEventListener("focusin", ev => { if (estChamp(ev.target)) envoyerAuSite({ type: "jdr:saisie", active: true }); });
  document.addEventListener("focusout", () => setTimeout(() => {
    if (!estChamp(document.activeElement)) envoyerAuSite({ type: "jdr:saisie", active: false });
  }, 0));
  // Le site ajuste la hauteur du cadre à celle de la fiche
  new ResizeObserver(() => envoyerAuSite({ type: "jdr:hauteur", hauteur: Math.ceil(document.body.getBoundingClientRect().height) }))
    .observe(document.body);
  envoyerAuSite({ type: "jdr:pret" });
}
