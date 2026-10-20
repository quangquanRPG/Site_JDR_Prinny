// ─────────────────────────────────────────────────────────────
//  Panneaux « Ajouter un personnage joueur » et « Ajouter un PNJ »
// ─────────────────────────────────────────────────────────────
"use strict";

function panneauAjout(type) {
  const pj = type === "PJ";
  const nom = el("input", { type: "text", maxlength: "60", autocomplete: "off" });
  const notes = el("textarea", { rows: "2", maxlength: "500", placeholder: pj ? "Classe, origine, détail utile…" : "Rôle, lieu, attitude…" });
  const joueur = el("select", {}, el("option", { value: "", text: "Chargement des joueurs…" }));
  const msg = el("p", { class: "message", role: "status" });
  const bouton = el("button", { type: "submit", class: "bouton", text: pj ? "Ajouter le personnage" : "Ajouter le PNJ" });

  const form = el("form", { class: "form-perso", novalidate: true },
    el("label", { class: "champ" }, el("span", { text: pj ? "Nom du personnage" : "Nom du PNJ" }), nom),
    pj ? el("label", { class: "champ" }, el("span", { text: "Joueur" }), joueur) : null,
    el("label", { class: "champ" }, el("span", {}, "Notes ", el("em", { text: "(facultatif)" })), notes),
    msg,
    bouton,
  );

  if (pj) chargerJoueurs(joueur, bouton);

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const donnees = { jdr: jdrCourant.jdr.id, type, nom: nom.value.trim(), joueur: pj ? joueur.value : "", notes: notes.value.trim() };
    const err = erreurPerso(donnees);
    if (err) return ecrireMessage(msg, err);
    bouton.disabled = true;
    ecrireMessage(msg, "");
    try {
      const rep = await appelConnecte("ajouterPerso", donnees);
      if (sessionPerdue(rep)) return;
      if (!rep.ok) return ecrireMessage(msg, rep.erreur || "Ajout impossible.");
      jdrCourant.personnages.push(rep.perso);
      majMenu();
      nom.value = "";
      notes.value = "";
      ecrireMessage(msg, "« " + rep.perso.nom + " » a été ajouté" + (pj ? " pour " + rep.perso.joueur : "") + ".", "ok");
      nom.focus();
    } catch (e) {
      ecrireMessage(msg, e.message);
    } finally {
      bouton.disabled = false;
    }
  });

  setTimeout(() => nom.focus(), 0);
  return form;
}

async function chargerJoueurs(select, bouton) {
  select.disabled = true;
  try {
    const rep = await appelConnecte("listeJoueurs");
    if (sessionPerdue(rep)) return;
    if (!rep.ok) throw new Error(rep.erreur || "Liste des joueurs indisponible.");
    if (!rep.joueurs.length) {
      select.replaceChildren(el("option", { value: "", text: "Aucun compte joueur inscrit pour l'instant" }));
      bouton.disabled = true;
      return;
    }
    select.replaceChildren(
      el("option", { value: "", text: "Choisir un joueur…" }),
      ...rep.joueurs.map((p) => el("option", { value: p, text: p })),
    );
    select.disabled = false;
  } catch (e) {
    select.replaceChildren(el("option", { value: "", text: e.message }));
  }
}
