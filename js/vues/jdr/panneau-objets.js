// ─────────────────────────────────────────────────────────────
//  Panneau « Objets uniques » (MJ) : les armures du JDR, une par une
//  Chaque objet a son nom, sa Protection max, sa Protection actuelle (son usure),
//  sa valeur et son porteur. Il garde son usure quand il change de porteur.
//  Serveur : apps-script/Objets.gs (actions enregistrerObjet, supprimerObjet ;
//  la liste arrive avec l'action « jdr »).
// ─────────────────────────────────────────────────────────────
"use strict";

let objetEnEdition = null;   // null = formulaire fermé, {} = nouvel objet, objet = modification

function nomPorteur(id) {
  const p = jdrCourant.personnages.find((x) => x.id === id);
  return p ? p.nom + (p.type === "PJ" ? " (" + p.joueur + ")" : " (PNJ)") : null;
}

function panneauObjets() {
  const objets = jdrCourant.objets || [];
  const ouvrir = (o) => { objetEnEdition = o; rafraichirPanneau(); };

  const entete = el("div", { class: "objets-entete" },
    el("p", { class: "doux", text: "Chaque armure est un objet unique : elle garde son usure (Protection actuelle) même quand elle change de porteur. Valeur 10 = armure divine." }),
    objetEnEdition ? null : el("button", { type: "button", class: "bouton-petit", text: "+ Nouvel objet", onclick: () => ouvrir({}) }));

  const ligne = (o) => {
    const porteur = o.porteur ? nomPorteur(o.porteur) || "Personnage supprimé" : null;
    const abime = o.protectionActuelle < o.protectionMax;
    return el("li", { class: "objet-ligne" + (objetEnEdition && objetEnEdition.id === o.id ? " en-edition" : "") },
      el("div", { class: "objet-txt" },
        el("strong", { text: o.nom }),
        el("small", {},
          "Armure · Protection ",
          el("b", { class: abime ? "abime" : "", text: o.protectionActuelle + " / " + o.protectionMax }),
          " · Valeur " + String(o.valeur).replace(".", ",") + (Number(o.valeur) === 10 ? " ✦ divine" : "")),
        el("small", { class: porteur ? "" : "sans-porteur", text: porteur ? "Porté par " + porteur : "Porté par personne" }),
        o.description ? el("p", { text: o.description }) : null),
      el("div", { class: "objet-actions" },
        el("button", { type: "button", class: "bouton-petit", text: "Modifier", onclick: () => ouvrir(o) }),
        boutonSupprObjet(o)));
  };

  return el("div", { class: "panneau-objets" },
    entete,
    objetEnEdition ? formulaireObjet(objetEnEdition) : null,
    objets.length
      ? el("ul", { class: "liste-objets" }, ...[...objets].sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map(ligne))
      : el("p", { class: "etat doux", text: "Aucun objet pour l'instant." }));
}

function formulaireObjet(o) {
  const nouveau = !o.id;
  const champ = (texte, entree, aide) => el("label", { class: "champ" }, el("span", {}, texte, aide ? el("em", { text: " " + aide }) : null), entree);
  const nom = el("input", { type: "text", maxlength: "60", value: o.nom || "", autocomplete: "off" });
  const description = el("textarea", { rows: "2", maxlength: "300", placeholder: "Aspect, histoire, effet particulier…" });
  description.value = o.description || "";
  const max = el("input", { type: "number", min: "0", step: "1", value: o.protectionMax ?? 10 });
  const actuelle = el("input", { type: "number", min: "0", step: "1", value: o.protectionActuelle ?? "", placeholder: "= max" });
  const valeur = el("input", { type: "number", min: "0", step: "any", value: o.valeur ?? 1 });
  const porteur = el("select", {},
    el("option", { value: "", text: "Personne" }),
    ...jdrCourant.personnages.map((p) => el("option", { value: p.id, text: p.nom + (p.type === "PJ" ? " (" + p.joueur + ")" : " (PNJ)") })));
  porteur.value = o.porteur || "";
  const msg = el("p", { class: "message", role: "status" });
  const bouton = el("button", { type: "submit", class: "bouton", text: nouveau ? "Créer l'objet" : "Enregistrer" });
  const annuler = el("button", { type: "button", class: "bouton bouton--secondaire", text: "Annuler",
    onclick: () => { objetEnEdition = null; rafraichirPanneau(); } });

  const form = el("form", { class: "form-objet", novalidate: true },
    el("h3", { text: nouveau ? "Nouvel objet (armure)" : "Modifier « " + o.nom + " »" }),
    champ("Nom", nom),
    el("div", { class: "grille-objet" },
      champ("Protection max", max),
      champ("Protection actuelle", actuelle, nouveau ? "(vide = neuve)" : "(usure)"),
      champ("Valeur", valeur, "(10 = divine)")),
    champ("Porté par", porteur),
    champ("Description", description, "(facultatif)"),
    msg,
    el("div", { class: "boutons" }, annuler, bouton));

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const donnees = {
      id: o.id || undefined,
      nom: nom.value.trim(), description: description.value.trim(),
      protectionMax: max.value, protectionActuelle: actuelle.value === "" ? "" : actuelle.value,
      valeur: valeur.value, porteur: porteur.value,
    };
    if (!donnees.nom) return ecrireMessage(msg, "Il faut un nom.");
    if (!(Number(donnees.protectionMax) >= 0)) return ecrireMessage(msg, "Protection max invalide.");
    bouton.disabled = true;
    ecrireMessage(msg, "Enregistrement…", "");
    try {
      const rep = await appelConnecte("enregistrerObjet", { jdr: jdrCourant.jdr.id, objet: donnees });
      if (sessionPerdue(rep)) return;
      if (!rep.ok) { bouton.disabled = false; return ecrireMessage(msg, rep.erreur || "Enregistrement impossible."); }
      jdrCourant.objets = rep.objets;
      objetEnEdition = null;
      majMenu();
      rafraichirPanneau();
    } catch (e) {
      bouton.disabled = false;
      ecrireMessage(msg, e.message);
    }
  });
  setTimeout(() => nom.focus(), 0);
  return form;
}

// Suppression en deux clics : « Supprimer » puis « Confirmer ? »
function boutonSupprObjet(o) {
  let arme = false;
  let minuteur;
  const b = el("button", { type: "button", class: "bouton-suppr", text: "Supprimer", "aria-label": "Supprimer " + o.nom });
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
      const rep = await appelConnecte("supprimerObjet", { jdr: jdrCourant.jdr.id, objet: o.id });
      if (sessionPerdue(rep)) return;
      if (!rep.ok) throw new Error(rep.erreur || "Suppression impossible.");
      jdrCourant.objets = rep.objets;
      if (objetEnEdition && objetEnEdition.id === o.id) objetEnEdition = null;
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
