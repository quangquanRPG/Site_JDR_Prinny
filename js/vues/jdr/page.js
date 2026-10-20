// ─────────────────────────────────────────────────────────────
//  Page d'un JDR (MJ) : en-tête et menu
// ─────────────────────────────────────────────────────────────
"use strict";

function etatJdrPage(texte) {
  $("#etat-jdr-page").textContent = texte || "";
  $("#etat-jdr-page").hidden = !texte;
}

async function ouvrirJdr(id) {
  montrer("vue-jdr");
  if (!jdrCourant || jdrCourant.jdr.id !== id) {
    $("#jdr-titre").textContent = "…";
    $("#jdr-texte").textContent = "";
    fermerPanneau();
  }
  $("#menu-jdr").hidden = true;
  etatJdrPage("Ouverture du JDR…");
  try {
    const rep = await appelConnecte("jdr", { id });
    if (sessionPerdue(rep)) return;
    if (!rep.ok) {
      $("#jdr-titre").textContent = "JDR introuvable";
      return etatJdrPage(rep.erreur || "Ce JDR n'existe pas ou ne t'appartient pas.");
    }
    jdrCourant = { jdr: rep.jdr, personnages: rep.personnages || [] };
    $("#jdr-titre").textContent = rep.jdr.nom;
    $("#jdr-texte").textContent = rep.jdr.description || "";
    document.title = rep.jdr.nom + " · " + (CFG.NOM_SITE || "Grimoire");
    etatJdrPage("");
    $("#menu-jdr").hidden = false;
    majMenu();
    rafraichirPanneau();
  } catch (e) {
    etatJdrPage(e.message);
  }
}

function ficheDuJdr() {
  return FICHES.find((f) => f.id === jdrCourant.jdr.typeFiche) || null;
}

function majMenu() {
  const type = jdrCourant.jdr.typeFiche;
  const f = ficheDuJdr();
  $("#info-type").textContent = f ? f.nom : type ? "Type inconnu (" + type + ")" : "Aucun type choisi";
  const ps = jdrCourant.personnages;
  const nPj = ps.filter((p) => p.type === "PJ").length;
  const nPnj = ps.length - nPj;
  $("#info-persos").textContent = ps.length ? pluriel(nPj, "joueur") + " · " + nPnj + " PNJ" : "Aucun personnage";
  const rp = normaliserDonneesRp(jdrCourant.jdr.donneesRp);
  const brouillon = brouillonRp && brouillonRp.jdrId === jdrCourant.jdr.id && brouillonRp.sale;
  $("#info-rp").textContent = brouillon
    ? "Modifications non enregistrées"
    : pluriel(rp.armes.length, "arme") + " · " + pluriel(rp.setsArmure.length, "set") + " d'armure"
      + (jdrCourant.jdr.donneesRp ? "" : " (exemples)");
}
