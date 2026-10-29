/**
 * Grimoire des Aventuriers — serveur Google Apps Script
 * ------------------------------------------------------
 * Tous les fichiers .gs de ce dossier vont dans le même projet Apps Script
 * (Google Sheet du site : Extensions > Apps Script, un fichier « + » par .gs).
 * Ils se voient entre eux : l'ordre des fichiers n'a pas d'importance.
 *
 * Puis Déployer > Nouveau déploiement > Application Web
 *   - Exécuter en tant que : Moi
 *   - Qui a accès : Tout le monde
 * L'URL obtenue (…/exec) va dans config.js (API_URL).
 *
 * Après chaque modification : Déployer > Gérer les déploiements
 * > crayon > Version : « Nouvelle version » (l'URL reste la même).
 */

// ── Réglages ────────────────────────────────────────────────────
const INSCRIPTION_OUVERTE = true;            // false = seuls les comptes déjà dans le Sheet peuvent se connecter
const ONGLET_COMPTES = 'Comptes';
const ENTETES = ['Pseudo', 'Empreinte mdp', 'Sel', 'Rôle', 'Créé le', 'Dernière connexion'];
const DUREE_LONGUE = 30 * 24 * 3600 * 1000;  // « Rester connecté » : 30 jours
const DUREE_COURTE = 12 * 3600 * 1000;       // sinon : 12 heures
const REGLE_PSEUDO = /^[\p{L}\p{N}][\p{L}\p{N} _'\-]{1,23}$/u;

// Colonnes (1 = A)
const COL = { PSEUDO: 1, EMPREINTE: 2, SEL: 3, ROLE: 4, CREE: 5, DERNIERE: 6 };

const ONGLET_JDR = 'JDR';
const ENTETES_JDR = ['ID', 'Nom', 'Description', 'MJ', 'Créé le', 'Type de fiche', 'Données RP'];
const COL_JDR = { ID: 1, NOM: 2, DESCRIPTION: 3, MJ: 4, CREE: 5, TYPE_FICHE: 6, DONNEES_RP: 7 };
// Données RP : JSON des listes du MJ (métaux, raretés, types d'armure, armes, sets d'armure)

const ONGLET_PERSOS = 'Personnages';
const ENTETES_PERSOS = ['ID', 'JDR', 'Nom', 'Type', 'Joueur', 'Notes', 'Créé le', 'Fiche', 'Image'];
const COL_PERSO = { ID: 1, JDR: 2, NOM: 3, TYPE: 4, JOUEUR: 5, NOTES: 6, CREE: 7, FICHE: 8, IMAGE: 9 };
// Image : identifiant du fichier dans le dossier Drive des images (voir Images.gs), vide si aucune
const TAILLE_MAX_FICHE = 45000; // une cellule Google Sheets contient au plus 50 000 caractères
// Inventaires d'une fiche dont les objets cachés sont retirés pour les autres joueurs
const INVENTAIRES_FICHE = ['inventaire', 'inventaireNonImportant'];
// Type : PJ (personnage joueur) ou PNJ. Fiche : contenu JSON de la fiche perso.
// Objets uniques d'un JDR (Objets.gs) : pour l'instant les armures, chacune avec sa propre usure
const ONGLET_OBJETS = 'Objets';
const ENTETES_OBJETS = ['ID', 'JDR', 'Type', 'Nom', 'Description', 'Protection max', 'Protection actuelle', 'Valeur', 'Porteur', 'Usure autorisée', 'Créé le'];
const COL_OBJET = { ID: 1, JDR: 2, TYPE: 3, NOM: 4, DESCRIPTION: 5, PROTECTION_MAX: 6, PROTECTION_ACTUELLE: 7, VALEUR: 8, PORTEUR: 9, USURE: 10, CREE: 11 };
// Porteur : identifiant du personnage qui porte l'objet (vide = personne)

// Images de personnage (Images.gs) : fichiers privés dans un dossier de ton Google Drive
const DOSSIER_IMAGES = 'Grimoire des Aventuriers — Images';
const TYPES_IMAGE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const TAILLE_MAX_IMAGE = 8 * 1024 * 1024;   // 8 Mo par image
const SESSION_EXPIREE = { ok: false, session: false, erreur: 'Session expirée, reconnecte-toi.' };
