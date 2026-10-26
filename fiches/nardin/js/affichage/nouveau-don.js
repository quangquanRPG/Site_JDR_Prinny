/* ================================================================
   AFFICHAGE — formulaire du MJ « Ajouter un don ou une connaissance »
   ================================================================ */
"use strict";

function afficherZoneMJ(fiche, u) {
  const zone = document.getElementById("zone-mj");
  zone.innerHTML = "";
  if (!droits.gererDons(u)) return;

  const optionsComp = COMPETENCES.map(c => `<option value="${c.id}">${c.nom}</option>`).join("");
  const ligneEffet = () => {
    const l = document.createElement("div");
    l.className = "effet-ligne";
    l.innerHTML = `
      <select name="typeEffet">
        <option value="des">Dés</option>
        <option value="reussite">Réussite des dés</option>
        <option value="regle">Règle spéciale</option>
      </select>
      <span class="partie-des effet-ligne">
        <select name="competence">${optionsComp}</select>
        <input type="number" name="valeur" value="1" step="1" title="Nombre de dés (négatif = malus)">
        <span class="label">d6</span>
      </span>
      <span class="partie-reussite effet-ligne" hidden>
        <input type="number" name="valeurReussite" value="-1" step="1" title="−1 = plus facile (4+ devient 3+), +1 = plus dur">
        <span class="label">sur le seuil (−1 = plus facile)</span>
      </span>
      <span class="partie-regle" hidden>
        <select name="regle">${Object.entries(REGLES_SPECIALES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
      </span>
      <button type="button" class="btn suppr" title="Retirer">✕</button>`;
    const typeEffet = l.querySelector("[name=typeEffet]");
    typeEffet.onchange = () => {
      l.querySelector(".partie-des").hidden = typeEffet.value !== "des";
      l.querySelector(".partie-reussite").hidden = typeEffet.value !== "reussite";
      l.querySelector(".partie-regle").hidden = typeEffet.value !== "regle";
    };
    l.querySelector(".suppr").onclick = () => l.remove();
    return l;
  };

  const form = document.createElement("div");
  form.className = "form-don";
  form.innerHTML = `
    <h3>Ajouter un don ou une connaissance</h3>
    <div class="ligne">
      <input name="nom" placeholder="Nom" required>
      <select name="type">${Object.entries(TYPES_DON).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
    </div>
    <textarea name="description" placeholder="Description (optionnel)"></textarea>
    <div class="label">Effets</div>
    <div class="liste-effets"></div>
    <div class="ligne">
      <button type="button" class="btn ajout-effet">+ Effet</button>
      <span class="espace"></span>
      <button type="button" class="btn principal creer">Créer</button>
    </div>
    <div class="erreur"></div>`;
  const liste = form.querySelector(".liste-effets");
  liste.appendChild(ligneEffet());
  form.querySelector(".ajout-effet").onclick = () => liste.appendChild(ligneEffet());

  form.querySelector(".creer").onclick = () => {
    const effets = [...liste.children].map(l => {
      const type = l.querySelector("[name=typeEffet]").value;
      if (type === "regle")    return { type: "regle", regle: l.querySelector("[name=regle]").value };
      if (type === "reussite") return { type: "reussite", valeur: parseInt(l.querySelector("[name=valeurReussite]").value, 10) || 0 };
      return {
        type: "des",
        competence: l.querySelector("[name=competence]").value,
        valeur: parseInt(l.querySelector("[name=valeur]").value, 10) || 0,
      };
    }).filter(e => e.type === "regle" || e.valeur !== 0);
    const champ = n => form.querySelector(`[name=${n}]`);
    const nom = champ("nom").value.trim();
    if (!nom) { form.querySelector(".erreur").textContent = "Il faut un nom."; return; }
    ajouterDon(fiche, { nom, type: champ("type").value, description: champ("description").value.trim(), effets }, u);
    rafraichir();
  };
  zone.appendChild(form);
}
