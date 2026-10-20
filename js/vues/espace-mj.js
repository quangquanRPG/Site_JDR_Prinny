// ─────────────────────────────────────────────────────────────
//  Espace MJ : liste et création de ses JDR
// ─────────────────────────────────────────────────────────────
"use strict";

function etatJdr(texte) {
  $("#etat-jdr").textContent = texte || "";
  $("#etat-jdr").hidden = !texte;
}

function carteJdr(j) {
  const d = new Date(j.cree);
  return el("li", {},
    el("a", { class: "jdr", href: "#jdr/" + j.id },
      el("h3", { text: j.nom }),
      j.description ? el("p", { text: j.description }) : null,
      !isNaN(d) ? el("p", { class: "date", text: "Créé le " + d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) }) : null,
    ),
  );
}

async function chargerJdr() {
  const liste = $("#liste-jdr");
  liste.replaceChildren();
  etatJdr("Chargement des JDR…");
  try {
    const rep = await appelConnecte("mesJdr");
    if (sessionPerdue(rep)) return;
    if (!rep.ok) return etatJdr(rep.erreur || "Impossible de charger les JDR.");
    rep.jdr.forEach((j) => liste.append(carteJdr(j)));
    etatJdr(rep.jdr.length ? "" : "Aucun JDR pour l'instant. Crée le premier !");
  } catch (e) {
    etatJdr(e.message);
  }
}

function ouvrirFormJdr(ouvrir) {
  $("#form-jdr").hidden = !ouvrir;
  $("#bouton-nouveau-jdr").hidden = ouvrir;
  ecrireMessage($("#message-jdr"), "");
  if (ouvrir) {
    $("#form-jdr").reset();
    $("#jdr-nom").focus();
  }
}

async function creerJdr(ev) {
  ev.preventDefault();
  const nom = $("#jdr-nom").value.trim();
  const description = $("#jdr-desc").value.trim();
  const msg = $("#message-jdr");
  if (nom.length < 2) return ecrireMessage(msg, "Donne un nom à ton JDR (2 caractères minimum).");

  const bouton = $("#creer-jdr");
  bouton.disabled = true;
  bouton.textContent = "…";
  try {
    const rep = await appelConnecte("creerJdr", { nom, description });
    if (sessionPerdue(rep)) return;
    if (!rep.ok) return ecrireMessage(msg, rep.erreur || "Création impossible.");
    $("#liste-jdr").prepend(carteJdr(rep.jdr));
    etatJdr("");
    ouvrirFormJdr(false);
  } catch (e) {
    ecrireMessage(msg, e.message);
  } finally {
    bouton.disabled = false;
    bouton.textContent = "Créer";
  }
}
