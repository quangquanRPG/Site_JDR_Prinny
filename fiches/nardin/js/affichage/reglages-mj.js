/* ================================================================
   AFFICHAGE — réglages du MJ
   Nom, réussite de base, compétences de base, équipement possédé.
   ================================================================ */
"use strict";

function afficherReglagesMJ(fiche, u) {
  const zone = document.getElementById("reglages-mj");
  zone.innerHTML = "";
  if (!droits.reglerFiche(u)) return;

  zone.innerHTML = `
    <h2>Réglages du MJ</h2>
    <div class="reglages">
      <label class="reglage-nom">
        <span class="label">Nom du personnage</span>
        <input type="text" name="nom" maxlength="60" value="${echap(fiche.nom)}">
      </label>
      <label class="reglage-nom">
        <span class="label">Réussite de base (un d6 réussit à partir de…)</span>
        <select name="reussite" class="reglage-reussite">${[2, 3, 4, 5, 6].filter(v => v >= SEUIL_MIN && v <= SEUIL_MAX).map(v =>
          `<option value="${v}" ${v === fiche.reussite ? "selected" : ""}>${v}+</option>`).join("")}</select>
      </label>
      <div>
        <div class="label">Compétences de base (nombre de d6)</div>
        <div class="reglage-comp">${COMPETENCES.map(c => `
          <label><span>${c.nom}</span>
            <input type="number" min="0" max="20" step="1" data-comp="${c.id}" value="${fiche.competences[c.id].base}">
          </label>`).join("")}
        </div>
      </div>
      <div>
        <div class="label">Sets d'armure possédés</div>
        <div class="reglage-coches">${CATALOGUE_ARMURES.map(a => `
          <label><input type="checkbox" data-armure="${a.id}" ${fiche.armures.includes(a.id) ? "checked" : ""}>
            ${echap(a.nom)} <small>Prot. ${a.protection} · Val. ${a.valeur ?? 0}</small></label>`).join("")}
        </div>
      </div>
      <div>
        <div class="label">Armes possédées</div>
        <div class="reglage-coches">${CATALOGUE_ARMES.map(a => `
          <label><input type="checkbox" data-arme="${a.id}" ${fiche.armes.includes(a.id) ? "checked" : ""}>
            ${echap(a.nom)}${a.deuxMains ? ` <small>2 mains</small>` : ""}${a.forme2 ? ` <small>⇄ ${echap(a.forme2.nom)}${a.forme2.deuxMains ? " (2 mains)" : ""}</small>` : ""}</label>`).join("")}
        </div>
      </div>
    </div>`;

  zone.querySelector('[name="nom"]').addEventListener("change", e => {
    const nom = e.target.value.trim().slice(0, 60);
    if (nom) fiche.nom = nom;
    rafraichir();
  });
  zone.querySelector('[name="reussite"]').addEventListener("change", e => {
    modifierReussite(fiche, e.target.value, u);
    rafraichir();
  });
  zone.querySelectorAll("[data-comp]").forEach(champ => champ.addEventListener("change", () => {
    fiche.competences[champ.dataset.comp].base = Math.max(0, Math.min(20, Math.round(Number(champ.value) || 0)));
    rafraichir();
  }));
  zone.querySelectorAll("[data-armure]").forEach(coche => coche.addEventListener("change", () => {
    const id = coche.dataset.armure;
    if (coche.checked) {
      if (!fiche.armures.includes(id)) fiche.armures.push(id);
    } else {
      if (fiche.armureEquipee === id) equiperArmure(fiche, null, u);
      fiche.armures = fiche.armures.filter(x => x !== id);
    }
    rafraichir();
  }));
  zone.querySelectorAll("[data-arme]").forEach(coche => coche.addEventListener("change", () => {
    const id = coche.dataset.arme;
    if (coche.checked) {
      if (!fiche.armes.includes(id)) fiche.armes.push(id);
    } else {
      fiche.armes = fiche.armes.filter(x => x !== id);
      fiche.armesPortees = fiche.armesPortees.filter(x => x !== id);
      fiche.armesEnMain = fiche.armesEnMain.filter(x => x !== id);
    }
    rafraichir();
  }));
}
