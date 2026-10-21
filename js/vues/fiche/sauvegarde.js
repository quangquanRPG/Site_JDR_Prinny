// ─────────────────────────────────────────────────────────────
//  Fiche : enregistrement dans le Google Sheet
//  On enregistre 0,8 s après la dernière modification reçue (voir vues/fiche/echanges.js).
// ─────────────────────────────────────────────────────────────
"use strict";

// Quitter la fiche : ce qui était en attente est enregistré tout de suite
function fermerFiche() {
  $("#reussite-fiche").hidden = true;
  const f = ficheOuverte;
  if (!f) return;
  ficheOuverte = null;
  arreterActualisation(f);
  if (f.aEnvoyer) sauverFiche(f);
  $("#cadre-fiche").replaceChildren();
}

async function sauverFiche(f) {
  clearTimeout(f.minuteur);
  f.minuteur = null;
  if (!f.aEnvoyer || f.envoi) return; // un envoi en cours relancera la suite
  const donnees = f.aEnvoyer;
  const texte = f.texteAEnvoyer;
  f.aEnvoyer = null;
  f.texteAEnvoyer = null;
  f.envoi = true;
  if (ficheOuverte === f) etatSauvegarde("Enregistrement…");
  try {
    const rep = await appel("enregistrerFiche", { jeton: f.jeton, id: f.id, fiche: donnees });
    if (sessionPerdue(rep)) return;
    if (!rep.ok) {
      if (ficheOuverte === f) etatSauvegarde(rep.erreur || "Enregistrement refusé.", "erreur");
      return;
    }
    f.dernier = texte;
    f.texteServeur = texte;                 // le Sheet contient maintenant notre version
    if (rep.nom && f.perso && rep.nom !== f.perso.nom) {
      f.perso.nom = rep.nom;
      if (ficheOuverte === f) document.title = rep.nom + " · " + (CFG.NOM_SITE || "Grimoire");
    }
    if (ficheOuverte === f && !f.aEnvoyer) etatSauvegarde("Enregistré ✓", "ok");
  } catch (e) {
    // Problème de réseau : on garde la version et on réessaie
    if (!f.aEnvoyer) { f.aEnvoyer = donnees; f.texteAEnvoyer = texte; }
    if (ficheOuverte === f) etatSauvegarde("Pas de connexion au serveur, nouvel essai…", "erreur");
    f.minuteur = setTimeout(() => sauverFiche(f), 5000);
  } finally {
    f.envoi = false;
    if (f.aEnvoyer && !f.minuteur) f.minuteur = setTimeout(() => sauverFiche(f), 300);
  }
}
