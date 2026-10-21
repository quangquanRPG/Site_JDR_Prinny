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
    return { ok: true, acces: a.acces, perso: avecFiche(a.p), jdr: a.j, fiche };
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
      return { ok: true, jdr: j, personnages: persos.filter((p) => p.jdr === j.id).map(avecFiche) };
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
      persos.splice(i, 1);
      stock.ecrire("jdr_demo_persos", persos);
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Action inconnue." };
}
