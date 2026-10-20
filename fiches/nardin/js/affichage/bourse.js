/* ================================================================
   AFFICHAGE — bourse
   ================================================================ */
"use strict";

let bourseEnEdition = false;

function afficherBourse(fiche, u) {
  const zone = document.getElementById("bourse");
  const peut = droits.modifierBourse(u, fiche);
  const edition = bourseEnEdition && peut;
  const regroupee = bourseDepuisCuivre(totalEnCuivre(fiche.bourse));
  const regroupable = MONNAIES.some(m => regroupee[m.id] !== fiche.bourse[m.id]);

  zone.innerHTML = `
    <div class="bourse-grille">${MONNAIES.map(m => `
      <div class="piece">
        <span class="piece-nom"><span class="piece-pastille" style="background:${m.couleur}"></span>${m.nom}</span>
        ${edition
          ? `<input type="number" min="0" step="1" name="${m.id}" value="${fiche.bourse[m.id]}">`
          : `<span class="piece-val">${fiche.bourse[m.id].toLocaleString("fr-FR")}</span>`}
      </div>`).join("")}
    </div>
    ${peut ? `<div class="bourse-actions">
      ${edition
        ? `<span class="duo"><button class="btn-icone ok" title="Valider">✓</button><button class="btn-icone annuler" title="Annuler">✕</button></span>`
        : `<button class="btn-icone crayon" title="Modifier">✎</button>
           ${regroupable ? `<button class="lien regrouper" title="Échanger pour avoir le moins de pièces possible">Regrouper</button>` : ""}`}
    </div>` : ""}`;

  const fermer = () => { bourseEnEdition = false; rafraichir(); };
  const valider = () => {
    const valeurs = {};
    zone.querySelectorAll("input").forEach(i => valeurs[i.name] = i.value);
    modifierBourse(fiche, valeurs, u);
    fermer();
  };
  zone.querySelector(".crayon")?.addEventListener("click", () => {
    bourseEnEdition = true;
    rafraichir();
    const champ = document.querySelector("#bourse input");
    champ?.focus(); champ?.select();
  });
  zone.querySelector(".ok")?.addEventListener("click", valider);
  zone.querySelector(".annuler")?.addEventListener("click", fermer);
  zone.querySelector(".regrouper")?.addEventListener("click", () => { regrouperBourse(fiche, u); rafraichir(); });
  zone.querySelectorAll("input").forEach(i => i.addEventListener("keydown", ev => {
    if (ev.key === "Enter") valider();
    if (ev.key === "Escape") fermer();
  }));
}
