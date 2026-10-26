/* ================================================================
   RÈGLES — sorts : jet de dégâts selon le mana dépensé
   M = mana dépensé, D = dizaines de M (M ÷ 10, arrondi en dessous), U = unité de M.
     M ≤ 60 : D d6 + U          (ex. 45  → 4d6 + 5)
     M > 60 : D dD + U × 2      (ex. 750 → 75d75, 123 → 12d12 + 6)
   Bonus (case à cocher) : dégâts × 1,5. Malus : dégâts × 0,75.
   ================================================================ */
"use strict";

const SEUIL_MANA_D6 = 60;      // jusqu'à 60 de mana : des d6
const MULT_BONUS_SORT = 1.5;
const MULT_MALUS_SORT = 0.75;

function jetMana(mana, bonus = false, malus = false) {
  const m = Math.max(0, Math.floor(Number(mana) || 0));
  const nbDes = Math.floor(m / 10);
  const unite = m % 10;
  const petit = m <= SEUIL_MANA_D6;
  const faces = petit ? 6 : nbDes;
  const fixe = petit ? unite : unite * 2;
  const mult = (bonus ? MULT_BONUS_SORT : 1) * (malus ? MULT_MALUS_SORT : 1);
  const texte = [nbDes ? `${nbDes}d${faces}` : "", fixe ? String(fixe) : ""].filter(Boolean).join(" + ") || "0";
  return {
    mana: m, nbDes, faces, fixe, mult, texte,
    min:     Math.round((nbDes + fixe) * mult),
    moyenne: Math.round((nbDes * (faces + 1) / 2 + fixe) * mult * 10) / 10,
    max:     Math.round((nbDes * faces + fixe) * mult),
  };
}
