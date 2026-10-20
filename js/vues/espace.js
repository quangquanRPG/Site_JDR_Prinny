// ─────────────────────────────────────────────────────────────
//  Espace perso : aiguille vers l'espace joueur ou l'espace MJ
// ─────────────────────────────────────────────────────────────
"use strict";

function afficherEspace() {
  const info = moiInfo;
  $("#nom-joueur").textContent = info.pseudo;
  const badge = $("#badge-role");
  badge.textContent = info.role === "MJ" ? "Maître du jeu" : info.role || "Joueur";
  badge.classList.toggle("mj", info.role === "MJ");
  document.title = info.pseudo + " · " + (CFG.NOM_SITE || "Grimoire");
  const estMJ = info.role === "MJ";
  $("#zone-mj").hidden = !estMJ;
  $("#zone-joueur").hidden = estMJ;
  montrer("vue-espace");
  if (estMJ) {
    ouvrirFormJdr(false);
    chargerJdr();
  } else {
    chargerMesPersos();
  }
}
