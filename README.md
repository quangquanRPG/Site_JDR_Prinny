# Grimoire des Aventuriers — site de gestion de persos JDR

Site statique (GitHub Pages) + Google Sheet comme base de données, via un petit script Google Apps Script.

Aucun outil à installer : ce sont des fichiers HTML, CSS et JavaScript simples.
Le HTML ne contient que la structure de la page ; l'apparence est dans `css/`, le code dans `js/`.
Chaque fichier a un seul rôle et commence par un commentaire qui le décrit.

```
site-jdr/
├── index.html              structure de la page (aucun code, aucun style)
├── config.js               ← mettre ici l'URL de l'Apps Script
├── fiches.js               types de fiche perso disponibles
├── css/                    apparence du site (un fichier par partie de la page)
│   ├── base.css            couleurs, cartes, champs, boutons communs
│   ├── accueil.css · espace.css · jdr.css · donnees-rp.css · fiche.css
├── js/                     code du site
│   ├── etat.js             réglages lus au démarrage + tout ce que le site garde en mémoire
│   ├── regles.js           règles du pseudo, du mot de passe, d'un personnage
│   ├── navigation.js       passage d'une vue à l'autre (#jdr/…, #fiche/…)
│   ├── demarrage.js        branche les boutons et lance le site (toujours chargé en dernier)
│   ├── outils/             dom.js (créer des éléments), chiffrement.js, stockage.js
│   ├── serveur/            api.js (appels à l'Apps Script) · demo.js (faux serveur du mode démo)
│   ├── donnees-rp/         modele.js (exemples, calcul des sets) · onglets.js (les 5 listes)
│   └── vues/               un fichier par écran
│       ├── accueil.js · espace.js · espace-joueur.js · espace-mj.js
│       ├── jdr/            page.js, panneaux.js et un fichier par panneau du menu
│       └── fiche/          ouverture.js, echanges.js (messages avec la fiche), sauvegarde.js, reussite.js,
│                           actualisation.js (relit la fiche toutes les 30 s)
├── fiches/
│   └── nardin/             fiche « Nardin », autonome (s'ouvre aussi seule pour tester)
│       ├── index.html      structure de la fiche
│       ├── css/            un fichier par bloc (ressources, armes, bourse, inventaire…)
│       └── js/
│           ├── regles/     règles du jeu, sans affichage (compétences, fatigue, réussite, droits…)
│           ├── actions/    modifient la fiche en vérifiant les droits
│           ├── affichage/  un fichier par bloc de la fiche (même nom que dans css/)
│           ├── integration/ lien avec le site (Données du RP, messages)
│           ├── demo.js     personnage d'exemple
│           └── demarrage.js redessine la fiche (rafraichir) et la lance (toujours en dernier)
└── apps-script/            ← à copier dans le Google Sheet (un fichier .gs par thème)
    ├── Reglages.gs         constantes (inscriptions ouvertes, colonnes…)
    ├── Web.gs              doGet / doPost : aiguille chaque action
    ├── Comptes.gs · Sessions.gs · Jdr.gs · Personnages.gs · Fiches.gs
    └── Feuilles.gs (onglets du Sheet, installer) · Outils.gs
```

### Où modifier quoi

| Je veux… | Fichier(s) |
|---|---|
| changer une couleur du site | `css/base.css` (variables en haut) |
| changer un texte ou un bouton d'un écran | `index.html` + le fichier de `js/vues/` du même nom |
| changer une règle de la fiche Nardin (fatigue, efforts, dégâts…) | `fiches/nardin/js/regles/` ou `actions/` |
| changer l'apparence d'un bloc de la fiche | `fiches/nardin/js/affichage/<bloc>.js` et `fiches/nardin/css/<bloc>.css` |
| ajouter une action au serveur | une fonction dans le bon `apps-script/*.gs` + une ligne dans `Web.gs` (+ la même action dans `js/serveur/demo.js`) |

Les fichiers JavaScript se partagent leurs fonctions : l'ordre des balises `<script>` dans
`index.html` compte seulement pour `demarrage.js`, qui doit rester le dernier. Pour ajouter
un fichier, crée-le dans le bon dossier puis ajoute sa balise `<script>` dans `index.html`
(au-dessus de `demarrage.js`).

### Numéro de version (et cache des navigateurs)

Le site en est à la **version 0.3** (la 0.1 est la première mise en ligne).
Chaque `<link>` et `<script>` finit par `?v=0.3` : c'est à la fois le numéro de version
affiché sous la carte d'accueil et ce qui force les navigateurs à recharger les fichiers.
À chaque nouvelle version, change ce numéro **partout** dans `index.html` et
`fiches/nardin/index.html` (Ctrl+H → « Remplacer tout »). Le site le transmet tout seul à la fiche.

