// ─────────────────────────────────────────────────────────────
//  Page d'un JDR : ouverture / fermeture des panneaux du menu
//  Chaque tuile du menu (index.html, data-panneau) correspond à une entrée de PANNEAUX.
// ─────────────────────────────────────────────────────────────
"use strict";

const PANNEAUX = {
  type:   { titre: "Type de fiche perso", rendu: () => panneauType() },
  rp:     { titre: "Données du RP", rendu: () => panneauDonneesRp() },
  persos: { titre: "Personnages", rendu: () => listePersos(false) },
  pj:     { titre: "Ajouter un personnage joueur", rendu: () => panneauAjout("PJ") },
  pnj:    { titre: "Ajouter un PNJ", rendu: () => panneauAjout("PNJ") },
  suppr:  { titre: "Supprimer un personnage", rendu: () => listePersos(true) },
};

function ouvrirPanneau(nom) {
  panneauActif = nom;
  document.querySelectorAll(".tuile").forEach((t) => {
    const actif = t.dataset.panneau === nom;
    t.classList.toggle("active", actif);
    t.setAttribute("aria-expanded", actif);
  });
  const zone = $("#panneau");
  if (!nom) {
    zone.hidden = true;
    zone.replaceChildren();
    return;
  }
  zone.hidden = false;
  zone.replaceChildren(el("h2", { text: PANNEAUX[nom].titre }), PANNEAUX[nom].rendu());
}
const fermerPanneau = () => ouvrirPanneau(null);
const rafraichirPanneau = () => ouvrirPanneau(panneauActif);
