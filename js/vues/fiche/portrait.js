// ─────────────────────────────────────────────────────────────
//  Fiche : image du personnage, dans la marge gauche (en face du cadre Réussite)
//  Rangée dans le Google Drive par le serveur (apps-script/Images.gs), lue avec l'action « image ».
//  Le MJ du JDR et le joueur du personnage peuvent l'ajouter, la changer ou la retirer ;
//  les compagnons la voient seulement. Sur écran étroit : petite vignette dans la barre du haut.
//  Un clic sur l'image l'ouvre en grand (visionneuse).
// ─────────────────────────────────────────────────────────────
"use strict";

const imagesChargees = new Map();          // id du fichier → adresse data: (évite de la retélécharger)
const COTE_MAX_IMAGE = DEMO ? 800 : 2000;  // plus grand côté (px) après réduction
const POIDS_SANS_REDUCTION = 3 * 1024 * 1024;   // en dessous (et pas trop grande), l'image part telle quelle
const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const peutChangerImage = (f) => f.acces === "mj" || f.acces === "joueur";

// Appelé à l'ouverture de la fiche et quand la mise à jour automatique voit une autre image
async function chargerPortrait(f) {
  const id = f.perso?.image || "";
  f.imageSrc = id ? imagesChargees.get(id) || null : null;
  f.imageEtat = id && !f.imageSrc ? "chargement" : "";
  dessinerPortrait(f);
  if (!id || f.imageSrc) return;
  try {
    const rep = await appel("image", { jeton: f.jeton, id: f.id });
    if (ficheOuverte !== f || (f.perso.image || "") !== id) return;   // fiche fermée ou image changée entre-temps
    if (rep.ok && rep.image && rep.donnees) {
      f.imageSrc = "data:" + rep.type + ";base64," + rep.donnees;
      imagesChargees.set(rep.image, f.imageSrc);
      f.imageEtat = "";
    } else {
      f.imageEtat = rep.erreur || "Image introuvable.";
    }
  } catch (e) {
    if (ficheOuverte === f) f.imageEtat = "Image indisponible.";
  }
  if (ficheOuverte === f) dessinerPortrait(f);
}

function dessinerPortrait(f) {
  const zone = $("#portrait-fiche");
  const peut = peutChangerImage(f);
  const id = f.perso?.image || "";
  if (!id && !peut) { zone.hidden = true; zone.replaceChildren(); return; }
  zone.hidden = false;
  zone.classList.toggle("vide", !id);

  let visuel;
  if (f.imageSrc) {
    visuel = el("button", { type: "button", class: "portrait-image", title: "Voir en grand", onclick: () => ouvrirVisionneuse(f) },
      el("img", { src: f.imageSrc, alt: "Portrait de " + (f.perso?.nom || "personnage") }));
  } else if (id) {
    visuel = el("div", { class: "portrait-attente", text: f.imageEtat === "chargement" ? "Chargement…" : f.imageEtat || "" });
  } else {
    visuel = el("button", { type: "button", class: "portrait-ajout", title: "Ajouter une image", onclick: () => choisirImage(f) },
      el("span", { class: "plus", text: "+" }), el("span", { class: "texte", text: "Ajouter une image" }));
  }
  zone.replaceChildren(...[
    visuel,
    f.imageEnvoi ? el("p", { class: "portrait-etat", text: f.imageEnvoi }) : null,
    f.imageErreur ? el("p", { class: "portrait-etat erreur", text: f.imageErreur }) : null,
    peut && id ? boutonsImage(f) : null,
  ].filter(Boolean));   // replaceChildren écrirait « null » pour un élément absent
}

function boutonsImage(f) {
  const retirer = el("button", { type: "button", class: "lien-image danger", text: "Retirer" });
  retirer.addEventListener("click", () => {
    if (retirer.dataset.confirmer) return retirerImagePerso(f);
    retirer.dataset.confirmer = "1";
    retirer.textContent = "Confirmer ?";
    setTimeout(() => { retirer.textContent = "Retirer"; delete retirer.dataset.confirmer; }, 3000);
  });
  return el("div", { class: "portrait-boutons" },
    el("button", { type: "button", class: "lien-image", text: "Changer", onclick: () => choisirImage(f) }),
    retirer);
}

function choisirImage(f) {
  const champ = $("#choix-image");
  champ.value = "";
  champ.onchange = () => { if (champ.files[0]) envoyerImagePerso(f, champ.files[0]); };
  champ.click();
}

