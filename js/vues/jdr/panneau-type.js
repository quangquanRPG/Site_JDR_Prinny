// ─────────────────────────────────────────────────────────────
//  Panneau « Type de fiche perso »
// ─────────────────────────────────────────────────────────────
"use strict";

function panneauType() {
  if (!FICHES.length) {
    return el("p", { class: "etat doux", text: "Aucun type de fiche disponible pour l'instant. On les créera ensemble et ils apparaîtront ici." });
  }
  const actuel = jdrCourant.jdr.typeFiche || "";
  const msg = el("p", { class: "message", role: "status" });

  async function choisir(id, input) {
    ecrireMessage(msg, "Enregistrement…", "ok");
    try {
      const rep = await appelConnecte("choisirFiche", { id: jdrCourant.jdr.id, typeFiche: id });
      if (sessionPerdue(rep)) return;
      if (!rep.ok) throw new Error(rep.erreur || "Enregistrement impossible.");
      jdrCourant.jdr.typeFiche = id;
      majMenu();
      ecrireMessage(msg, "Type de fiche enregistré pour ce JDR.", "ok");
    } catch (e) {
      input.checked = false;
      const precedent = document.querySelector('input[name="type-fiche"][value="' + CSS.escape(jdrCourant.jdr.typeFiche || "") + '"]');
      if (precedent) precedent.checked = true;
      ecrireMessage(msg, e.message);
    }
  }

  const liste = el("div", { class: "choix-fiches" },
    ...FICHES.map((f) => {
      const input = el("input", { type: "radio", name: "type-fiche", value: f.id, checked: f.id === actuel });
      input.addEventListener("change", () => choisir(f.id, input));
      return el("label", { class: "choix-fiche" },
        input,
        el("span", {}, el("strong", { text: f.nom }), f.description ? el("small", { text: f.description }) : null),
      );
    }),
  );
  return el("div", {}, liste, msg);
}
