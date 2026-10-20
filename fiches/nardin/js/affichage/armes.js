/* ================================================================
   AFFICHAGE — armes portées et autres armes
   ================================================================ */
"use strict";

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
    const arme = trouverArme(id);
    const enMain = fiche.armesEnMain.includes(id);
    const besoin = mainsArme(fiche, id);
    const pasLaPlace = occupees + besoin > NB_MAINS;
    const raison = besoin === 2 ? "Arme à 2 mains : il faut les deux mains libres" : "Plus de main libre";
    el.className = "slot" + (enMain ? " en-main" : "");
    el.innerHTML = `
      <div class="slot-haut">
        <span class="slot-nom">${echap(arme?.nom ?? id)}
          ${arme?.deuxMains ? `<span class="badge" title="${besoin === 1 ? "Tenue à une main grâce à un don" : "Prend les deux mains"}">${besoin === 1 ? "2 mains → 1" : "2 mains"}</span>` : ""}
        ${arme?.detail ? `<span class="detail-objet">${echap(arme.detail)}</span>` : ""}</span>
        ${peut ? `<button class="btn suppr ranger" title="Ranger (retirer de sur soi)">✕</button>` : ""}
      </div>
      <div class="slot-actions">
        ${enMain ? `<span class="badge main">En main</span>` : `<span class="badge">Portée</span>`}
        ${peut ? (enMain
          ? `<button class="btn main-toggle">Lâcher</button>`
          : `<button class="btn main-toggle" ${pasLaPlace ? `disabled title="${raison}"` : ""}>Prendre en main</button>`) : ""}
      </div>`;
    el.querySelector(".ranger")?.addEventListener("click", () => { rangerArme(fiche, id, u); rafraichir(); });
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
    el.innerHTML = `
      <span>${echap(trouverArme(id)?.nom ?? id)}${trouverArme(id)?.deuxMains ? ` <span class="badge">2 mains</span>` : ""}${trouverArme(id)?.detail ? `<span class="detail-objet">${echap(trouverArme(id).detail)}</span>` : ""}</span>
      ${peut ? `<button class="btn porter" ${corpsPlein ? `disabled title="Déjà ${MAX_ARMES_PORTEES} armes portées"` : ""}>Équiper</button>` : ""}`;
    el.querySelector(".porter")?.addEventListener("click", () => { porterArme(fiche, id, u); rafraichir(); });
    inv.appendChild(el);
  }
}
