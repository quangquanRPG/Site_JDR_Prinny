/* ================================================================
   AFFICHAGE — inventaires (important et non important)
   ================================================================ */
"use strict";

const inventaireEnGestion = {};   // par inventaire : bouton « Gérer » ouvert ?
let champInvEnEdition = null;      // ex. "inventaire:max" ou "inventaireNonImportant:caches"

function afficherInventaire(fiche, u, cle) {
  const def = defInventaire(cle);
  const inv = fiche[cle];
  const racine = document.getElementById("zone-" + cle);
  const peutGerer = droits.gererInventaire(u, fiche);
  const peutMax = droits.modifierMaxInventaire(u);
  const voitCaches = droits.voirCaches(u, fiche);
  const gestion = !!inventaireEnGestion[cle] && peutGerer;
  const objetsVisibles = inv.objets.filter(o => voitCaches || !o.cache);
  // Les autres joueurs ne voient ni les objets cachés ni la place qu'ils prennent
  const utilisees = emplacementsUtilises(fiche, cle) - (inv.objets.length - objetsVisibles.length);
  const max = inv.max;
  const plein = emplacementsLibres(fiche, cle) < 1;
  const nbCaches = objetsCaches(fiche, cle).length;
  const maxCaches = inv.maxCaches;
  const cachesPleins = nbCaches >= maxCaches;

  racine.innerHTML = `
    <h2>${def.titre}</h2>
    <div class="inv-entete"></div>
    <div class="inv-barre"><div></div></div>
    <section class="cartes"></section>`;

  // En-tête : compteurs (max modifiables par le MJ) + bouton Gérer
  const compteur = (champ, valeur, maximum, libelle, titre) => {
    const edit = champInvEnEdition === cle + ":" + champ && peutMax;
    return `<span class="inv-compte ${valeur > maximum ? "plein" : ""}" data-champ="${champ}">
      <b>${valeur}</b> /
      ${edit
        ? `<input type="number" min="0" step="1" value="${maximum}" title="${titre}">
           <button class="btn-icone ok" title="Valider">✓</button><button class="btn-icone annuler" title="Annuler">✕</button>`
        : `<b>${maximum}</b> ${libelle} ${peutMax ? `<button class="btn-icone crayon" title="${titre}">✎</button>` : ""}`}
    </span>`;
  };
  const entete = racine.querySelector(".inv-entete");
  entete.innerHTML = `
    <span class="inv-comptes">
      ${compteur("max", utilisees, max, "emplacements", "Nombre max d'emplacements (MJ)")}
      ${voitCaches ? compteur("caches", nbCaches, maxCaches, "cachés", "Nombre max d'objets cachés (MJ)") : ""}
    </span>
    ${peutGerer ? `<button class="btn gerer">${gestion ? "Terminer" : "Gérer"}</button>` : ""}`;

  entete.querySelectorAll(".inv-compte").forEach(c => {
    const champ = c.dataset.champ;
    const fermer = () => { champInvEnEdition = null; rafraichir(); };
    const valider = () => {
      const v = c.querySelector("input").value;
      if (champ === "max") modifierMaxInventaire(fiche, v, u, cle); else modifierMaxCaches(fiche, v, u, cle);
      fermer();
    };
    c.querySelector(".crayon")?.addEventListener("click", () => {
      champInvEnEdition = cle + ":" + champ; rafraichir();
      const i = document.querySelector(`#zone-${cle} .inv-compte[data-champ="${champ}"] input`); i?.focus(); i?.select();
    });
    c.querySelector(".ok")?.addEventListener("click", valider);
    c.querySelector(".annuler")?.addEventListener("click", fermer);
    c.querySelector("input")?.addEventListener("keydown", ev => {
      if (ev.key === "Enter") valider();
      if (ev.key === "Escape") fermer();
    });
  });
  entete.querySelector(".gerer")?.addEventListener("click", () => { inventaireEnGestion[cle] = !gestion; rafraichir(); });

  const barre = racine.querySelector(".inv-barre");
  barre.classList.toggle("plein", utilisees > max);
  barre.firstElementChild.style.width = (max > 0 ? Math.min(100, utilisees / max * 100) : 100) + "%";

  // Cartes
  const zone = racine.querySelector(".cartes");
  const carteEquipement = (nom, type, cout) => {
    const el = document.createElement("div");
    el.className = "carte equipement";
    el.title = "Rangé : à équiper depuis la section Défense / Armes";
    el.innerHTML = `
      <div class="carte-haut"><span class="carte-titre">${echap(nom)}</span></div>
      <span class="carte-cout">${type} · ${cout} emplacements</span>`;
    zone.appendChild(el);
  };
  if (def.equipement) {
    armuresRangees(fiche).forEach(id => carteEquipement(trouverArmure(id)?.nom ?? id, "Armure", EMPLACEMENTS_ARMURE));
    armesRangees(fiche).forEach(id => carteEquipement(armeEffective(fiche, id)?.nom ?? id, "Arme", EMPLACEMENTS_ARME));
  }

  for (const o of objetsVisibles) {
    const el = document.createElement("div");
    el.className = "carte" + (o.cache ? " cachee" : "");
    el.innerHTML = `
      <div class="carte-haut">
        <span class="carte-titre">${echap(o.titre)}</span>
        <span class="carte-qte">${gestion
          ? `× <input type="number" min="0" step="1" value="${o.quantite}" title="Quantité">`
          : `× ${o.quantite}`}</span>
      </div>
      ${gestion
        ? `<textarea class="carte-desc-edit" placeholder="Description">${echap(o.description)}</textarea>`
        : o.description ? `<div class="carte-desc">${echap(o.description)}</div>` : ""}
      ${gestion || o.cache ? `<div class="carte-pied">
        ${gestion
          ? `<button class="btn cacher" ${!o.cache && cachesPleins ? `disabled title="Déjà ${maxCaches} objets cachés"` : ""}>${o.cache ? "Montrer" : "Cacher"}</button>`
          : `<span class="badge cache" title="Invisible pour les autres joueurs">Caché</span>`}
        ${gestion ? `<button class="btn suppr retirer">✕ Enlever</button>` : ""}
      </div>` : ""}`;
    el.querySelector(".carte-qte input")?.addEventListener("change", ev => modifierQuantite(fiche, o.id, ev.target.value, u, cle));
    el.querySelector(".carte-desc-edit")?.addEventListener("input", ev => modifierDescription(fiche, o.id, ev.target.value, u, cle));
    el.querySelector(".cacher")?.addEventListener("click", () => { basculerCache(fiche, o.id, u, cle); rafraichir(); });
    el.querySelector(".retirer")?.addEventListener("click", () => { retirerObjet(fiche, o.id, u, cle); rafraichir(); });
    zone.appendChild(el);
  }

  if (!zone.children.length && !gestion) zone.innerHTML = `<div class="vide">Vide.</div>`;

  // Carte d'ajout (seulement en mode Gérer)
  if (gestion) {
    const el = document.createElement("div");
    el.className = "carte ajout";
    el.innerHTML = plein
      ? `<span class="carte-desc">Inventaire plein : enlève un objet ou demande au MJ d'agrandir.</span>`
      : `
        <input name="titre" placeholder="Titre">
        <div class="ligne"><span class="label">Quantité</span><input name="quantite" type="number" min="0" step="1" value="1"></div>
        <textarea name="description" placeholder="Description (optionnel)"></textarea>
        <label class="case-cache" ${cachesPleins ? `title="Déjà ${maxCaches} objets cachés"` : ""}>
          <input type="checkbox" name="cache" ${cachesPleins ? "disabled" : ""}> Caché aux autres joueurs
        </label>
        <button type="button" class="btn principal ajouter">Ajouter</button>`;
    el.querySelector(".ajouter")?.addEventListener("click", () => {
      const titre = el.querySelector("[name=titre]").value.trim();
      if (!titre) { el.querySelector("[name=titre]").focus(); return; }
      ajouterObjet(fiche, {
        titre,
        quantite: el.querySelector("[name=quantite]").value,
        description: el.querySelector("[name=description]").value.trim(),
        cache: el.querySelector("[name=cache]").checked,
      }, u, cle);
      rafraichir();
      document.querySelector(`#zone-${cle} .carte.ajout [name=titre]`)?.focus();
    });
    zone.appendChild(el);
  }
}
