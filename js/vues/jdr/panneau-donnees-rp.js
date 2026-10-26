// ─────────────────────────────────────────────────────────────
//  Panneau « Données du RP » : éditeur des listes du MJ
//  Le brouillon (etat.js → brouillonRp) est gardé tant qu'on reste sur le même JDR.
// ─────────────────────────────────────────────────────────────
"use strict";

function panneauDonneesRp() {
  const idJdr = jdrCourant.jdr.id;
  if (!brouillonRp || brouillonRp.jdrId !== idJdr) {
    brouillonRp = { jdrId: idJdr, donnees: normaliserDonneesRp(jdrCourant.jdr.donneesRp), sale: false, onglet: "materiaux" };
  }
  const b = brouillonRp;
  const onglets = el("div", { class: "sous-onglets", role: "tablist" });
  const contenu = el("div", {});
  const msg = el("p", { class: "message", role: "status" });
  const btnAnnuler = el("button", { type: "button", class: "bouton bouton--secondaire", text: "Annuler" });
  const btnSauver = el("button", { type: "button", class: "bouton", text: "Enregistrer" });

  const majEtat = () => {
    btnSauver.disabled = !b.sale;
    btnAnnuler.disabled = !b.sale;
    if (b.sale) ecrireMessage(msg, "Modifications non enregistrées.", "attente");
    majMenu();
  };
  const marquer = () => { if (!b.sale) { b.sale = true; majEtat(); } };

  function champ(c, it, change) {
    if (c.type === "forme") {   // case « deux formes » + champs de la 2e forme (it[c.k] = objet ou null)
      const coche = el("input", { type: "checkbox" });
      coche.checked = !!it[c.k];
      const sous = el("div", { class: "champs-rp sous-forme" });
      const dessinerSous = () => {
        sous.replaceChildren(...(it[c.k] ? c.champs.map((sc) => champ(sc, it[c.k], change)) : []));
        sous.hidden = !it[c.k];
      };
      coche.addEventListener("change", () => {
        it[c.k] = coche.checked ? { nom: "", degats: "", deuxMains: false, description: "" } : null;
        change();
        dessinerSous();
        if (coche.checked) sous.querySelector("input")?.focus();
      });
      dessinerSous();
      return el("div", { class: "forme-rp" }, el("label", { class: "case-rp" }, coche, el("span", { text: c.label })), sous);
    }
    if (c.type === "pieces") {
      return el("div", { class: "pieces-rp" },
        el("span", { class: "label-rp", text: "Pièces du set" }),
        b.donnees.typesArmure.length
          ? el("div", { class: "grille-pieces" }, ...b.donnees.typesArmure.map((p) => {
              const coche = el("input", { type: "checkbox" });
              coche.checked = it.pieces.includes(p.id);
              coche.addEventListener("change", () => {
                it.pieces = coche.checked ? [...it.pieces, p.id] : it.pieces.filter((x) => x !== p.id);
                change();
              });
              return el("label", { class: "case-rp" }, coche, el("span", { text: p.nom + " (" + p.armure + ")" }));
            }))
          : el("p", { class: "etat doux", text: "Ajoute d'abord des types d'armure." }),
      );
    }
    if (c.type === "case") {
      const coche = el("input", { type: "checkbox" });
      coche.checked = !!it[c.k];
      coche.addEventListener("change", () => { it[c.k] = coche.checked; change(); });
      return el("label", { class: "case-rp" }, coche, el("span", { text: c.label }));
    }
    let saisie;
    if (c.type === "liste") {
      const source = b.donnees[c.source];
      saisie = el("select", {}, el("option", { value: "", text: "—" }), ...source.map((x) => el("option", { value: x.id, text: x.nom || "(sans nom)" })));
      saisie.value = source.some((x) => x.id === it[c.k]) ? it[c.k] : "";
      saisie.addEventListener("change", () => { it[c.k] = saisie.value; change(); });
    } else if (c.type === "zone") {
      saisie = el("textarea", { rows: "2", maxlength: "300" });
      saisie.value = it[c.k] || "";
      saisie.addEventListener("input", () => { it[c.k] = saisie.value; change(); });
    } else if (c.type === "nombre") {
      saisie = el("input", { type: "number", step: c.pas || "1" });
      saisie.value = it[c.k] ?? 0;
      saisie.addEventListener("input", () => { it[c.k] = Number(saisie.value) || 0; change(); });
    } else {
      saisie = el("input", { type: "text", maxlength: "60", placeholder: c.placeholder || "" });
      saisie.value = it[c.k] || "";
      saisie.addEventListener("input", () => { it[c.k] = saisie.value; change(); });
    }
    return el("label", { class: "champ-rp" + (c.type === "zone" ? " champ-large" : "") }, el("span", { class: "label-rp", text: c.label }), saisie);
  }

  function carte(o, it) {
    const resume = o.cle === "setsArmure" ? el("p", { class: "resume-rp" }) : null;
    const majResume = () => { if (resume) resume.textContent = resumeSet(b.donnees, it); };
    majResume();
    return el("div", { class: "carte-rp", "data-id": it.id },
      el("div", { class: "champs-rp" }, ...o.champs.map((c) => champ(c, it, () => { marquer(); majResume(); }))),
      resume,
      el("button", {
        type: "button", class: "retirer-rp", text: "✕", title: "Supprimer", "aria-label": "Supprimer " + (it.nom || ""),
        onclick: () => { b.donnees[o.cle] = b.donnees[o.cle].filter((x) => x !== it); marquer(); dessiner(); },
      }),
    );
  }

  function dessiner() {
    onglets.replaceChildren(...ONGLETS_RP.map((o) => el("button", {
      type: "button", role: "tab", class: "sous-onglet" + (o.cle === b.onglet ? " actif" : ""),
      "aria-selected": o.cle === b.onglet, text: o.titre + " · " + b.donnees[o.cle].length,
      onclick: () => { b.onglet = o.cle; dessiner(); },
    })));
    const o = ONGLETS_RP.find((x) => x.cle === b.onglet);
    const elements = b.donnees[o.cle];
    contenu.replaceChildren(
      elements.length
        ? el("div", { class: "liste-rp" }, ...elements.map((it) => carte(o, it)))
        : el("p", { class: "etat doux", text: "Liste vide." }),
      el("button", {
        type: "button", class: "bouton-petit", text: "+ Ajouter",
        onclick: () => {
          const it = { id: o.prefixe + "_" + aleatoire().slice(0, 6), ...o.nouveau() };
          b.donnees[o.cle].push(it);
          marquer();
          dessiner();
          const saisie = contenu.querySelector('[data-id="' + it.id + '"] input');
          if (saisie) { saisie.focus(); saisie.select(); }
        },
      }),
    );
  }

  btnAnnuler.addEventListener("click", () => {
    b.donnees = normaliserDonneesRp(jdrCourant.jdr.donneesRp);
    b.sale = false;
    majEtat();
    ecrireMessage(msg, "");
    dessiner();
  });

  btnSauver.addEventListener("click", async () => {
    for (const o of ONGLETS_RP) {
      for (const it of b.donnees[o.cle]) {
        it.nom = String(it.nom || "").trim();
        if (!it.nom) {
          b.onglet = o.cle;
          dessiner();
          return ecrireMessage(msg, "Chaque élément de « " + o.titre + " » doit avoir un nom.");
        }
        if (it.forme2) {
          it.forme2.nom = String(it.forme2.nom || "").trim();
          if (!it.forme2.nom) {
            b.onglet = o.cle;
            dessiner();
            return ecrireMessage(msg, "La 2e forme de « " + it.nom + " » doit avoir un nom.");
          }
        }
      }
    }
    btnSauver.disabled = true;
    ecrireMessage(msg, "Enregistrement…", "attente");
    try {
      const rep = await appelConnecte("enregistrerDonneesRp", { id: b.jdrId, donneesRp: b.donnees });
      if (sessionPerdue(rep)) return;
      if (!rep.ok) throw new Error(rep.erreur || "Enregistrement impossible.");
      jdrCourant.jdr.donneesRp = JSON.parse(JSON.stringify(b.donnees));
      b.sale = false;
      majEtat();
      ecrireMessage(msg, "Enregistré ✓ — les fiches de ce JDR utilisent ces listes dès leur ouverture.", "ok");
    } catch (e) {
      btnSauver.disabled = false;
      ecrireMessage(msg, e.message);
    }
  });

  dessiner();
  majEtat();
  return el("div", { class: "univers" },
    jdrCourant.jdr.donneesRp ? null : el("p", { class: "doux note-rp", text: "Ce sont des exemples de départ : modifie-les puis enregistre." }),
    onglets,
    contenu,
    el("div", { class: "pied-rp" }, msg, btnAnnuler, btnSauver),
  );
}