async function envoyerImagePerso(f, fichier) {
  fermerVisionneuse();
  f.imageErreur = "";
  f.imageEnvoi = "Préparation de l'image…";
  dessinerPortrait(f);
  try {
    const img = await preparerImage(fichier);
    if (ficheOuverte !== f) return;
    f.imageEnvoi = "Envoi de l'image…";
    dessinerPortrait(f);
    const rep = await appel("envoyerImage", { jeton: f.jeton, id: f.id, type: img.type, donnees: img.donnees });
    if (sessionPerdue(rep) || ficheOuverte !== f) return;
    if (!rep.ok) throw new Error(rep.erreur || "Envoi impossible.");
    imagesChargees.set(rep.image, "data:" + img.type + ";base64," + img.donnees);
    f.perso.image = rep.image;
    f.imageSrc = imagesChargees.get(rep.image);
    f.imageEtat = "";
    f.derniereActionLocale = Date.now();
  } catch (e) {
    f.imageErreur = e.message || "Envoi impossible.";
  }
  f.imageEnvoi = "";
  if (ficheOuverte === f) dessinerPortrait(f);
}

async function retirerImagePerso(f) {
  fermerVisionneuse();
  f.imageErreur = "";
  f.imageEnvoi = "Retrait de l'image…";
  dessinerPortrait(f);
  try {
    const rep = await appel("retirerImage", { jeton: f.jeton, id: f.id });
    if (sessionPerdue(rep) || ficheOuverte !== f) return;
    if (!rep.ok) throw new Error(rep.erreur || "Retrait impossible.");
    f.perso.image = "";
    f.imageSrc = null;
  } catch (e) {
    f.imageErreur = e.message || "Retrait impossible.";
  }
  f.imageEnvoi = "";
  if (ficheOuverte === f) dessinerPortrait(f);
}

// Réduit l'image si elle est trop grande ou trop lourde, puis la renvoie en base64
async function preparerImage(fichier) {
  if (!fichier.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  const image = await lireImage(fichier);
  const grande = Math.max(image.width, image.height) > COTE_MAX_IMAGE;
  if (TYPES_IMAGE.includes(fichier.type) && !grande && fichier.size <= POIDS_SANS_REDUCTION && !DEMO) {
    return { type: fichier.type, donnees: await enBase64(fichier) };   // pleine qualité
  }
  const echelle = Math.min(1, COTE_MAX_IMAGE / Math.max(image.width, image.height));
  const toile = document.createElement("canvas");
  toile.width = Math.round(image.width * echelle);
  toile.height = Math.round(image.height * echelle);
  toile.getContext("2d").drawImage(image, 0, 0, toile.width, toile.height);
  const type = fichier.type === "image/png" && !DEMO ? "image/png" : "image/jpeg";   // le PNG garde sa transparence
  const blob = await new Promise((ok) => toile.toBlob(ok, type, 0.9));
  if (!blob) throw new Error("Impossible de préparer cette image.");
  return { type, donnees: await enBase64(blob) };
}

function lireImage(fichier) {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("Image illisible (essaie en JPEG ou PNG).")); };
    img.src = url;
  });
}

function enBase64(blob) {
  return new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = () => ko(new Error("Lecture du fichier impossible."));
    r.readAsDataURL(blob);
  });
}

// ── Visionneuse : l'image en grand, avec Changer / Retirer pour qui en a le droit ──
function ouvrirVisionneuse(f) {
  if (!f.imageSrc) return;
  const v = $("#visionneuse");
  v.replaceChildren(
    el("img", { src: f.imageSrc, alt: "Portrait de " + (f.perso?.nom || "personnage") }),
    el("div", { class: "visionneuse-bas" },
      el("span", { class: "nom", text: f.perso?.nom || "" }),
      peutChangerImage(f) ? boutonsImage(f) : null,
      el("button", { type: "button", class: "lien-image", text: "Fermer", onclick: fermerVisionneuse })),
  );
  v.hidden = false;
}

function fermerVisionneuse() {
  const v = $("#visionneuse");
  if (v) { v.hidden = true; v.replaceChildren(); }
}

function viderPortrait() {
  fermerVisionneuse();
  $("#portrait-fiche").hidden = true;
  $("#portrait-fiche").replaceChildren();
}

document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fermerVisionneuse(); });
document.addEventListener("click", (ev) => { if (ev.target.id === "visionneuse") fermerVisionneuse(); });
