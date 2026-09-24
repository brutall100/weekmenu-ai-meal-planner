import { type PluralForms, pluralWord } from "./plural.ts";

/**
 * Matavimo vienetai pirkinių sąraše.
 *
 * Receptuose tas pats vienetas parašytas skirtingai („šaukštas“ ir
 * „šaukštai“), todėl sąraše jie nesusidėdavo, o rodydavosi kaip
 * „26 šaukštas“. Čia – viena tiesa: kanoninis vardas ir jo formos.
 */
interface UnitForms {
  forms: PluralForms;
  /** Kilmininkas vienaskaita – su trupmenomis: „1,5 šaukšto“. */
  fraction: string;
}

const UNITS: Record<string, UnitForms> = {
  "šaukštas": {
    forms: ["šaukštas", "šaukštai", "šaukštų"],
    fraction: "šaukšto",
  },
  "arbatinis šaukštelis": {
    forms: [
      "arbatinis šaukštelis",
      "arbatiniai šaukšteliai",
      "arbatinių šaukštelių",
    ],
    fraction: "arbatinio šaukštelio",
  },
  "skiltelė": {
    forms: ["skiltelė", "skiltelės", "skiltelių"],
    fraction: "skiltelės",
  },
  "stiebas": { forms: ["stiebas", "stiebai", "stiebų"], fraction: "stiebo" },
  "žiupsnelis": {
    forms: ["žiupsnelis", "žiupsneliai", "žiupsnelių"],
    fraction: "žiupsnelio",
  },
};

/** Visos žinomos formos → kanoninis vardas. */
const ALIASES = new Map<string, string>();
for (const [canonical, u] of Object.entries(UNITS)) {
  for (const form of [...u.forms, u.fraction]) ALIASES.set(form, canonical);
}

/** „Šaukštai “ → „šaukštas“. Nežinomi vienetai (g, ml, vnt.) lieka kaip yra. */
export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  return ALIASES.get(u) ?? u;
}

function formatNumber(n: number): string {
  return n.toLocaleString("lt-LT", { maximumFractionDigits: 1 });
}

/**
 * Kiekis su vienetu, kaip jį pasakytų žmogus:
 *   3900 g → „3,9 kg“, 26 skiltelė → „26 skiltelės“, 1,5 šaukštas → „1,5 šaukšto“.
 */
export function formatQuantity(amount: number, unit: string): string {
  const u = normalizeUnit(unit);
  if (u === "g" && amount >= 1000) return `${formatNumber(amount / 1000)} kg`;
  if (u === "ml" && amount >= 1000) return `${formatNumber(amount / 1000)} l`;

  const known = UNITS[u];
  if (!known) return `${formatNumber(amount)} ${u}`;
  const word = Number.isInteger(amount)
    ? pluralWord(amount, known.forms)
    : known.fraction;
  return `${formatNumber(amount)} ${word}`;
}
