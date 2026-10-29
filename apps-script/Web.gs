// ─────────────────────────────────────────────────────────────
//  Points d'entrée web : le site appelle doGet / doPost
//  Chaque « action » envoyée par le site correspond à une fonction des autres fichiers.
// ─────────────────────────────────────────────────────────────

function doGet() {
  return json({ ok: true, inscription: INSCRIPTION_OUVERTE });
}

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, erreur: 'Requête illisible.' });
  }
  try {
    switch (req.action) {
      case 'connexion':   return json(connexion(req));
      case 'inscription': return json(inscription(req));
      case 'moi':         return json(moi(req));
      case 'deconnexion': return json(deconnexion(req));
      case 'mesJdr':      return json(mesJdr(req));
      case 'creerJdr':    return json(creerJdr(req));
      case 'jdr':            return json(voirJdr(req));
      case 'choisirFiche':   return json(choisirFiche(req));
      case 'listeJoueurs':   return json(listeJoueurs(req));
      case 'ajouterPerso':   return json(ajouterPerso(req));
      case 'supprimerPerso': return json(supprimerPerso(req));
      case 'fiche':            return json(ouvrirFiche(req));
      case 'enregistrerFiche': return json(enregistrerFiche(req));
      case 'mesPersos':        return json(mesPersos(req));
      case 'enregistrerDonneesRp': return json(enregistrerDonneesRp(req));
      case 'image':          return json(voirImage(req));
      case 'enregistrerObjet': return json(enregistrerObjet(req));
      case 'supprimerObjet':   return json(supprimerObjet(req));
      case 'modifierObjet':    return json(modifierObjet(req));
      case 'envoyerImage':   return json(envoyerImage(req));
      case 'retirerImage':   return json(retirerImage(req));
      default:            return json({ ok: false, erreur: 'Action inconnue.' });
    }
  } catch (err) {
    console.error(err);
    return json({ ok: false, erreur: 'Erreur serveur : ' + (err.message || err) });
  }
}
