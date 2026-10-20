/* ================================================================
   RÈGLES — blessures graves : malus de dés sur toutes les compétences
   index = nombre de blessures : 0 → 0, 1 → −1, 2 → −2, 3 → −4
   ================================================================ */
"use strict";

const MALUS_BLESSURES = [0, -1, -2, -4];
const MAX_BLESSURES = MALUS_BLESSURES.length - 1;   // 3
const malusBlessures = fiche => MALUS_BLESSURES[fiche.blessuresGraves] ?? 0;