| Version | Contenu |
|---|---|
| 0.1 | Comptes MJ / joueurs, JDR, personnages, Données du RP, fiche Nardin (efforts, fatigue, réussite, armure divine) |
| 0.2 | Fiches des compagnons en lecture seule · mise à jour automatique des fiches toutes les 30 s |
| 0.3 | Dons qui changent la réussite · armes refondues (roll libre, description, armes à deux formes) · gestionnaire de mana (sorts) |

## Tester tout de suite (mode démo)

Ouvre `index.html` dans Chrome/Firefox. Tant que `API_URL` est vide dans `config.js`,
les comptes sont stockés dans ton navigateur uniquement.

À la création du compte, chacun choisit **Joueur** ou **Maître du jeu**. Ce choix est enregistré
dans la colonne *Rôle* du Sheet et reste modifiable à la main.

## 1. Préparer le Google Sheet

1. Crée un nouveau **Google Sheet** (pas un Google Doc : il faut un tableau), par ex. « JDR – Base ».
2. Menu **Extensions → Apps Script**.
3. Recrée chaque fichier du dossier `apps-script/` : bouton **+** → **Script**, même nom
   (`Reglages`, `Web`, `Comptes`, `Sessions`, `Jdr`, `Personnages`, `Fiches`, `Feuilles`, `Outils`),
   puis colle son contenu. Supprime l'ancien `Code.gs` (sinon les fonctions seraient en double).
   L'ordre des fichiers n'a pas d'importance. Enregistre (💾).
4. En haut, choisis la fonction **`installer`** puis **▶ Exécuter**. Google demande l'autorisation :
   « Paramètres avancés → Accéder au projet (non sécurisé) » — c'est normal, c'est ton propre script.
   Un onglet **Comptes** apparaît dans le Sheet.

## 2. Publier le script

1. **Déployer → Nouveau déploiement** → type **Application Web**.
2. *Exécuter en tant que* : **Moi** — *Qui a accès* : **Tout le monde**.
3. Copie l'URL qui finit par `/exec` et colle-la dans `config.js` :
   ```js
   API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```

