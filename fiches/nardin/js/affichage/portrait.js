/* ================================================================
   AFFICHAGE — image du personnage, en haut de la colonne de gauche
   L'image vient du site (message jdr:image) : c'est lui qui la lit et l'enregistre
   dans le Google Drive (js/vues/fiche/portrait.js du site). La fiche ne fait que
   l'afficher et renvoie les demandes au site :
     jdr:image-voir (ouvrir en grand), jdr:image-fichier (nouvelle image choisie),
     jdr:image-retirer.
   Fiche ouverte seule (démo) : pas d'image.
   ================================================================ */
"use strict";

function afficherPortraitPerso(m) {
  const zone = document.getElementById("portrait-perso");
  if (!m || (!m.present && !m.peut)) { zone.hidden = true; zone.innerHTML = ""; return; }
  zone.hidden = false;
  const nom = echap(m.nom || "personnage");
  const visuel = m.src
    ? `<button type="button" class="portrait-image" title="Voir en grand"><img src="${echap(m.src)}" alt="Portrait de ${nom}"></button>`
    : m.present
      ? `<div class="portrait-attente">${echap(m.etat === "chargement" ? "Chargement…" : m.etat || "")}</div>`
      : `<button type="button" class="portrait-ajout" title="Ajouter une image"><span class="plus">+</span><span>Ajouter une image</span></button>`;
  zone.innerHTML = `
    ${visuel}
    ${m.envoi ? `<p class="portrait-etat">${echap(m.envoi)}</p>` : ""}
    ${m.erreur ? `<p class="portrait-etat erreur">${echap(m.erreur)}</p>` : ""}
    ${m.peut && m.present ? `<div class="portrait-boutons">
      <button type="button" class="lien-image changer">Changer</button>
      <button type="button" class="lien-image danger retirer">Retirer</button></div>` : ""}
    <input type="file" accept="image/*" hidden>`;

  const choix = zone.querySelector("input[type=file]");
  const choisir = () => { choix.value = ""; choix.click(); };
  choix.addEventListener("change", () => {
    if (choix.files[0]) envoyerAuSite({ type: "jdr:image-fichier", fichier: choix.files[0] });
  });
  zone.querySelector(".portrait-image")?.addEventListener("click", () => envoyerAuSite({ type: "jdr:image-voir" }));
  zone.querySelector(".portrait-ajout")?.addEventListener("click", choisir);
  zone.querySelector(".changer")?.addEventListener("click", choisir);
  const retirer = zone.querySelector(".retirer");
  retirer?.addEventListener("click", () => {
    if (retirer.dataset.confirmer) return envoyerAuSite({ type: "jdr:image-retirer" });
    retirer.dataset.confirmer = "1";
    retirer.textContent = "Confirmer ?";
    setTimeout(() => { retirer.textContent = "Retirer"; delete retirer.dataset.confirmer; }, 3000);
  });
}
