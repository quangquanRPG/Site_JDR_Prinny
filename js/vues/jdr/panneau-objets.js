// ─────────────────────────────────────────────────────────────
//  Panneau « Objets uniques » (MJ) : les armures et les armes du JDR, une par une
//  Chaque objet est unique et garde son état quand il passe d'un personnage à l'autre :
//    - armure : créée avec un métal, une rareté et des pièces (listes des Données du RP).
//      Protection max = (somme des pièces) × valeur du métal × multiplicateur de rareté (calculée) ;
//      Protection actuelle = son usure ; valeur = valeur du métal (10 = armure divine) ;
//    - arme : roll (texte libre), à deux mains, description, 2e forme facultative et forme en cours.
//  Serveur : apps-script/Objets.gs (enregistrerObjet, supprimerObjet ; la liste arrive avec l'action « jdr »).
// ─────────────────────────────────────────────────────────────
"use strict";

let objetEnEdition = null;   // null = formulaire fermé ; { type } = nouvel objet ; objet du JDR = modification

const nombreFr = (v) => String(v).replace(".", ",");

function nomPorteur(id) {
  const p = jdrCourant.personnages.find((x) => x.id === id);
  return p ? p.nom + (p.type === "PJ" ? " (" + p.joueur + ")" : " (PNJ)") : null;
}

// Armure d'après ses ingrédients (métal, rareté, pièces) et les Données du RP du JDR
function calculArmure(d, o) {
  const m = d.materiaux.find((x) => x.id === o.materiau);
  const r = d.raretes.find((x) => x.id === o.rarete);
  const pieces = d.typesArmure.filter((p) => (o.pieces || []).includes(p.id));
  const base = pieces.reduce((t, p) => t + p.armure, 0);
  const fMetal = m ? m.valeur : 1;
  const fRarete = r ? r.multArmure : 1;
  return {
    max: armureSet(base, fMetal, fRarete),
    valeur: fMetal,
    calcul: "pièces " + base + " × " + (m ? m.nom + " " + nombreFr(fMetal) : "sans métal 1")
      + " × " + (r ? r.nom + " " + nombreFr(fRarete) : "sans rareté 1"),
    ingredients: [m && m.nom, r && r.nom, pieces.map((p) => p.nom).join(", ")].filter(Boolean).join(" · ") || "Aucune pièce",
  };
}
// Armure créée avant (Protection tapée à la main) : ni métal, ni rareté, ni pièces
const armureSansIngredients = (o) => !o.materiau && !o.rarete && !(o.pieces || []).length;

function panneauObjets() {
  const objets = jdrCourant.objets || [];
  const d = normaliserDonneesRp(jdrCourant.jdr.donneesRp);
  const ouvrir = (o) => { objetEnEdition = o; rafraichirPanneau(); };
  const parNom = (a, b) => a.nom.localeCompare(b.nom, "fr");

  const entete = el("div", { class: "objets-entete" },
    el("p", { class: "doux", text: "Chaque objet est unique : une armure garde son usure (Protection actuelle), une arme garde sa forme, même quand ils passent d'un personnage à l'autre." }),
    objetEnEdition ? null : el("div", { class: "boutons-objets" },
      el("button", { type: "button", class: "bouton-petit", text: "+ Nouvelle armure", onclick: () => ouvrir({ type: "armure" }) }),
      el("button", { type: "button", class: "bouton-petit", text: "+ Nouvelle arme", onclick: () => ouvrir({ type: "arme" }) })));

  const ligne = (o) => {
    const porteur = o.porteur ? nomPorteur(o.porteur) || "Personnage supprimé" : null;
    const infos = [];
    if (o.type === "arme") {
      infos.push(el("small", { text: "Arme" + (o.degats ? " · Roll " + o.degats : "") + (o.deuxMains ? " · 2 mains" : "") }));
      if (o.forme2) {
        infos.push(el("small", {},
          "⇄ 2e forme : " + o.forme2.nom + (o.forme2.degats ? " · Roll " + o.forme2.degats : "") + (o.forme2.deuxMains ? " · 2 mains" : "")
            + " — en ce moment : ",
          el("b", { text: o.forme === 2 ? o.forme2.nom : o.nom })));
      }
    } else {
      const abime = o.protectionActuelle < o.protectionMax;
      infos.push(el("small", {},
        "Armure · Protection ",
        el("b", { class: abime ? "abime" : "", text: o.protectionActuelle + " / " + o.protectionMax }),
        " · Valeur " + nombreFr(o.valeur) + (Number(o.valeur) === 10 ? " ✦ divine" : "")));
      infos.push(el("small", { text: armureSansIngredients(o)
        ? "Ancienne armure (Protection tapée à la main) : « Modifier » pour lui donner un métal et des pièces"
        : calculArmure(d, o).ingredients }));
    }
    return el("li", { class: "objet-ligne" + (objetEnEdition && objetEnEdition.id === o.id ? " en-edition" : "") },
      el("div", { class: "objet-txt" },
        el("strong", { text: o.nom }),
        ...infos,
        el("small", { class: porteur ? "" : "sans-porteur", text: porteur ? "Porté par " + porteur : "Porté par personne" }),
        o.description ? el("p", { text: o.description }) : null),
      el("div", { class: "objet-actions" },
        el("button", { type: "button", class: "bouton-petit", text: "Modifier", onclick: () => ouvrir(o) }),
        boutonSupprObjet(o)));
  };
  const groupe = (titre, liste) => liste.length
    ? el("div", { class: "groupe-objets" },
        el("h3", { class: "titre-objets", text: titre + " · " + liste.length }),
        el("ul", { class: "liste-objets" }, ...[...liste].sort(parNom).map(ligne)))
    : null;

  return el("div", { class: "panneau-objets" },
    entete,
    objetEnEdition ? formulaireObjet(objetEnEdition) : null,
    objets.length ? null : el("p", { class: "etat doux", text: "Aucun objet pour l'instant." }),
    groupe("Armures", objets.filter((o) => (o.type || "armure") === "armure")),
    groupe("Armes", objets.filter((o) => o.type === "arme")));
}

