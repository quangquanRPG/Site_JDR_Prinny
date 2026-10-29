/* ================================================================
   MODÈLE — fiche complète
   creerFiche remet n'importe quelles données (enregistrées, incomplètes, anciennes)
   dans une forme sûre.
   ================================================================ */
"use strict";

function creerFiche(donnees = {}) {
  const fiche = {
    id:           donnees.id ?? nouvelId("fiche"),
    nom:          donnees.nom ?? "Nouveau personnage",
    proprietaire: donnees.proprietaire ?? null,   // identifiant du joueur
    armures:       CATALOGUE_ARMURES.map(a => a.id),  // armures portées = objets uniques (voir regles/armures.js)
    armureEquipee: donnees.armureEquipee ?? null,      // une seule à la fois
    armes:         donnees.armes ?? [],                // ids des armes possédées
    armesPortees:  (donnees.armesPortees ?? []).slice(0, MAX_ARMES_PORTEES),   // max 3
    armesEnMain:   donnees.armesEnMain ?? [],                                   // parmi les portées, dans la limite des mains
    formesArmes:   Object.fromEntries(Object.entries(donnees.formesArmes ?? {}).filter(([, v]) => v === 2)),   // { idArme: 2 } = 2e forme
    bourse: Object.fromEntries(MONNAIES.map(m =>
      [m.id, Math.max(0, Math.floor(donnees.bourse?.[m.id] ?? 0))])),   // { cuivre, argent, or, platine }
    blessuresGraves: Math.max(0, Math.min(MAX_BLESSURES, donnees.blessuresGraves ?? 0)),   // 0 à 3
    reussite: Math.max(SEUIL_MIN, Math.min(SEUIL_MAX, Math.round(Number(donnees.reussite) || REUSSITE_DEFAUT))),   // seuil de base du d6
    effort: EFFORTS.some(e => e.id === donnees.effort) ? donnees.effort : null,             // effort en cours
    ...Object.fromEntries(INVENTAIRES.map(i => [i.cle, creerInventaire(donnees[i.cle], i.maxDefaut)])),
    // → fiche.inventaire (important) et fiche.inventaireNonImportant
    ressources:   {},
    competences:  {},
    dons:         (donnees.dons ?? []).map(creerDon),
  };
  // Ressources : base = maximum, actuel = valeur du moment (par défaut = base)
  for (const r of RESSOURCES) {
    const src = donnees.ressources?.[r.id] ?? {};
    const base = r.source === "armure" ? protectionArmure(fiche)
               : r.baseFixe ?? src.base ?? r.defaut ?? 10;
    const actuel = r.seulMax ? base
                 : r.source === "armure" ? Math.min(protectionActuelleArmure(fiche), base)   // l'usure est gardée par l'armure
                 : Math.min(src.actuel ?? base, base);
    fiche.ressources[r.id] = { actuel, base };
  }
  for (const c of COMPETENCES) {
    fiche.competences[c.id] = { base: donnees.competences?.[c.id]?.base ?? 1 };
  }
  oublierObjetsDisparus(fiche);
  ajusterMains(fiche);
  return fiche;
}

// Armes retirées des listes du MJ, armure équipée qui n'est plus portée : on les enlève de la fiche
// (sinon elles restaient invisibles tout en prenant de la place dans l'inventaire).
function oublierObjetsDisparus(fiche) {
  fiche.armures = fiche.armures.filter(id => trouverArmure(id));
  if (fiche.armureEquipee && !trouverArmure(fiche.armureEquipee)) {
    fiche.armureEquipee = null;
    fiche.ressources.protection = { actuel: 0, base: 0 };
  }
  fiche.armes = fiche.armes.filter(id => trouverArme(id));
  fiche.armesPortees = fiche.armesPortees.filter(id => fiche.armes.includes(id));
  fiche.armesEnMain = fiche.armesEnMain.filter(id => fiche.armesPortees.includes(id));
  for (const id of Object.keys(fiche.formesArmes)) {           // arme perdue ou sans 2e forme : on oublie la forme
    if (!fiche.armes.includes(id) || !trouverArme(id)?.forme2) delete fiche.formesArmes[id];
  }
}
