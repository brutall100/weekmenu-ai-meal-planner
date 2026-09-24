/**
 * Lietuviškas daugiskaitos derinimas su skaičiumi.
 *
 * Be jo svetainė rašytų „1 žmonėms“ ar „14 patiekalai“ – smulkmena,
 * bet būtent tokios smulkmenos daro produktą neprofesionalų.
 *
 *   plural(1,  ["patiekalas", "patiekalai", "patiekalų"]) → "1 patiekalas"
 *   plural(3,  ["patiekalas", "patiekalai", "patiekalų"]) → "3 patiekalai"
 *   plural(12, ["patiekalas", "patiekalai", "patiekalų"]) → "12 patiekalų"
 */
export type PluralForms = readonly [one: string, few: string, many: string];

export function pluralWord(n: number, forms: PluralForms): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return forms[2];
  if (last === 1) return forms[0];
  if (last === 0) return forms[2];
  return forms[1];
}

export function plural(n: number, forms: PluralForms): string {
  return `${n} ${pluralWord(n, forms)}`;
}

/** Dažniausiai naudojami žodžiai – kad formos nesiskirtų skirtinguose failuose. */
export const WORDS = {
  patiekalas: ["patiekalas", "patiekalai", "patiekalų"],
  patiekalasGal: ["patiekalą", "patiekalus", "patiekalų"],
  // Kilmininkas: „liko 3 iš 7 patiekalų“, „iš 21 patiekalo“.
  patiekalasKilm: ["patiekalo", "patiekalų", "patiekalų"],
  diena: ["diena", "dienos", "dienų"],
  preke: ["prekė", "prekės", "prekių"],
  // Naudininkas: „pirkiniai 1 žmogui“, „3 žmonėms“.
  zmoguiNaud: ["žmogui", "žmonėms", "žmonių"],
} as const satisfies Record<string, PluralForms>;