> Quand tu modifies un fichier `.gs` plus tard : **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version**.
> Sinon le site continue d'utiliser l'ancienne version (et l'URL reste la même).

## 3. Mettre en ligne sur GitHub Pages

1. Crée un dépôt GitHub (ex. `grimoire-jdr`) et envoie-y le contenu du dossier `site-jdr`.
2. Dépôt → **Settings → Pages** → *Source* : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Après une minute, le site est sur `https://<ton-pseudo>.github.io/grimoire-jdr/`.

## Les JDR (espace MJ)

Un compte **Maître du jeu** voit la liste de ses JDR et peut en créer (nom + description facultative).
Ils sont rangés dans l'onglet **JDR** du Sheet : `ID | Nom | Description | MJ | Créé le`.
Chaque MJ ne voit que les JDR dont il est le MJ. Un même MJ ne peut pas avoir deux JDR du même nom.

En cliquant sur un JDR, le MJ arrive sur son menu :
- **Type de fiche perso** : choix parmi les types listés dans `fiches.js` (on les ajoute au fur et à mesure).
- **Voir les personnages** : personnages joueurs et PNJ, séparés.
- **Ajouter un personnage joueur** : relié au compte d'un joueur inscrit.
- **Ajouter un PNJ**.
- **Supprimer un personnage** : deux clics (« Supprimer » puis « Confirmer ? »), définitif.

Les personnages sont dans l'onglet **Personnages** : `ID | JDR | Nom | Type (PJ/PNJ) | Joueur | Notes | Créé le | Fiche`.
La colonne *Fiche* recevra le contenu de la fiche quand les types de fiche seront prêts.

## Données du RP (listes du MJ, propres à chaque JDR)

Tuile **Données du RP** dans le menu d'un JDR. Cinq listes modifiables, puis bouton **Enregistrer** :

| Liste | Champs | Rôle dans la fiche |
|---|---|---|
| Métaux | nom, valeur, valeur magie | multiplie l'armure des sets ; sert aussi de valeur (diviseur des dégâts) |
| Raretés | nom, multiplicateur armure | multiplie l'armure des sets |
| Types d'armure | type, armure (Bras 2, Plastron 3, Jambière 2, Casque 2) | les pièces possibles d'un set et leur armure |
| Armes | nom, roll (texte libre, décidé par le MJ), à deux mains, description / effet, 2e forme facultative (mêmes champs) | armes que le MJ donne aux personnages ; une arme à deux formes se change dans la fiche (bouton ⇄) |
| Sets d'armure | nom, métal, rareté, pièces cochées, description | armure = (somme des pièces) × valeur du métal × rareté, arrondie |

Tant que rien n'est enregistré, le JDR utilise des exemples de départ. Le tout est stocké en JSON
dans la colonne *Données RP* de l'onglet JDR. Supprimer un élément déjà donné à un personnage le fait
disparaître de sa fiche.

## Les fiches perso

Dans « Voir les personnages », chaque personnage a un bouton **Fiche** (ou **Créer la fiche**).
Un joueur retrouve ses personnages dans **Mes personnages** sur son espace.
La fiche s'ouvre avec le type choisi pour le JDR. Chaque modification est enregistrée
automatiquement dans la colonne *Fiche* de l'onglet Personnages (« Enregistré ✓ » en haut à droite).

- Qui peut la modifier : le MJ du JDR et le joueur du personnage.
- Qui peut la voir en **lecture seule** : les autres joueurs qui ont un personnage dans le même JDR
  (section **Compagnons d'aventure** de leur espace). Les objets cachés sont retirés par le serveur
  avant l'envoi, et rien n'est enregistré. Les fiches des PNJ restent réservées au MJ.
  Les joueurs sans personnage dans le JDR n'y ont pas accès.
- Ce que chacun peut modifier suit les règles de la fiche (ex. Nardin : le joueur change PV/Mana actuels,
  bourse, inventaire, armes en main… ; le MJ règle en plus les maximums, les dons, et dans **Réglages du MJ**
  le nom, les compétences de base et les armes / armures possédées).
- **Mise à jour automatique** : une fiche ouverte relit le Google Sheet toutes les 30 secondes et affiche
  les changements faits par quelqu'un d'autre (« Mis à jour ↻ » en haut à droite). Pour ne pas écraser
  ce qu'on est en train de faire, elle attend tant qu'un champ est en cours de saisie, qu'une modification
  n'est pas encore enregistrée, ou moins de 3 s après une action. Pause quand l'onglet est caché.
  Réglage : `INTERVALLE_ACTUALISATION` dans `js/vues/fiche/actualisation.js`.
- Si le MJ et le joueur modifient la même fiche au même moment, la dernière modification enregistrée gagne.

Une page de fiche (`fiches/xxx/index.html`) fonctionne aussi seule pour la tester (barre « Démo » en haut).
Ouverte par le site (`?integre=1`), elle échange avec lui par messages : `jdr:pret` → `jdr:charger`
(fiche, nom, propriétaire, utilisateur) → `jdr:modif` à chaque changement, et `jdr:hauteur`.

## Efforts et réussite (fiche Nardin)

- Sous la jauge d'Énergie, des boutons d'effort : −5 → +1 dé, −10 → +2 dés, −20 → +3 dés,
  −40 → réussite −1, −80 → réussite −2. L'énergie est dépensée au clic ; le bonus reste actif
  (sur toutes les compétences) jusqu'au clic sur « Terminer l'effort ». Un seul effort à la fois.
- La réussite des d6 (4+ par défaut, réglable par le MJ dans « Réglages du MJ ») reste affichée
  à droite de la fiche pendant le défilement (en haut sur téléphone). Un effort, un don (effet
  « Réussite des dés », −1 = plus facile) ou la fatigue la font varier ; la cause est indiquée dessous.

## Gestionnaire de mana (fiche Nardin)

À côté de « Encaisser des dégâts », le bloc **Sort** (propriétaire de la fiche et MJ) : mana à
dépenser et cases Bonus / Malus. Le jet à faire et les dégâts minimum, moyens et maximum s'affichent
sous la **Réussite** (cadre de droite, ou bandeau du haut sur téléphone).
M = mana dépensé, D = M ÷ 10 (arrondi en dessous), U = unité de M :

| Mana dépensé | Jet | Exemple |
|---|---|---|
| jusqu'à 60 | D d6 + U | 45 → 4d6 + 5 |
| plus de 60 | D dD + U × 2 | 123 → 12d12 + 6 · 750 → 75d75 |

Bonus : dégâts × 1,5. Malus : dégâts × 0,75 (les deux cochés : × 1,125). Valeurs arrondies.
« Consommer le mana » demande une confirmation, puis retire le mana de la jauge ; le récap permet
d'annuler. Impossible de dépenser plus que le mana restant. Réglages : `fiches/nardin/js/regles/mana.js`.

## Comment marchent les comptes

| Colonne du Sheet | Contenu |
|---|---|
| Pseudo | insensible à la casse (« Eva » = « eva ») |
| Empreinte mdp | mot de passe chiffré (SHA-256 salé), jamais en clair |
| Sel | valeur aléatoire propre à chaque joueur |
| Rôle | `MJ` ou `Joueur` — modifiable directement dans le Sheet |
| Créé le / Dernière connexion | dates automatiques |

Le navigateur chiffre le mot de passe avant l'envoi, puis le serveur le chiffre une seconde fois avec le sel.

Quelques astuces pour le MJ, directement dans le Sheet :
- **Mot de passe oublié** : efface les cases *Empreinte mdp* et *Sel* du joueur. Le prochain mot de passe qu'il tape devient le nouveau.
- **Créer un compte à l'avance** : ajoute une ligne avec juste le pseudo et le rôle.
- **Fermer les inscriptions** : dans `Reglages.gs`, mets `INSCRIPTION_OUVERTE = false` (puis nouvelle version du déploiement).

Sessions : 30 jours avec « Rester connecté », sinon 12 h (et fermeture du navigateur).
