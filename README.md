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
│                           actualisation.js (relit la fiche toutes les 30 s), portrait.js (image du personnage)
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
    ├── Images.gs           images des personnages (Google Drive, fichiers privés)
    ├── Objets.gs           objets uniques du JDR (armures avec leur usure)
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

Le site en est à la **version 0.4** (la 0.1 est la première mise en ligne).
Chaque `<link>` et `<script>` finit par `?v=0.4` : c'est à la fois le numéro de version
affiché sous la carte d'accueil et ce qui force les navigateurs à recharger les fichiers.
À chaque nouvelle version, change ce numéro **partout** dans `index.html` et
`fiches/nardin/index.html` (Ctrl+H → « Remplacer tout »). Le site le transmet tout seul à la fiche.

| Version | Contenu |
|---|---|
| 0.1 | Comptes MJ / joueurs, JDR, personnages, Données du RP, fiche Nardin (efforts, fatigue, réussite, armure divine) |
| 0.2 | Fiches des compagnons en lecture seule · mise à jour automatique des fiches toutes les 30 s |
| 0.3 | Dons qui changent la réussite · armes refondues (roll libre, description, armes à deux formes) · gestionnaire de mana (sorts) |
| 0.3.1 | Le cadre Réussite et le jet du sort flottent par-dessus la page : ils ne décalent plus jamais la fiche |
| 0.3.2 | Image du personnage dans la marge gauche, rangée dans le Google Drive (à faire côté Apps Script : voir « Images des personnages ») |
| 0.3.3 | Fiche Nardin en deux colonnes : à gauche l'image puis PV / Mana / Énergie avec leurs outils, au centre les Compétences en premier |
| 0.3.4 | Sur PC, la colonne de gauche prend toute la largeur libre (280 à 760 px) ; ses cartes passent sur deux colonnes quand elle est assez large |
| 0.3.5 | Les trois jauges PV / Mana / Énergie sur la même ligne, chaque outil en dessous (Dégâts, Sort, Efforts) |
| 0.3.6 | La Défense (protections et sets d'armure) passe dans la colonne de gauche, juste avant les Blessures graves |
| 0.3.7 | Centre dans l'ordre : Compétences, Armes, Armure (sets d'armure), Dons, Inventaire important, Inventaire non important, Bourse, Réglages du MJ |
| 0.4 | **Armures = objets uniques** du JDR : chacune garde son usure (Protection actuelle), même en changeant d'armure ou de porteur (à faire côté Apps Script : voir « Objets uniques ») |

## Tester tout de suite (mode démo)

Ouvre `index.html` dans Chrome/Firefox. Tant que `API_URL` est vide dans `config.js`,
les comptes sont stockés dans ton navigateur uniquement.

À la création du compte, chacun choisit **Joueur** ou **Maître du jeu**. Ce choix est enregistré
dans la colonne *Rôle* du Sheet et reste modifiable à la main.

## 1. Préparer le Google Sheet

1. Crée un nouveau **Google Sheet** (pas un Google Doc : il faut un tableau), par ex. « JDR – Base ».
2. Menu **Extensions → Apps Script**.
3. Recrée chaque fichier du dossier `apps-script/` : bouton **+** → **Script**, même nom
   (`Reglages`, `Web`, `Comptes`, `Sessions`, `Jdr`, `Personnages`, `Fiches`, `Objets`, `Images`, `Feuilles`, `Outils`),
   puis colle son contenu. Supprime l'ancien `Code.gs` (sinon les fonctions seraient en double).
   L'ordre des fichiers n'a pas d'importance. Enregistre (💾).
