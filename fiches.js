// ─────────────────────────────────────────────────────────────
//  Types de fiche perso disponibles.
//  On les crée ensemble ; chaque nouveau type est ajouté à cette liste
//  et apparaît automatiquement dans « Type de fiche perso » de chaque JDR.
//
//  Format d'un type :
//  {
//    id: "nardin",                     // identifiant court (minuscules, chiffres, -), ne plus le changer ensuite
//    nom: "Nardin — fantasy médiévale",
//    description: "Stats, équipement, inventaire, dons…",
//    // la structure de la fiche (champs, sections…) sera ajoutée ici
//  }
// ─────────────────────────────────────────────────────────────
window.JDR_FICHES = [
  {
    id: "nardin",
    nom: "Nardin — fantasy médiévale",
    description: "Jets en d6 · 9 compétences, dons & connaissances, PV / Mana / Énergie, "
               + "protection & armure, armes (3 portées, 2 en main), bourse, blessures graves, "
               + "inventaires important et non important.",
    page: "fiches/nardin/index.html",   // fiche complète : règles, actions et affichage dans fiches/nardin/
  },
];
