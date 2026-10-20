// ─────────────────────────────────────────────────────────────
//  Fiche : cadre « Réussite » à droite
//  La fiche, dans son cadre, ne peut pas rester visible au défilement : c'est le site qui l'affiche.
// ─────────────────────────────────────────────────────────────
"use strict";

function afficherReussiteFiche(r) {
  const zone = $("#reussite-fiche");
  const mieux = r.reussite < r.base, pire = r.reussite > r.base;
  const chance = typeof r.chance === "number" ? (Math.round(r.chance * 1000) / 10).toLocaleString("fr-FR") + " %" : null;
  zone.replaceChildren(...[
    el("div", { class: "titre", text: "Réussite" }),
    el("div", { class: "valeur" + (mieux ? " mieux" : pire ? " pire" : ""), text: r.reussite + "+" }),
    el("div", { class: "sous" + (mieux || pire ? "" : " neutre"), text: mieux || pire ? "au lieu de " + r.base + "+" : "sur chaque d6" }),
    el("div", { class: "faces" }, ...[1, 2, 3, 4, 5, 6].map((f) => el("span", { class: "face" + (f >= r.reussite ? " ok" : ""), text: String(f) }))),
    chance ? el("div", { class: "chance" }, el("b", { text: chance }), " par dé") : null,
    r.effort ? el("div", { class: "effet", text: "Effort : " + r.effort }) : null,
    r.fatigue ? el("div", { class: "fatigue", text: "Fatigue : " + r.fatigue }) : null,
  ].filter(Boolean));   // replaceChildren écrirait « null » pour un élément absent
  zone.hidden = false;
}
