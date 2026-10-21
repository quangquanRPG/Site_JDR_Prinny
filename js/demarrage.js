// ─────────────────────────────────────────────────────────────
//  Démarrage du site
//  Branche les boutons de index.html, puis ouvre la session si elle existe encore.
//  C'est le seul fichier qui lance quelque chose au chargement : il doit rester
//  le DERNIER <script> de index.html.
// ─────────────────────────────────────────────────────────────
"use strict";

function brancherEvenements() {
  document.querySelectorAll(".onglet").forEach((o) => o.addEventListener("click", () => changerMode(o.dataset.mode)));
  $("#form-auth").addEventListener("submit", envoyer);
  $("#bouton-deconnexion").addEventListener("click", deconnexion);
  $("#bouton-nouveau-jdr").addEventListener("click", () => ouvrirFormJdr(true));
  $("#annuler-jdr").addEventListener("click", () => ouvrirFormJdr(false));
  $("#form-jdr").addEventListener("submit", creerJdr);
  $("#voir-mdp").addEventListener("click", () => {
    const champ = $("#mdp");
    const visible = champ.type === "password";
    champ.type = visible ? "text" : "password";
    $("#voir-mdp").classList.toggle("actif", visible);
  });
  document.querySelectorAll(".tuile").forEach((t) =>
    t.addEventListener("click", () => ouvrirPanneau(panneauActif === t.dataset.panneau ? null : t.dataset.panneau)),
  );
  window.addEventListener("hashchange", route);
  window.addEventListener("message", surMessageDeLaFiche);
  window.addEventListener("beforeunload", avantFermeture);
}

async function demarrer() {
  $("#titre-site").textContent = CFG.NOM_SITE || "Le Grimoire";
  $("#note-demo").hidden = !DEMO;
  $("#version-site").textContent = VERSION ? "Version " + VERSION : "";
  brancherEvenements();

  const infos = await infosServeur();
  if (infos.inscription === false) {
    $("#onglet-inscription").hidden = true;
    $(".onglets").classList.add("seul");
  }

  const j = jeton.lire();
  if (j) {
    try {
      const rep = await appel("moi", { jeton: j });
      if (rep.ok) {
        moiInfo = { pseudo: rep.pseudo, role: rep.role };
        return route();
      }
    } catch (e) { /* serveur injoignable : retour à l'accueil */ }
    jeton.effacer();
  }
  afficherAccueil();
}

demarrer();
