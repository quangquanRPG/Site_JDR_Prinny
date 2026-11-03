/* ================================================================
   AFFICHAGE — réglages du MJ
   Nom, réussite de base, compétences de base (armures et armes : tuile « Objets uniques » du JDR).
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
        <div class="label">Armures et armes</div>
        <p class="reglage-note">Les armures et les armes sont des objets uniques (une armure garde son usure,
          une arme sa forme) : crée-les et donne-les dans la page du JDR, tuile « Objets uniques ».</p>
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
}
