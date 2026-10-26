/* ================================================================
   AFFICHAGE — encaisser des dégâts
   ================================================================ */
"use strict";

let dernierDegat = null;   // pour afficher le récap et pouvoir annuler
let modeMagique = false;   // interrupteur « Magie » (reste dans sa position entre deux coups)

function afficherDegats(fiche, u) {
  const zone = document.getElementById("zone-degats");
  zone.innerHTML = "";
  if (!droits.modifierActuelRessource(u, fiche)) return;

  const form = document.createElement("div");
  form.className = "degats";
  form.innerHTML = `
    <div class="titre-bloc">Encaisser des dégâts</div>
    <label class="champ-degat"><span class="label">Dégâts</span>
      <input name="degats" type="number" min="0" step="1" placeholder="0"></label>
    <label class="champ-degat"><span class="label">Dégâts bruts</span>
      <input name="bruts" type="number" min="0" step="1" placeholder="0"></label>
    <button type="button" class="btn principal encaisser">Encaisser</button>
    <label class="toggle-magie ${modeMagique ? "on" : ""}" title="Attaque magique : la Protection magique absorbe d'abord">
      <span class="switch magie"><input type="checkbox" ${modeMagique ? "checked" : ""}><span></span></span>
      Magie
    </label>
    ${dernierDegat ? `<div class="recap">
      <span>${dernierDegat.degats ? `<b>${dernierDegat.degats}</b> dégâts${dernierDegat.magique ? " magiques" : ""}` : ""}${dernierDegat.degats && dernierDegat.degatsBruts ? " + " : ""}${dernierDegat.degatsBruts ? `<b>${dernierDegat.degatsBruts}</b> bruts` : ""} →</span>
      ${dernierDegat.absorbeMagie ? `<span>Magie absorbe <span class="magie">${dernierDegat.absorbeMagie}</span></span>` : ""}
      ${dernierDegat.divin
        ? `<span>Protection <span class="divin">intacte</span> (armure divine : dégâts ÷ ${VALEUR_DIVINE})</span>`
        : `<span>Protection <span class="m">−${dernierDegat.perteProtection}</span></span>`}
      <span>PV <span class="m">−${dernierDegat.pertePV}</span></span>
      <button type="button" class="lien annuler-degat">Annuler</button>
    </div>` : ""}`;

  const encaisser = () => {
    const d = form.querySelector("[name=degats]").value;
    const b = form.querySelector("[name=bruts]").value;
    if (!(Number(d) > 0) && !(Number(b) > 0)) return;
    dernierDegat = encaisserDegats(fiche, d, b, u, modeMagique);
    rafraichir();
  };
  const caseMagie = form.querySelector(".toggle-magie input");
  caseMagie.addEventListener("change", () => {
    modeMagique = caseMagie.checked;
    form.querySelector(".toggle-magie").classList.toggle("on", modeMagique);
  });
  form.querySelector(".encaisser").addEventListener("click", encaisser);
  form.querySelectorAll("input").forEach(i =>
    i.addEventListener("keydown", ev => { if (ev.key === "Enter") encaisser(); }));
  form.querySelector(".annuler-degat")?.addEventListener("click", () => {
    fiche.ressources.protection.actuel = dernierDegat.avant.protection;
    fiche.ressources.pv.actuel = dernierDegat.avant.pv;
    dernierDegat = null;
    rafraichir();
  });
  zone.appendChild(form);
}
