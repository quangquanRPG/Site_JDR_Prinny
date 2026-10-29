// ─────────────────────────────────────────────────────────────
//  Fiche d'un personnage : ouverture
//  La fiche (fiches/<type>/index.html) s'affiche dans un cadre (iframe).
// ─────────────────────────────────────────────────────────────
"use strict";

function etatSauvegarde(texte, type = "") {
  const n = $("#etat-sauvegarde");
  n.textContent = texte || "";
  n.className = "etat-sauvegarde " + type;
}

function messageFiche(texte) {
  $("#message-fiche").textContent = texte || "";
  $("#message-fiche").hidden = !texte;
}

async function ouvrirFiche(id) {
  montrer("vue-fiche");
  fermerFiche();
  const f = { id, jeton: jeton.lire(), cadre: null, donnees: null, recu: false, dernier: null, aEnvoyer: null, texteAEnvoyer: null, minuteur: null, envoi: false };
  ficheOuverte = f;
  $("#infos-fiche").textContent = "";
  $("#retour-fiche").href = "#";
  $("#retour-fiche").textContent = "← Retour";
  etatSauvegarde("");
  messageFiche("Ouverture de la fiche…");
  try {
    const rep = await appelConnecte("fiche", { id });
    if (ficheOuverte !== f) return; // on a changé de page entre-temps
    if (sessionPerdue(rep)) return;
    if (!rep.ok) return messageFiche(rep.erreur || "Fiche introuvable.");
    Object.assign(f, { perso: rep.perso, jdr: rep.jdr, acces: rep.acces, donnees: rep.fiche });
    f.texteServeur = JSON.stringify(rep.fiche);               // pour repérer les changements faits ailleurs
    f.texteRp = JSON.stringify(rep.jdr.donneesRp ?? null);
    f.objets = rep.objets || [];                              // objets uniques portés (armures)
    f.texteObjets = JSON.stringify(f.objets);
    chargerPortrait(f);                                       // image du personnage, dans la marge gauche

    const mj = rep.acces === "mj";
    $("#retour-fiche").href = mj ? "#jdr/" + rep.jdr.id : "#";
    $("#retour-fiche").textContent = mj ? "← " + rep.jdr.nom : "← Mes personnages";
    if (rep.acces === "lecture") etatSauvegarde("Lecture seule", "lecture");   // fiche d'un autre joueur
    $("#infos-fiche").textContent = rep.jdr.nom + " · " + (rep.perso.type === "PJ" ? "joué par " + rep.perso.joueur : "PNJ");
    document.title = rep.perso.nom + " · " + (CFG.NOM_SITE || "Grimoire");

    const type = FICHES.find((t) => t.id === rep.jdr.typeFiche);
    if (!type || !type.page) {
      return messageFiche(mj
        ? rep.jdr.typeFiche
          ? "Le type de fiche « " + rep.jdr.typeFiche + " » n'existe plus dans fiches.js."
          : "Choisis d'abord un type de fiche pour ce JDR (menu « Type de fiche perso »)."
        : "Ton MJ n'a pas encore choisi de type de fiche pour ce JDR.");
    }
    messageFiche("");
    f.cadre = el("iframe", { src: type.page + (type.page.includes("?") ? "&" : "?") + "integre=1&v=" + VERSION, title: "Fiche de " + rep.perso.nom });
    $("#cadre-fiche").replaceChildren(f.cadre);
    demarrerActualisation(f);                                  // relit la fiche toutes les 30 s
  } catch (e) {
    if (ficheOuverte === f) messageFiche(e.message);
  }
}
