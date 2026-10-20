// ─────────────────────────────────────────────────────────────
//  Panneaux « Voir les personnages » et « Supprimer un personnage »
// ─────────────────────────────────────────────────────────────
"use strict";

function listePersos(avecSuppr) {
  const ps = jdrCourant.personnages;
  if (!ps.length) return el("p", { class: "etat doux", text: "Aucun personnage dans ce JDR pour l'instant." });

  const ligne = (p) => el("li", { class: "perso" },
    el("div", { class: "perso-txt" },
      el("strong", { text: p.nom }),
      el("small", { text: p.type === "PJ" ? "Joué par " + p.joueur : "PNJ" }),
      p.notes ? el("p", { text: p.notes }) : null,
    ),
    avecSuppr ? boutonSuppr(p) : el("a", { class: "bouton-fiche", href: "#fiche/" + p.id, text: p.aFiche ? "Fiche" : "Créer la fiche" }),
  );
  const groupe = (titre, liste) => liste.length
    ? el("div", { class: "groupe" },
        el("h3", { text: titre + " · " + liste.length }),
        el("ul", { class: "liste-persos" }, ...liste.map(ligne)))
    : null;

  return el("div", {},
    groupe("Personnages joueurs", ps.filter((p) => p.type === "PJ")),
    groupe("PNJ", ps.filter((p) => p.type !== "PJ")),
  );
}

// Suppression en deux clics : « Supprimer » puis « Confirmer ? »
function boutonSuppr(p) {
  let arme = false;
  let minuteur;
  const b = el("button", { type: "button", class: "bouton-suppr", text: "Supprimer", "aria-label": "Supprimer " + p.nom });
  const desarmer = () => { arme = false; b.textContent = "Supprimer"; b.classList.remove("arme"); };
  b.addEventListener("click", async () => {
    if (!arme) {
      arme = true;
      b.textContent = "Confirmer ?";
      b.classList.add("arme");
      minuteur = setTimeout(desarmer, 4000);
      return;
    }
    clearTimeout(minuteur);
    b.disabled = true;
    b.textContent = "…";
    try {
      const rep = await appelConnecte("supprimerPerso", { id: p.id });
      if (sessionPerdue(rep)) return;
      if (!rep.ok) throw new Error(rep.erreur || "Suppression impossible.");
      jdrCourant.personnages = jdrCourant.personnages.filter((x) => x.id !== p.id);
      majMenu();
      rafraichirPanneau();
    } catch (e) {
      b.disabled = false;
      desarmer();
      b.title = e.message;
      b.textContent = "Échec, réessayer";
    }
  });
  return b;
}
