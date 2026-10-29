// ─────────────────────────────────────────────────────────────
//  Fiche : messages échangés avec la page de la fiche (dans son cadre)
//    fiche → site : jdr:pret, jdr:modif, jdr:reussite, jdr:hauteur, jdr:saisie,
//                   jdr:objet (usure d'une armure = objet unique, enregistrée dans l'onglet « Objets »),
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
    objets: f.objets || [],                            // objets uniques portés (armures, avec leur usure)
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
  } else if (m.type === "jdr:objet") {
    enregistrerObjetFiche(f, m);
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

// Usure d'une armure (objet unique) changée dans la fiche : enregistrée tout de suite,
// une demande après l'autre pour garder l'ordre (dégâts puis réparation, par exemple)
function enregistrerObjetFiche(f, m) {
  if (f.acces === "lecture" || !m.objet) return;
  const o = (f.objets || []).find((x) => x.id === m.objet);
  if (!o) return;
  const changement = {};
  if (m.protectionActuelle !== undefined) changement.protectionActuelle = o.protectionActuelle = m.protectionActuelle;
  if (m.usureAutorisee !== undefined) changement.usureAutorisee = o.usureAutorisee = m.usureAutorisee;
  f.texteObjets = JSON.stringify(f.objets);   // pas de « mise à jour » de la fiche pour notre propre changement
  f.derniereActionLocale = Date.now();
  f.objetsEnCours = (f.objetsEnCours || 0) + 1;
  etatSauvegarde("Enregistrement…");
  f.fileObjets = (f.fileObjets || Promise.resolve()).then(async () => {
    try {
      const rep = await appel("modifierObjet", { jeton: f.jeton, id: f.id, objet: m.objet, ...changement });
      if (sessionPerdue(rep)) return;
      if (ficheOuverte !== f) return;
      if (!rep.ok) etatSauvegarde(rep.erreur || "Usure de l'armure non enregistrée", "erreur");
      else if (!f.aEnvoyer && !f.envoi) etatSauvegarde("Enregistré ✓", "ok");
    } catch (e) {
      if (ficheOuverte === f) etatSauvegarde("Usure de l'armure non enregistrée : " + e.message, "erreur");
    } finally {
      f.objetsEnCours--;
    }
  });
}
