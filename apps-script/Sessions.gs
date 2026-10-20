// ─────────────────────────────────────────────────────────────
//  Sessions (stockées dans les propriétés du script)
// ─────────────────────────────────────────────────────────────

function ouvrirSession(pseudo, role, rester) {
  const jeton = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  const exp = Date.now() + (rester ? DUREE_LONGUE : DUREE_COURTE);
  const props = PropertiesService.getScriptProperties();
  nettoyerSessions(props);
  props.setProperty('s_' + jeton, JSON.stringify({ pseudo: pseudo, exp: exp }));
  return { ok: true, jeton: jeton, pseudo: pseudo, role: role };
}

function lireSession(jeton) {
  if (!estJeton(jeton)) return null;
  const props = PropertiesService.getScriptProperties();
  const brut = props.getProperty('s_' + jeton);
  if (!brut) return null;
  const s = JSON.parse(brut);
  if (s.exp < Date.now()) { props.deleteProperty('s_' + jeton); return null; }
  return s;
}

function nettoyerSessions(props) {
  const toutes = props.getProperties();
  const maintenant = Date.now();
  Object.keys(toutes).forEach(function (cle) {
    if (cle.indexOf('s_') !== 0) return;
    try { if (JSON.parse(toutes[cle]).exp < maintenant) props.deleteProperty(cle); }
    catch (e) { props.deleteProperty(cle); }
  });
}
