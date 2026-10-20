// ─────────────────────────────────────────────────────────────
//  Fiche : messages échangés avec la page de la fiche (dans son cadre)
//    fiche → site : jdr:pret, jdr:modif, jdr:reussite, jdr:hauteur
//    site → fiche : jdr:charger
// ─────────────────────────────────────────────────────────────
"use strict";

function surMessageDeLaFiche(e) {
  const f = ficheOuverte;
  if (!f || !f.cadre || e.source !== f.cadre.contentWindow || !e.data) return;
  const m = e.data;

  if (m.type === "jdr:pret") {
    f.cadre.contentWindow.postMessage({
      type: "jdr:charger",
      donnees: f.donnees,
      donneesRp: normaliserDonneesRp(f.jdr.donneesRp),   // listes du MJ (ou exemples de départ)
      nom: f.perso.nom,
      proprietaire: f.perso.type === "PJ" ? f.perso.joueur.toLowerCase() : null,
      utilisateur: { id: moiInfo.pseudo.toLowerCase(), role: f.acces === "mj" ? "mj" : "joueur" },
    }, "*");
  } else if (m.type === "jdr:reussite") {
    afficherReussiteFiche(m);
  } else if (m.type === "jdr:hauteur") {
    f.cadre.style.height = Math.max(400, Number(m.hauteur) || 0) + "px";
  } else if (m.type === "jdr:modif") {
    const texte = JSON.stringify(m.donnees);
    if (!f.recu) {
      f.recu = true;
      // Fiche déjà enregistrée : cette première version est l'état de départ.
      // Fiche jamais remplie : on l'enregistre tout de suite (elle est « créée »).
      if (f.donnees) { f.dernier = texte; return; }
    }
    if (texte === (f.texteAEnvoyer ?? f.dernier)) return;
    f.aEnvoyer = m.donnees;
    f.texteAEnvoyer = texte;
    etatSauvegarde("Modifications en attente…");
    clearTimeout(f.minuteur);
    f.minuteur = setTimeout(() => sauverFiche(f), 800);
  }
}

// Fermeture de l'onglet avec une modification pas encore partie : on l'envoie et on prévient
function avantFermeture(e) {
  if (ficheOuverte && (ficheOuverte.aEnvoyer || ficheOuverte.envoi)) {
    sauverFiche(ficheOuverte);
    e.preventDefault();
    e.returnValue = "";
  }
}
