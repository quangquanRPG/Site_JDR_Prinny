/* ================================================================
   AFFICHAGE — sets d'armure
   ================================================================ */
"use strict";

function afficherArmures(fiche, u) {
  const zone = document.getElementById("armures");
  const retirer = document.getElementById("retirer-armure");
  zone.innerHTML = "";
  retirer.innerHTML = "";
  const peutChanger = droits.changerArmure(u, fiche);

  if (!fiche.armures.length) {
    zone.innerHTML = `<div class="vide">Aucun set d'armure.</div>`;
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
    const el = document.createElement("button");
    el.className = "armure" + (equipee ? " equipee" : "");
    el.disabled = !peutChanger && !equipee;
    el.innerHTML = `
      <span class="armure-nom">${echap(a.nom)}</span>
      <span class="armure-prot">Protection ${a.protection} · Valeur ${a.valeur ?? 0}</span>
      ${a.detail ? `<span class="detail-objet">${echap(a.detail)}</span>` : ""}
      ${equipee ? `<span class="armure-etat">Équipée</span>` : ""}`;
    if (!equipee && peutChanger) el.onclick = () => { equiperArmure(fiche, id, u); rafraichir(); };
    zone.appendChild(el);
  }
}
