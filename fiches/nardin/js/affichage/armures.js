/* ================================================================
   AFFICHAGE — armures portées (objets uniques)
   Chaque armure montre sa Protection actuelle / max (son usure) et sa valeur.
   Un clic équipe l'armure ; elle arrive avec son usure (pas remise à neuf).
   Le MJ crée et donne les armures dans la page du JDR (« Objets uniques »).
   ================================================================ */
"use strict";

function afficherArmures(fiche, u) {
  const zone = document.getElementById("armures");
  const retirer = document.getElementById("retirer-armure");
  zone.innerHTML = "";
  retirer.innerHTML = "";
  const peutChanger = droits.changerArmure(u, fiche);

  if (!fiche.armures.length) {
    zone.innerHTML = `<div class="vide">Aucune armure. Le MJ les crée et les donne dans la page du JDR (« Objets uniques »).</div>`;
    return;
  }
  if (fiche.armureEquipee && peutChanger) {
    const b = document.createElement("button");
    b.className = "lien";
    b.textContent = "Retirer l'armure";
    b.onclick = () => { equiperArmure(fiche, null, u); rafraichir(); };
    retirer.appendChild(b);
  }
  for (const id of fiche.armures) {
    const a = trouverArmure(id);
    if (!a) continue;
    const equipee = fiche.armureEquipee === id;
    const pct = a.protection > 0 ? Math.max(0, Math.min(100, (a.actuel / a.protection) * 100)) : 0;
    const abimee = a.actuel < a.protection;
    const el = document.createElement("button");
    el.className = "armure" + (equipee ? " equipee" : "") + (abimee ? " abimee" : "");
    el.disabled = !peutChanger && !equipee;
    el.title = equipee ? "Armure équipée" : peutChanger ? "Équiper cette armure (elle garde son usure)" : "";
    el.innerHTML = `
      <span class="armure-nom">${echap(a.nom)}${a.valeur === VALEUR_DIVINE ? ` <span class="armure-divine" title="Armure divine">✦</span>` : ""}</span>
      <span class="armure-prot">Protection <b>${a.actuel}</b> / ${a.protection} · Valeur ${String(a.valeur ?? 0).replace(".", ",")}</span>
      ${a.protection > 0 ? `<span class="armure-usure"><span style="width:${pct}%"></span></span>` : ""}
      ${a.detail ? `<span class="detail-objet">${echap(a.detail)}</span>` : ""}
      ${equipee ? `<span class="armure-etat">Équipée</span>` : abimee ? `<span class="armure-etat abimee">Abîmée</span>` : ""}`;
    if (!equipee && peutChanger) el.onclick = () => { equiperArmure(fiche, id, u); rafraichir(); };
    zone.appendChild(el);
  }
}
