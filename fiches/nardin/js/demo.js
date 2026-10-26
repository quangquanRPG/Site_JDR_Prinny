/* ================================================================
   DÉMO — personnage d'exemple et utilisateurs fictifs
   Utilisés quand la page est ouverte seule (sans le site), pour tester.
   ================================================================ */
"use strict";

const FICHE_EXEMPLE = {
  nom: "Personnage exemple",
  proprietaire: "joueur_1",
  armures: ["cuir", "maille", "robe"],
  armureEquipee: "maille",
  armes: ["epee", "dague", "arc", "bouclier", "epee-bouclier"],
  armesPortees: ["epee", "bouclier", "epee-bouclier"],
  armesEnMain: ["epee", "bouclier"],
  blessuresGraves: 1,
  bourse: { cuivre: 145, argent: 32, or: 3, platine: 0 },
  inventaire: {
    max: 25,
    maxCaches: 3,
    objets: [
      { titre: "Potion de soin", quantite: 3, description: "Rend des PV. Goût de menthe." },
      { titre: "Corde", quantite: 1, description: "15 mètres, solide." },
      { titre: "Lettre scellée", quantite: 1, description: "À remettre au capitaine de la garde.", cache: true },
    ],
  },
  inventaireNonImportant: {
    max: 15,
    objets: [
      { titre: "Ration de voyage", quantite: 4, description: "Pain sec et viande séchée." },
      { titre: "Torche", quantite: 2 },
      { titre: "Dés en os", quantite: 1, description: "Pipés ? Personne ne sait.", cache: true },
    ],
  },
  ressources: {
    pv:      { actuel: 28, base: 35 },
    mana:    { actuel: 12, base: 12 },
    energie: { actuel: 60 },          // base toujours 100
    protection:  { actuel: 32 },      // max = armure équipée
    protMagique: { base: 2 },         // seulement un max
  },
  competences: {
    force: { base: 3 }, agilite: { base: 2 }, constitution: { base: 3 },
    volonte: { base: 2 }, perception: { base: 2 }, vise: { base: 1 },
    eloquence: { base: 2 }, aura: { base: 1 }, intelligence: { base: 3 },
  },
  dons: [
    { nom: "Colosse", type: "don", description: "Une carrure hors du commun.",
      effets: [{ competence: "force", valeur: 1 }, { competence: "agilite", valeur: -1 }] },
    { nom: "Œil de faucon", type: "don", actif: false,
      effets: [{ competence: "vise", valeur: 2 }, { competence: "perception", valeur: 1 }] },
    { nom: "Herboristerie", type: "connaissance", description: "Connaît les plantes de la région.",
      effets: [{ competence: "intelligence", valeur: 1 }] },
    { nom: "Poigne de géant", type: "don", actif: false, description: "Manie une arme à deux mains d'une seule main.",
      effets: [{ type: "regle", regle: "deuxMainsAUneMain" }] },
    { nom: "Nécromancienne", type: "don", actif: false, description: "Exemple (comme Henrika) : réussite plus facile.",
      effets: [{ type: "reussite", valeur: -1 }] },
  ],
};

const UTILISATEURS_DEMO = {
  mj:      { id: "mj_1",     role: "mj" },
  proprio: { id: "joueur_1", role: "joueur" },
  autre:   { id: "joueur_2", role: "joueur" },
};
