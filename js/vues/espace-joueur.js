// ─────────────────────────────────────────────────────────────
//  Espace joueur : ses personnages, puis ceux des autres joueurs de ses JDR
//  (« Compagnons d'aventure », fiches en lecture seule)
// ─────────────────────────────────────────────────────────────
"use strict";

async function chargerMesPersos() {
  const liste = $("#liste-mes-persos");
  const etat = (t) => { $("#etat-mes-persos").textContent = t || ""; $("#etat-mes-persos").hidden = !t; };
  liste.replaceChildren();
  $("#liste-compagnons").replaceChildren();
  $("#zone-compagnons").hidden = true;
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
    afficherCompagnons(rep.compagnons || []);
  } catch (e) {
    etat(e.message);
  }
}

// Personnages des autres joueurs, regroupés par JDR
function afficherCompagnons(compagnons) {
  const liste = $("#liste-compagnons");
  liste.replaceChildren(...compagnons
    .slice()
    .sort((a, b) => a.jdrNom.localeCompare(b.jdrNom, "fr") || a.nom.localeCompare(b.nom, "fr"))
    .map((p) => el("li", {},
      el("a", { class: "jdr compagnon", href: "#fiche/" + p.id },
        el("h3", { text: p.nom }),
        el("p", { text: p.jdrNom + " · joué par " + p.joueur }),
        el("p", { class: "date", text: p.aFiche ? "Voir la fiche (lecture seule)" : "Fiche pas encore remplie" }),
      ),
    )));
  $("#zone-compagnons").hidden = !compagnons.length;
}
