// ─────────────────────────────────────────────────────────────
//  Espace joueur : ses personnages
// ─────────────────────────────────────────────────────────────
"use strict";

async function chargerMesPersos() {
  const liste = $("#liste-mes-persos");
  const etat = (t) => { $("#etat-mes-persos").textContent = t || ""; $("#etat-mes-persos").hidden = !t; };
  liste.replaceChildren();
  etat("Chargement de tes personnages…");
  try {
    const rep = await appelConnecte("mesPersos");
    if (sessionPerdue(rep)) return;
    if (!rep.ok) return etat(rep.erreur || "Impossible de charger tes personnages.");
    rep.persos.forEach((p) => liste.append(
      el("li", {},
        el("a", { class: "jdr", href: "#fiche/" + p.id },
          el("h3", { text: p.nom }),
          el("p", { text: p.jdrNom }),
          el("p", { class: "date", text: p.aFiche ? "Ouvrir la fiche" : "Fiche pas encore remplie" }),
        ),
      ),
    ));
    etat(rep.persos.length ? "" : "Aucun personnage pour l'instant. Ton MJ t'en attribuera un dans son JDR.");
  } catch (e) {
    etat(e.message);
  }
}
