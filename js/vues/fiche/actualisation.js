// ─────────────────────────────────────────────────────────────
//  Fiche : mise à jour automatique (« presque temps réel »)
//  Toutes les 30 s, le site relit la fiche dans le Google Sheet et affiche
//  les changements faits par quelqu'un d'autre (MJ, joueur, compagnon).
//  On ne met PAS à jour pendant que l'utilisateur agit : saisie en cours,
//  modification pas encore enregistrée, ou action il y a moins de 3 s.
//  Pause quand l'onglet est caché (pour ménager les quotas Google).
// ─────────────────────────────────────────────────────────────
"use strict";

const INTERVALLE_ACTUALISATION = 30000;   // 30 secondes (environ 120 lectures par heure et par fiche ouverte : large marge sur les quotas Google)
const CALME_AVANT_ACTUALISATION = 3000;   // pas de mise à jour moins de 3 s après une action

function demarrerActualisation(f) {
  arreterActualisation(f);
  f.minuteurActu = setInterval(() => actualiserFiche(f), INTERVALLE_ACTUALISATION);
}

function arreterActualisation(f) {
  if (f && f.minuteurActu) {
    clearInterval(f.minuteurActu);
    f.minuteurActu = null;
  }
}

// L'utilisateur est-il en train d'agir sur la fiche ?
function utilisateurOccupe(f) {
  return f.saisieEnCours || f.aEnvoyer || f.envoi
    || Date.now() - (f.derniereActionLocale || 0) < CALME_AVANT_ACTUALISATION;
}

async function actualiserFiche(f) {
  if (ficheOuverte !== f || !f.cadre || !f.recu || f.actuEnCours) return;
  if (document.hidden || utilisateurOccupe(f)) return;
  f.actuEnCours = true;
  try {
    const rep = await appel("fiche", { jeton: f.jeton, id: f.id });
    if (ficheOuverte !== f) return;
    if (sessionPerdue(rep)) return;
    if (!rep.ok) return;                    // on réessaiera au prochain tour
    if (utilisateurOccupe(f)) return;       // l'utilisateur a agi pendant la requête : sa version gagne

    const texteFiche = JSON.stringify(rep.fiche);
    const texteRp = JSON.stringify(rep.jdr.donneesRp ?? null);
    if (texteFiche === f.texteServeur && texteRp === f.texteRp && rep.perso.nom === f.perso.nom) return;

    f.texteServeur = texteFiche;
    f.texteRp = texteRp;
    Object.assign(f, { perso: rep.perso, jdr: rep.jdr, donnees: rep.fiche });
    document.title = rep.perso.nom + " · " + (CFG.NOM_SITE || "Grimoire");
    f.ignorerProchaineModif = true;         // la fiche va renvoyer cette version : ce n'est pas un changement local
    envoyerFicheAuCadre(f, "jdr:maj");
    signalerMiseAJour(f);
  } catch (e) {
    // réseau indisponible : on réessaiera au prochain tour, sans déranger l'utilisateur
  } finally {
    f.actuEnCours = false;
  }
}

// Petit message « Mis à jour » pendant 3 s, puis retour à l'état normal
function signalerMiseAJour(f) {
  etatSauvegarde("Mis à jour ↻", "ok");
  clearTimeout(f.minuteurMessageActu);
  f.minuteurMessageActu = setTimeout(() => {
    if (ficheOuverte !== f || f.aEnvoyer || f.envoi) return;
    if (f.acces === "lecture") etatSauvegarde("Lecture seule", "lecture");
    else etatSauvegarde("");
  }, 3000);
}
