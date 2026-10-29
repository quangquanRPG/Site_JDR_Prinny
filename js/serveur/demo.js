// ─────────────────────────────────────────────────────────────
//  Mode démo : imite le serveur avec le stockage du navigateur
//  Mêmes actions et mêmes réponses que apps-script/*.gs.
// ─────────────────────────────────────────────────────────────
"use strict";

async function demo(action, d) {
  await new Promise((r) => setTimeout(r, 250));
  const comptes = stock.lire("jdr_demo_comptes", []);
  const sessions = stock.lire("jdr_demo_sessions", {});
  const tousJdr = stock.lire("jdr_demo_jdr", []);
  const persos = stock.lire("jdr_demo_persos", []);
  const objets = stock.lire("jdr_demo_objets", []);   // objets uniques (armures), voir apps-script/Objets.gs
  const cle = (p) => String(p || "").trim().toLowerCase();
  const compte = comptes.find((c) => cle(c.pseudo) === cle(d.pseudo));

  const ouvrirSession = (c) => {
    const j = aleatoire() + aleatoire();
    const duree = d.rester ? 30 * 864e5 : 12 * 36e5;
    sessions[j] = { pseudo: c.pseudo, exp: Date.now() + duree };
    c.derniere = new Date().toISOString();
    stock.ecrire("jdr_demo_sessions", sessions);
    stock.ecrire("jdr_demo_comptes", comptes);
    return { ok: true, jeton: j, pseudo: c.pseudo, role: c.role };
  };

  // Actions sans session
  switch (action) {
    case "inscription": {
      const err = erreurPseudo(d.pseudo);
      if (err) return { ok: false, erreur: err };
      if (compte) return { ok: false, erreur: "Ce pseudo est déjà pris." };
      const sel = aleatoire();
      const c = {
        pseudo: d.pseudo.trim(),
        empreinte: await sha256(sel + ":" + d.empreinte),
        sel,
        role: d.role === "MJ" ? "MJ" : "Joueur",
        cree: new Date().toISOString(),
      };
      comptes.push(c);
      return ouvrirSession(c);
    }
    case "connexion": {
      if (!compte) return { ok: false, erreur: "Pseudo ou mot de passe incorrect." };
      if (!compte.empreinte) { // compte pré-créé ou mot de passe réinitialisé
        compte.sel = aleatoire();
        compte.empreinte = await sha256(compte.sel + ":" + d.empreinte);
        return { ...ouvrirSession(compte), nouveau: true };
      }
      if ((await sha256(compte.sel + ":" + d.empreinte)) !== compte.empreinte)
        return { ok: false, erreur: "Pseudo ou mot de passe incorrect." };
      return ouvrirSession(compte);
    }
    case "deconnexion": {
      delete sessions[d.jeton];
      stock.ecrire("jdr_demo_sessions", sessions);
      return { ok: true };
    }
  }

  // Actions avec session
  const s = sessions[d.jeton];
  const moi = s && s.exp > Date.now() && comptes.find((x) => cle(x.pseudo) === cle(s.pseudo));
  if (!moi) return { ok: false, session: false, erreur: "Session expirée, reconnecte-toi." };
  if (action === "moi") return { ok: true, pseudo: moi.pseudo, role: moi.role };

  // Fiches : MJ du JDR ou joueur du personnage ; les autres joueurs du même JDR en lecture seule
  const avecFiche = (p) => ({ ...p, fiche: undefined, aFiche: !!p.fiche });
  const aUnPersoDansLeJdr = (jdrId) => persos.some((x) => x.jdr === jdrId && x.type === "PJ" && cle(x.joueur) === cle(moi.pseudo));
  const sansObjetsCaches = (fiche) => {
    if (!fiche) return fiche;
    for (const k of ["inventaire", "inventaireNonImportant"]) {
      if (fiche[k] && Array.isArray(fiche[k].objets)) fiche[k].objets = fiche[k].objets.filter((o) => !(o && o.cache));
    }
    return fiche;
  };
  const accesPerso = (lecture = false) => {
    const p = persos.find((x) => x.id === d.id);
    if (!p) return { refus: { ok: false, erreur: "Personnage introuvable." } };
    const j = tousJdr.find((x) => x.id === p.jdr);
    if (!j) return { refus: { ok: false, erreur: "JDR introuvable." } };
    const acces = moi.role === "MJ" && cle(j.mj) === cle(moi.pseudo) ? "mj"
      : p.type === "PJ" && cle(p.joueur) === cle(moi.pseudo) ? "joueur"
      : lecture && p.type === "PJ" && aUnPersoDansLeJdr(j.id) ? "lecture" : null;
    if (!acces) return { refus: { ok: false, erreur: "Tu n'as pas accès à cette fiche." } };
    return { p, j, acces };
  };
  if (action === "fiche") {
    const a = accesPerso(true);
    if (a.refus) return a.refus;
    let fiche = a.p.fiche ? JSON.parse(a.p.fiche) : null;
    if (a.acces === "lecture") fiche = sansObjetsCaches(fiche);
    return { ok: true, acces: a.acces, perso: avecFiche(a.p), jdr: a.j, fiche, objets: objets.filter((o) => o.porteur === a.p.id) };
  }
  if (action === "enregistrerFiche") {
    const a = accesPerso();
    if (a.refus) return a.refus;
    if (!d.fiche || typeof d.fiche !== "object") return { ok: false, erreur: "Fiche illisible." };
    a.p.fiche = JSON.stringify(d.fiche);
    const nouveauNom = String(d.fiche.nom || "").trim();
    if (a.acces === "mj" && nouveauNom && nouveauNom.length <= 60) a.p.nom = nouveauNom;
    stock.ecrire("jdr_demo_persos", persos);
    return { ok: true, nom: a.p.nom };
  }
  // Images de personnage (dans le vrai site : fichiers privés du Google Drive, voir Images.gs)
  if (action === "image" || action === "envoyerImage" || action === "retirerImage") {
    const a = accesPerso(action === "image");
    if (a.refus) return a.refus;
    const images = stock.lire("jdr_demo_images", {});
    if (action === "image") {
      const img = a.p.image && images[a.p.image];
      return img ? { ok: true, image: a.p.image, type: img.type, donnees: img.donnees } : { ok: true, image: null };
    }
    if (action === "envoyerImage") {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(d.type)) return { ok: false, erreur: "Format d'image non pris en charge (JPEG, PNG, WebP ou GIF)." };
      if (typeof d.donnees !== "string" || !d.donnees) return { ok: false, erreur: "Image vide." };
      const id = "img" + aleatoire().slice(0, 10);
      images[id] = { type: d.type, donnees: d.donnees };
      if (a.p.image) delete images[a.p.image];
      a.p.image = id;
      stock.ecrire("jdr_demo_images", images);
      stock.ecrire("jdr_demo_persos", persos);
      return { ok: true, image: id };
    }
    if (a.p.image) delete images[a.p.image];
    a.p.image = "";
    stock.ecrire("jdr_demo_images", images);
    stock.ecrire("jdr_demo_persos", persos);
    return { ok: true, image: null };
  }
  // Objets uniques : usure / réparation depuis la fiche (MJ ou joueur du porteur), usure divine (MJ)
  if (action === "modifierObjet") {
    const a = accesPerso();
    if (a.refus) return a.refus;
    const o = objets.find((x) => x.id === d.objet && x.porteur === a.p.id);
    if (!o) return { ok: false, erreur: "Cet objet n'est pas porté par ce personnage." };
    if (d.protectionActuelle !== undefined) o.protectionActuelle = Math.max(0, Math.min(o.protectionMax, Math.round(Number(d.protectionActuelle) || 0)));
    if (d.usureAutorisee !== undefined) {
      if (a.acces !== "mj") return { ok: false, erreur: "Seul le MJ peut autoriser l'usure d'une armure divine." };
      o.usureAutorisee = d.usureAutorisee === true;
    }
    stock.ecrire("jdr_demo_objets", objets);
    return { ok: true, objet: o };
  }
  if (action === "mesPersos") {
    const avecJdr = (p) => ({ ...avecFiche(p), jdrNom: tousJdr.find((j) => j.id === p.jdr)?.nom || "JDR supprimé" });
    const miens = persos.filter((p) => p.type === "PJ" && cle(p.joueur) === cle(moi.pseudo));
    const mesJdr = new Set(miens.map((p) => p.jdr));
    const compagnons = persos.filter((p) => p.type === "PJ" && mesJdr.has(p.jdr) && cle(p.joueur) !== cle(moi.pseudo));
    return { ok: true, persos: miens.map(avecJdr), compagnons: compagnons.map(avecJdr) };
  }

  // Actions MJ
  if (moi.role !== "MJ") return { ok: false, erreur: "Réservé au maître du jeu." };
  const monJdr = (id) => tousJdr.find((j) => j.id === id && cle(j.mj) === cle(moi.pseudo));
  const INTROUVABLE = { ok: false, erreur: "JDR introuvable." };

  switch (action) {
    case "mesJdr":
      return { ok: true, jdr: tousJdr.filter((j) => cle(j.mj) === cle(moi.pseudo)).reverse() };

    case "creerJdr": {
      const nom = String(d.nom || "").trim().replace(/\s+/g, " ");
      const description = String(d.description || "").trim();
      if (nom.length < 2 || nom.length > 60) return { ok: false, erreur: "Le nom doit faire entre 2 et 60 caractères." };
      if (description.length > 300) return { ok: false, erreur: "La description est limitée à 300 caractères." };
      if (tousJdr.some((j) => cle(j.mj) === cle(moi.pseudo) && cle(j.nom) === cle(nom)))
        return { ok: false, erreur: "Tu as déjà un JDR avec ce nom." };
      const jdr = { id: aleatoire().slice(0, 8), nom, description, mj: moi.pseudo, cree: new Date().toISOString(), typeFiche: "" };
      tousJdr.push(jdr);
      stock.ecrire("jdr_demo_jdr", tousJdr);
      return { ok: true, jdr };
    }

    case "jdr": {
      const j = monJdr(d.id);
      if (!j) return INTROUVABLE;
      return { ok: true, jdr: j, personnages: persos.filter((p) => p.jdr === j.id).map(avecFiche), objets: objets.filter((o) => o.jdr === j.id) };
    }

    case "enregistrerObjet": {
      const j = monJdr(d.jdr);
      if (!j) return INTROUVABLE;
      const o = d.objet || {};
      const nom = String(o.nom || "").trim().replace(/\s+/g, " ");
      const max = Math.round(Number(o.protectionMax));
      const valeur = Number(o.valeur);
      if (nom.length < 1 || nom.length > 60) return { ok: false, erreur: "Le nom de l'objet doit faire entre 1 et 60 caractères." };
      if (String(o.description || "").length > 300) return { ok: false, erreur: "La description est limitée à 300 caractères." };
      if (!isFinite(max) || max < 0 || max > 100000) return { ok: false, erreur: "Protection max invalide." };
      if (!isFinite(valeur) || valeur < 0 || valeur > 1000) return { ok: false, erreur: "Valeur invalide." };
      const porteur = String(o.porteur || "");
      if (porteur && !persos.some((p) => p.id === porteur && p.jdr === j.id)) return { ok: false, erreur: "Ce personnage ne fait pas partie du JDR." };
      const actuelle = o.protectionActuelle === undefined || o.protectionActuelle === "" ? max
        : Math.max(0, Math.min(max, Math.round(Number(o.protectionActuelle) || 0)));
      const champs = { nom, description: String(o.description || "").trim(), protectionMax: max, protectionActuelle: actuelle, valeur, porteur };
      let objet;
      if (o.id) {
        objet = objets.find((x) => x.id === o.id && x.jdr === j.id);
        if (!objet) return { ok: false, erreur: "Objet introuvable." };
        Object.assign(objet, champs);
      } else {
        objet = { id: aleatoire().slice(0, 8), jdr: j.id, type: "armure", usureAutorisee: false, ...champs };
        objets.push(objet);
      }
      stock.ecrire("jdr_demo_objets", objets);
      return { ok: true, objet, objets: objets.filter((x) => x.jdr === j.id) };
    }

    case "supprimerObjet": {
      const j = monJdr(d.jdr);
      if (!j) return INTROUVABLE;
      const i = objets.findIndex((x) => x.id === d.objet && x.jdr === j.id);
      if (i < 0) return { ok: false, erreur: "Objet introuvable." };
      objets.splice(i, 1);
      stock.ecrire("jdr_demo_objets", objets);
      return { ok: true, objets: objets.filter((x) => x.jdr === j.id) };
    }

    case "choisirFiche": {
      const j = monJdr(d.id);
      if (!j) return INTROUVABLE;
      j.typeFiche = String(d.typeFiche || "");
      stock.ecrire("jdr_demo_jdr", tousJdr);
      return { ok: true, typeFiche: j.typeFiche };
    }

    case "enregistrerDonneesRp": {
      const j = monJdr(d.id);
      if (!j) return INTROUVABLE;
      if (!d.donneesRp || typeof d.donneesRp !== "object") return { ok: false, erreur: "Données illisibles." };
      j.donneesRp = d.donneesRp;
      stock.ecrire("jdr_demo_jdr", tousJdr);
      return { ok: true };
    }

    case "listeJoueurs":
      return {
        ok: true,
        joueurs: comptes.filter((c) => c.role !== "MJ").map((c) => c.pseudo).sort((a, b) => a.localeCompare(b, "fr")),
      };

    case "ajouterPerso": {
      const j = monJdr(d.jdr);
      if (!j) return INTROUVABLE;
      const err = erreurPerso(d);
      if (err) return { ok: false, erreur: err };
      let joueur = "";
      if (d.type === "PJ") {
        const cj = comptes.find((c) => cle(c.pseudo) === cle(d.joueur) && c.role !== "MJ");
        if (!cj) return { ok: false, erreur: "Ce joueur n'existe pas." };
        joueur = cj.pseudo;
      }
      const perso = {
        id: aleatoire().slice(0, 8), jdr: j.id, nom: String(d.nom).trim(), type: d.type,
        joueur, notes: String(d.notes || "").trim(), cree: new Date().toISOString(),
      };
      persos.push(perso);
      stock.ecrire("jdr_demo_persos", persos);
      return { ok: true, perso };
    }

    case "supprimerPerso": {
      const i = persos.findIndex((p) => p.id === d.id && monJdr(p.jdr));
      if (i < 0) return { ok: false, erreur: "Personnage introuvable." };
      if (persos[i].image) {
        const images = stock.lire("jdr_demo_images", {});
        delete images[persos[i].image];
        stock.ecrire("jdr_demo_images", images);
      }
      for (const o of objets) if (o.porteur === persos[i].id) o.porteur = "";   // ses objets restent, sans porteur
      stock.ecrire("jdr_demo_objets", objets);
      persos.splice(i, 1);
      stock.ecrire("jdr_demo_persos", persos);
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Action inconnue." };
}