4. En haut, choisis la fonction **`installer`** puis **▶ Exécuter**. Google demande l'autorisation :
   « Paramètres avancés → Accéder au projet (non sécurisé) » — c'est normal, c'est ton propre script.
   Un onglet **Comptes** apparaît dans le Sheet, et un dossier « Grimoire des Aventuriers — Images »
   dans ton Google Drive (pour les images des personnages).

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
| Métaux | nom, valeur, valeur magie | (sets d'armure, plus utilisés par la fiche depuis la 0.4) |
| Raretés | nom, multiplicateur armure | (idem) |
| Types d'armure | type, armure (Bras 2, Plastron 3, Jambière 2, Casque 2) | (idem) |
| Armes | nom, roll (texte libre, décidé par le MJ), à deux mains, description / effet, 2e forme facultative (mêmes champs) | armes que le MJ donne aux personnages ; une arme à deux formes se change dans la fiche (bouton ⇄) |
| Sets d'armure | nom, métal, rareté, pièces cochées, description | **plus utilisés par la fiche** : les armures sont des objets uniques (voir plus bas) |

Tant que rien n'est enregistré, le JDR utilise des exemples de départ. Le tout est stocké en JSON
dans la colonne *Données RP* de l'onglet JDR. Supprimer un élément déjà donné à un personnage le fait
disparaître de sa fiche.

## Objets uniques (armures)

Tuile **Objets uniques** dans le menu d'un JDR (MJ). Chaque armure est un **objet à part**, comme en
programmation objet : elle a son nom, sa **Protection max**, sa **Protection actuelle** (son usure),
sa **valeur** (10 = armure divine), une description, et son **porteur** (un personnage du JDR, ou personne).

- Le MJ crée les objets à la main, les modifie, les donne à un personnage ou les reprend, les supprime.
- Dans la fiche (section **Armure**), le personnage voit les armures qu'il porte et en équipe une d'un clic.
  La jauge **Protection** est celle de l'armure équipée : les dégâts usent **cette** armure.
- L'usure reste attachée à l'armure : changer d'armure, recharger la page, ou donner l'armure à un autre
  personnage ne la remet pas à neuf. Le joueur et le MJ la réparent avec le ✎ de la jauge Protection.
- Armure divine : seul le MJ autorise ou bloque son usure (bouton sous la jauge), et c'est gardé par l'objet.
- Les armures rangées (portées mais pas équipées) prennent 3 emplacements de l'inventaire important.
- Un personnage supprimé laisse ses objets dans le JDR, sans porteur.
- Stockage : onglet **Objets** du Google Sheet (créé tout seul), une ligne par objet.

**Mise en place (une fois)** — dans Apps Script : ajoute le fichier **`Objets`** (contenu de
`apps-script/Objets.gs`), remplace `Reglages`, `Web`, `Feuilles`, `Fiches`, `Jdr` et `Personnages`,
enregistre, puis **Déployer → Gérer les déploiements → ✏️ → Nouvelle version**.
Les anciennes armures des fiches (sets cochés) ne sont pas reprises : le MJ recrée les armures en objets.

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
L'image du personnage passe aussi par messages : `jdr:image` (site → fiche), `jdr:image-voir`,
`jdr:image-fichier`, `jdr:image-retirer` (fiche → site).

### Disposition de la fiche Nardin

- **Grand écran** : colonne de gauche avec l'image du personnage, puis **PV** (+ Encaisser des dégâts,
  Défense, Blessures graves), **Mana** (+ Sort), **Énergie** (+ Efforts). Elle prend toute la largeur libre
  (de 280 à 760 px). À partir de 400 px, les trois jauges sont sur la même ligne et leurs outils
  en dessous ; à partir de 600 px, chaque outil est juste sous sa jauge (Dégâts | Sort | Efforts).
  La **Défense** (Protection, Protection magique) suit, juste avant les Blessures graves. Au centre, dans l'ordre : **Compétences**, Armes,
  Armure (armures portées = objets uniques), Dons & connaissances, Inventaire important, Inventaire non important, Bourse,
  Réglages du MJ. À droite : le cadre Réussite (et le jet du sort).
- **Écran moyen** : l'état passe au-dessus sur deux colonnes, puis les Compétences.
- **Téléphone** : tout l'un sous l'autre ; l'image est une vignette dans la barre du haut.
- Rien autour (Réussite, jet du sort, image) ne décale la fiche. Mise en page : `fiches/nardin/css/colonnes.css`.

## Images des personnages

Dans une fiche, l'image du personnage est en haut de la colonne de gauche (au-dessus des PV).
Le **MJ** du JDR et le **joueur** du personnage peuvent l'ajouter (« + Ajouter une image »), la changer
ou la retirer ; les compagnons la voient seulement. Un clic l'ouvre en grand. Sur écran étroit,
c'est une petite vignette ronde dans la barre du haut (un clic l'ouvre en grand, avec Changer / Retirer).

- Les images vont dans le dossier **« Grimoire des Aventuriers — Images »** de ton Google Drive.
  Elles restent **privées** : le site les lit à travers le script, avec les mêmes droits que la fiche.
- L'onglet *Personnages* a une colonne **Image** (identifiant du fichier Drive), ajoutée toute seule.
- Une image plus grande que 2000 px ou plus lourde que 3 Mo est réduite avant l'envoi (8 Mo au plus).
  Une image changée, retirée, ou celle d'un personnage supprimé va dans la **corbeille** du Drive (30 jours).

**Mise en place (une fois)** — dans Apps Script :
1. Ajoute le fichier **`Images`** (bouton **+** → **Script**) et colles-y `apps-script/Images.gs`.
2. Remplace aussi le contenu de `Reglages`, `Web`, `Feuilles` et `Personnages` par les nouvelles versions.
3. Choisis la fonction **`autoriserDrive`** puis **▶ Exécuter** : Google demande l'accès à ton Drive
   (« Paramètres avancés → Accéder au projet »). Le dossier d'images est créé.
4. **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version**.

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
sous la **Réussite** (cadre de droite, ou juste sous le bandeau du haut sur téléphone).
Ce cadre flotte par-dessus la page : il ne pousse ni ne rétrécit jamais la fiche.
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