function formulaireObjet(o) {
  const nouveau = !o.id;
  const type = o.type === "arme" ? "arme" : "armure";
  const d = normaliserDonneesRp(jdrCourant.jdr.donneesRp);
  const champ = (texte, entree, aide) => el("label", { class: "champ" }, el("span", {}, texte, aide ? el("em", { text: " " + aide }) : null), entree);
  const texte = (valeur, max, placeholder) => el("input", { type: "text", maxlength: String(max), value: valeur || "", autocomplete: "off", placeholder: placeholder || "" });
  const zone = (valeur, placeholder) => {
    const z = el("textarea", { rows: "2", maxlength: "300", placeholder });
    z.value = valeur || "";
    return z;
  };
  const caseACocher = (libelle, cochee) => {
    const c = el("input", { type: "checkbox" });
    c.checked = !!cochee;
    return { c, label: el("label", { class: "case-rp" }, c, el("span", { text: libelle })) };
  };

  const nom = texte(o.nom, 60);
  const description = zone(o.description, type === "arme" ? "Effet, histoire…" : "Aspect, histoire, effet particulier…");
  const porteur = el("select", {},
    el("option", { value: "", text: "Personne" }),
    ...jdrCourant.personnages.map((p) => el("option", { value: p.id, text: p.nom + (p.type === "PJ" ? " (" + p.joueur + ")" : " (PNJ)") })));
  porteur.value = o.porteur || "";
  const msg = el("p", { class: "message", role: "status" });
  const bouton = el("button", { type: "submit", class: "bouton", text: nouveau ? (type === "arme" ? "Créer l'arme" : "Créer l'armure") : "Enregistrer" });
  const annuler = el("button", { type: "button", class: "bouton bouton--secondaire", text: "Annuler",
    onclick: () => { objetEnEdition = null; rafraichirPanneau(); } });

  let corps;
  let lireChamps;
  if (type === "armure") {
    const metal = el("select", {},
      el("option", { value: "", text: "— sans métal (×1)" }),
      ...d.materiaux.map((x) => el("option", { value: x.id, text: x.nom + " (×" + nombreFr(x.valeur) + ")" })));
    metal.value = d.materiaux.some((x) => x.id === o.materiau) ? o.materiau : "";
    const rarete = el("select", {},
      el("option", { value: "", text: "— sans rareté (×1)" }),
      ...d.raretes.map((x) => el("option", { value: x.id, text: x.nom + " (×" + nombreFr(x.multArmure) + ")" })));
    rarete.value = d.raretes.some((x) => x.id === o.rarete) ? o.rarete : "";
    const choisies = new Set(o.pieces || []);
    const pieces = d.typesArmure.length
      ? el("div", { class: "grille-pieces" }, ...d.typesArmure.map((p) => {
          const c = el("input", { type: "checkbox" });
          c.checked = choisies.has(p.id);
          c.addEventListener("change", () => { if (c.checked) choisies.add(p.id); else choisies.delete(p.id); majCalcul(); });
          return el("label", { class: "case-rp" }, c, el("span", { text: p.nom + " (" + p.armure + ")" }));
        }))
      : el("p", { class: "etat doux", text: "Ajoute d'abord des types d'armure dans « Données du RP »." });
    const actuelle = el("input", { type: "number", min: "0", step: "1", value: nouveau ? "" : o.protectionActuelle, placeholder: "neuve (= max)" });
    let actuelleTouchee = false;
    actuelle.addEventListener("input", () => { actuelleTouchee = true; });
    const usure = nouveau ? 0 : Math.max(0, (o.protectionMax || 0) - (o.protectionActuelle || 0));   // dégâts déjà subis
    const resume = el("p", { class: "calcul-armure" });
    const ingredients = () => ({
      materiau: metal.value, rarete: rarete.value,
      pieces: d.typesArmure.filter((p) => choisies.has(p.id)).map((p) => p.id),
    });
    function majCalcul(premiere) {
      const c = calculArmure(d, ingredients());
      resume.replaceChildren("Protection max ", el("b", { text: String(c.max) }),
        " = " + c.calcul + " · Valeur " + nombreFr(c.valeur) + (c.valeur === 10 ? " ✦ armure divine" : ""));
      // En modification : la Protection actuelle suit le nouveau max en gardant les dégâts déjà subis
      if (!premiere && !nouveau && !actuelleTouchee) actuelle.value = Math.max(0, c.max - usure);
    }
    metal.addEventListener("change", () => majCalcul());
    rarete.addEventListener("change", () => majCalcul());
    majCalcul(true);
    corps = [
      el("div", { class: "grille-objet" }, champ("Métal", metal), champ("Rareté", rarete),
        champ("Protection actuelle", actuelle, nouveau ? "(vide = neuve)" : "(usure)")),
      el("div", { class: "champ" }, el("span", { text: "Pièces de l'armure" }), pieces),
      resume,
    ];
    lireChamps = () => {
      const c = calculArmure(d, ingredients());
      return { ...ingredients(), protectionMax: c.max, valeur: c.valeur, protectionActuelle: actuelle.value === "" ? "" : actuelle.value };
    };
  } else {
    const roll = texte(o.degats, 60, "ex. 2d6");
    const deux = caseACocher("À deux mains", o.deuxMains);
    const f2 = o.forme2 || {};
    const deuxFormes = caseACocher("Arme à deux formes (le joueur passe de l'une à l'autre dans sa fiche)", !!o.forme2);
    const nom2 = texte(f2.nom, 60);
    const roll2 = texte(f2.degats, 60, "ex. 2d6");
    const deux2 = caseACocher("À deux mains", f2.deuxMains);
    const desc2 = zone(f2.description, "Effet de la 2e forme…");
    const forme = el("select", {}, el("option", { value: "1", text: "1re forme" }), el("option", { value: "2", text: "2e forme" }));
    forme.value = o.forme === 2 ? "2" : "1";
    const sous = el("div", { class: "sous-forme" },
      el("div", { class: "grille-objet" }, champ("Nom de la 2e forme", nom2), champ("Roll", roll2), el("div", { class: "champ case-objet" }, deux2.label)),
      champ("Description / effet de la 2e forme", desc2),
      champ("Forme en ce moment", forme, "(gardée quand l'arme change de porteur)"));
    const majSous = () => { sous.hidden = !deuxFormes.c.checked; };
    deuxFormes.c.addEventListener("change", () => { majSous(); if (deuxFormes.c.checked) nom2.focus(); });
    majSous();
    corps = [
      el("div", { class: "grille-objet" }, champ("Roll", roll), el("div", { class: "champ case-objet" }, deux.label)),
      el("div", { class: "forme-rp" }, deuxFormes.label, sous),
    ];
    lireChamps = () => ({
      degats: roll.value.trim(), deuxMains: deux.c.checked,
      forme2: deuxFormes.c.checked
        ? { nom: nom2.value.trim(), degats: roll2.value.trim(), deuxMains: deux2.c.checked, description: desc2.value.trim() }
        : null,
      forme: deuxFormes.c.checked ? Number(forme.value) : 1,
    });
  }

  const form = el("form", { class: "form-objet", novalidate: true },
    el("h3", { text: nouveau ? (type === "arme" ? "Nouvelle arme" : "Nouvelle armure") : "Modifier « " + o.nom + " »" }),
    champ("Nom", nom),
    ...corps,
    champ("Porté par", porteur),
    champ("Description / effet", description, "(facultatif)"),
    msg,
    el("div", { class: "boutons" }, annuler, bouton));

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const donnees = {
      id: o.id || undefined, type,
      nom: nom.value.trim(), description: description.value.trim(), porteur: porteur.value,
      ...lireChamps(),
    };
    if (!donnees.nom) return ecrireMessage(msg, "Il faut un nom.");
    if (type === "arme" && donnees.forme2 && !donnees.forme2.nom) return ecrireMessage(msg, "La 2e forme doit avoir un nom.");
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

// Les Données du RP ont changé : chaque armure suit son métal, sa rareté et ses pièces.
// Les dégâts déjà subis sont gardés (Protection actuelle = nouveau max − usure). Renvoie le nombre d'armures changées.
async function recalculerArmures() {
  const d = normaliserDonneesRp(jdrCourant.jdr.donneesRp);
  let n = 0;
  for (const o of [...(jdrCourant.objets || [])]) {
    if ((o.type || "armure") !== "armure" || armureSansIngredients(o)) continue;
    const c = calculArmure(d, o);
    if (c.max === o.protectionMax && c.valeur === o.valeur) continue;
    const usure = Math.max(0, o.protectionMax - o.protectionActuelle);
    const rep = await appelConnecte("enregistrerObjet", { jdr: jdrCourant.jdr.id, objet: {
      ...o, protectionMax: c.max, valeur: c.valeur, protectionActuelle: Math.max(0, c.max - usure),
    } });
    if (rep && rep.ok) { jdrCourant.objets = rep.objets; n++; }
  }
  return n;
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
