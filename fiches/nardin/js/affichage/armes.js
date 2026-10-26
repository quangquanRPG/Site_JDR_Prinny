/* ================================================================
   AFFICHAGE — armes portées et autres armes
   ================================================================ */
"use strict";

// Arme à deux formes : bouton « ⇄ autre forme » (ou simple mention pour qui ne peut pas changer)
function boutonForme(fiche, id, arme, peut) {
  if (!arme?.autreForme) return "";
  if (!peut) return `<span class="detail-objet forme-objet">Forme ${arme.forme}/2 · autre forme : ${echap(arme.autreForme)}</span>`;
  const possible = changementFormePossible(fiche, id);
  return `<button class="btn btn-forme" ${possible ? `title="Changer de forme (forme ${arme.forme}/2)"`
    : `disabled title="Pas assez de mains libres pour cette forme : lâche une autre arme d'abord"`}>⇄ ${echap(arme.autreForme)}</button>`;
}

function afficherArmes(fiche, u) {
  const peut = droits.changerArmes(u, fiche);
  const occupees = mainsOccupees(fiche);
  const corpsPlein = fiche.armesPortees.length >= MAX_ARMES_PORTEES;

  document.getElementById("compteur-armes").textContent =
    `${fiche.armesPortees.length} / ${MAX_ARMES_PORTEES} portées · ${occupees} / ${NB_MAINS} mains occupées`;

  // Emplacements portés (toujours 3 cases)
  const slots = document.getElementById("armes-portees");
  slots.innerHTML = "";
  for (let i = 0; i < MAX_ARMES_PORTEES; i++) {
    const id = fiche.armesPortees[i];
    const el = document.createElement("div");
    if (!id) {
      el.className = "slot vide";
      el.textContent = "Emplacement libre";
      slots.appendChild(el);
      continue;
    }
    const arme = armeEffective(fiche, id);
    const enMain = fiche.armesEnMain.includes(id);
    const besoin = mainsArme(fiche, id);
    const pasLaPlace = occupees + besoin > NB_MAINS;
    const raison = besoin === 2 ? "Arme à 2 mains : il faut les deux mains libres" : "Plus de main libre";
    el.className = "slot" + (enMain ? " en-main" : "");
    el.innerHTML = `
      <div class="slot-haut">
        <span class="slot-nom">${echap(arme?.nom ?? id)}
          ${arme?.deuxMains ? `<span class="badge" title="${besoin === 1 ? "Tenue à une main grâce à un don" : "Prend les deux mains"}">${besoin === 1 ? "2 mains → 1" : "2 mains"}</span>` : ""}
        ${arme?.detail ? `<span class="detail-objet">${echap(arme.detail)}</span>` : ""}
        ${arme?.description ? `<span class="detail-objet">${echap(arme.description)}</span>` : ""}
        ${boutonForme(fiche, id, arme, peut)}</span>
        ${peut ? `<button class="btn suppr ranger" title="Ranger (retirer de sur soi)">✕</button>` : ""}
      </div>
      <div class="slot-actions">
        ${enMain ? `<span class="badge main">En main</span>` : `<span class="badge">Portée</span>`}
        ${peut ? (enMain
          ? `<button class="btn main-toggle">Lâcher</button>`
          : `<button class="btn main-toggle" ${pasLaPlace ? `disabled title="${raison}"` : ""}>Prendre en main</button>`) : ""}
      </div>`;
    el.querySelector(".ranger")?.addEventListener("click", () => { rangerArme(fiche, id, u); rafraichir(); });
    el.querySelector(".btn-forme")?.addEventListener("click", () => { changerFormeArme(fiche, id, u); rafraichir(); });
    el.querySelector(".main-toggle")?.addEventListener("click", () => {
      enMain ? lacherArme(fiche, id, u) : prendreEnMain(fiche, id, u);
      rafraichir();
    });
    slots.appendChild(el);
  }

  // Armes possédées mais pas sur soi
  const inv = document.getElementById("armes-inventaire");
  inv.innerHTML = "";
  const autres = fiche.armes.filter(id => !fiche.armesPortees.includes(id));
  if (!autres.length) { inv.innerHTML = `<div class="vide">Aucune autre arme.</div>`; return; }
  for (const id of autres) {
    const el = document.createElement("div");
    el.className = "objet";
    const a = armeEffective(fiche, id);
    el.innerHTML = `
      <span>${echap(a?.nom ?? id)}${a?.deuxMains ? ` <span class="badge">2 mains</span>` : ""}${a?.detail ? `<span class="detail-objet">${echap(a.detail)}</span>` : ""}${a?.description ? `<span class="detail-objet">${echap(a.description)}</span>` : ""}${boutonForme(fiche, id, a, peut)}</span>
      ${peut ? `<button class="btn porter" ${corpsPlein ? `disabled title="Déjà ${MAX_ARMES_PORTEES} armes portées"` : ""}>Équiper</button>` : ""}`;
    el.querySelector(".porter")?.addEventListener("click", () => { porterArme(fiche, id, u); rafraichir(); });
    el.querySelector(".btn-forme")?.addEventListener("click", () => { changerFormeArme(fiche, id, u); rafraichir(); });
    inv.appendChild(el);
  }
}
