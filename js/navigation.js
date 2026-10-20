// ─────────────────────────────────────────────────────────────
//  Navigation entre les vues
//  Adresses : #jdr/<id> (page d'un JDR, MJ) et #fiche/<id> (fiche d'un personnage).
// ─────────────────────────────────────────────────────────────
"use strict";

function montrer(vue) {
  for (const id of ["vue-chargement", "vue-accueil", "vue-espace", "vue-jdr", "vue-fiche"]) $("#" + id).hidden = id !== vue;
  if (vue !== "vue-fiche") fermerFiche();
  window.scrollTo(0, 0);
}

const message = (texte, type) => ecrireMessage($("#message"), texte, type);

// Si le serveur dit que la session n'est plus valable, on revient à l'accueil
function sessionPerdue(rep) {
  if (rep && rep.session === false) {
    fermerSession();
    message(rep.erreur || "Session expirée, reconnecte-toi.");
    return true;
  }
  return false;
}

// Affiche la vue qui correspond à l'adresse (#jdr/…, #fiche/… ou l'espace perso)
function route() {
  if (!moiInfo) return;
  const m = location.hash.match(/^#jdr\/([0-9a-f]{8})$/);
  const f = location.hash.match(/^#fiche\/([0-9a-f]{8})$/);
  if (f) ouvrirFiche(f[1]);
  else if (m && moiInfo.role === "MJ") ouvrirJdr(m[1]);
  else afficherEspace();
}
