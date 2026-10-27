// ─────────────────────────────────────────────────────────────
//  Fiche : messages échangés avec la page de la fiche (dans son cadre)
//    fiche → site : jdr:pret, jdr:modif, jdr:reussite, jdr:hauteur, jdr:saisie,
//                   jdr:image-voir, jdr:image-fichier, jdr:image-retirer (image du personnage, voir portrait.js)
//    site → fiche : jdr:charger (ouverture), jdr:maj (mise à jour automatique, voir actualisation.js),
//                   jdr:image (image à afficher dans la colonne de gauche)
// ─────────────────────────────────────────────────────────────
"use strict";

// Envoie le personnage à la fiche : à l'ouverture (jdr:charger) et à chaque mise à jour (jdr:maj)
function envoyerFicheAuCadre(f, type) {
  f.cadre.contentWindow.postMessage({
    type,
    donnees: f.donnees,
    donneesRp: normaliserDonneesRp(f.jdr.donneesRp),   // listes du MJ (ou exemples de départ)
    nom: f.perso.nom,
    proprietaire: f.perso.type === "PJ" ? f.perso.joueur.toLowerCase() : null,
    utilisateur: { id: moiInfo.pseudo.toLowerCase(), role: f.acces === "mj" ? "mj" : "joueur" },
  }, "*");
}

function surMessageDeLaFiche(e) {
  const f = ficheOuverte;
  if (!f || !f.cadre || e.source !== f.cadre.contentWindow || !e.data) return;
  const m = e.data;

  if (m.type === "jdr:pret") {
    envoyerFicheAuCadre(f, "jdr:charger");
    f.cadrePret = true;
    envoyerPortraitAuCadre(f);
  } else if (m.type === "jdr:image-voir") {
    ouvrirVisionneuse(f);
  } else if (m.type === "jdr:image-fichier") {
    if (peutChangerImage(f) && m.fichier instanceof Blob) envoyerImagePerso(f, m.fichier);
  } else if (m.type === "jdr:image-retirer") {
    if (peutChangerImage(f)) retirerImagePerso(f);
  } else if (m.type === "jdr:saisie") {
    f.saisieEnCours = !!m.active;          // un champ de la fiche a le focus : pas de mise à jour automatique
    if (m.active) f.derniereActionLocale = Date.now();
  } else if (m.type === "jdr:reussite") {
    afficherReussiteFiche(m);
  } else if (m.type === "jdr:hauteur") {
    f.cadre.style.height = Math.max(400, Number(m.hauteur) || 0) + "px";
  } else if (m.type === "jdr:modif") {
    const texte = JSON.stringify(m.donnees);
    if (f.ignorerProchaineModif) {        // la fiche renvoie la version reçue par la mise à jour automatique
      f.ignorerProchaineModif = false;
      f.recu = true;
      f.dernier = texte;
      return;
    }
    if (f.acces === "lecture") { f.recu = true; return; }   // fiche d'un autre joueur : rien n'est enregistré
    if (!f.recu) {
      f.recu = true;
      // Fiche déjà enregistrée : cette première version est l'état de départ.
      // Fiche jamais remplie : on l'enregistre tout de suite (elle est « créée »).
      if (f.donnees) { f.dernier = texte; return; }
    }
    if (texte === (f.texteAEnvoyer ?? f.dernier)) return;
    f.derniereActionLocale = Date.now();
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
