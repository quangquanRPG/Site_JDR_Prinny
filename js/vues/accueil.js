// ─────────────────────────────────────────────────────────────
//  Accueil : connexion / création de compte
// ─────────────────────────────────────────────────────────────
"use strict";

function changerMode(nouveau) {
  mode = nouveau;
  document.querySelectorAll(".onglet").forEach((o) => {
    const actif = o.dataset.mode === mode;
    o.classList.toggle("actif", actif);
    o.setAttribute("aria-selected", actif);
  });
  const insc = mode === "inscription";
  $("#ligne-confirm").hidden = !insc;
  $("#ligne-role").hidden = !insc;
  $("#mdp").autocomplete = insc ? "new-password" : "current-password";
  $("#bouton-envoyer").textContent = insc ? "Créer mon compte" : "Entrer";
  message("");
}

function afficherAccueil() {
  document.title = CFG.NOM_SITE || "Grimoire des Aventuriers";
  $("#form-auth").reset();
  changerMode("connexion");
  montrer("vue-accueil");
  $("#pseudo").focus();
}

async function envoyer(ev) {
  ev.preventDefault();
  const pseudo = $("#pseudo").value.trim();
  const mdp = $("#mdp").value;
  const rester = $("#rester").checked;

  if (mode === "inscription") {
    const err = erreurPseudo(pseudo);
    if (err) return message(err);
    if (mdp.length < MDP_MIN) return message("Le mot de passe doit faire au moins " + MDP_MIN + " caractères.");
    if (mdp !== $("#mdp2").value) return message("Les deux mots de passe ne correspondent pas.");
  } else {
    if (!pseudo || !mdp) return message("Indique ton pseudo et ton mot de passe.");
  }

  const bouton = $("#bouton-envoyer");
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = "…";
  message("");
  try {
    const donnees = { pseudo, empreinte: await empreinte(mdp), rester };
    if (mode === "inscription") donnees.role = document.querySelector('input[name="role"]:checked').value;
    const rep = await appel(mode, donnees);
    if (!rep.ok) return message(rep.erreur || "Échec.");
    jeton.ecrire(rep.jeton, rester);
    moiInfo = { pseudo: rep.pseudo, role: rep.role };
    route();
  } catch (e) {
    message(e.message);
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

function fermerSession() {
  jeton.effacer();
  moiInfo = null;
  jdrCourant = null;
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  afficherAccueil();
}

async function deconnexion() {
  const j = jeton.lire();
  fermerSession();
  if (j) appel("deconnexion", { jeton: j }).catch(() => {});
}
