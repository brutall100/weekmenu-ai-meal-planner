/**
 * SAVAITĖS DĖLIONĖ – gryna logika, be duomenų bazės ir be AI.
 *
 * Atskirta nuo planner.ts tyčia: tą pačią dėlionę naudoja ir serveris,
 * ir GitHub Pages demo (scripts/demo), kuris veikia tik naršyklėje.
 * Todėl čia importuojam TIK iš `shared/`.
 */
import type { Meal, MealSlot, PlanEntry, Profile } from "@shared/types.ts";

/** Savaitgalis: šeštadienis (5) ir sekmadienis (6) – laiko gaminti daugiau. */
function isWeekend(day: number): boolean {
  return day >= 5;
}

/**
 * Ar patiekalas tinka šiai dienai ir šiam valgymui.
 * Darbo dieną gerbiam žmogaus turimą laiką; savaitgalį leidžiam dvigubai.
 */
export function fits(
  meal: Meal,
  slot: MealSlot,
  day: number,
  profile: Profile,
): boolean {
  if (!meal.slots.includes(slot)) return false;
  const budget = isWeekend(day)
    ? profile.minutesPerDay * 2
    : profile.minutesPerDay;
  if (meal.minutes > budget) return false;
  const text = `${meal.name} ${meal.description} ${
    meal.ingredients.map((i) => i.name).join(" ")
  }`
    .toLowerCase();
  return !profile.dislikes.some((d) =>
    d.trim() && text.includes(d.trim().toLowerCase())
  );
}

/**
 * Sudėlioja savaitės langelius.
 *
 * Dvi taisyklės:
 *  1. Tą pačią dieną tas pats patiekalas nekartojamas (pietūs ≠ vakarienė),
 *     nebent visai nėra iš ko rinktis.
 *  2. Per savaitę kiekvienas patiekalas kartojamas kuo rečiau: pirma
 *     panaudojami visi tinkami, tik tada kas nors pasikartoja.
 * Pasikartojimas – dažniausia priežastis, dėl kurios žmonės meta
 * maisto planavimo programėles.
 */
export function arrangeWeek(meals: Meal[], profile: Profile): PlanEntry[] {
  const slots = profile.slots.length ? profile.slots : ["pietūs" as MealSlot];
  const entries: PlanEntry[] = [];

  // Bendras skaitiklis visiems valgymams: kiek kartų patiekalas jau plane.
  const uses = new Map<string, number>();
  // Sumaišom vieną kartą – lygiųjų atveju laimi atsitiktinis, ne pirmas sąraše.
  const shuffled = shuffle(meals);

  for (let day = 0; day < 7; day++) {
    const today = new Set<string>();
    for (const slot of slots) {
      const forSlot = shuffled.filter((m) => m.slots.includes(slot));
      const fitting = forSlot.filter((m) => fits(m, slot, day, profile));
      // Jei nieko netinka pagal laiką ar nemėgstamus – geriau kas nors,
      // nei tuščia diena.
      const base = fitting.length > 0 ? fitting : forSlot;
      const notToday = base.filter((m) => !today.has(m.id));
      const candidates = notToday.length > 0 ? notToday : base;
      if (candidates.length === 0) continue; // šitam valgymui patiekalų nėra

      const pick = candidates.reduce((best, m) =>
        (uses.get(m.id) ?? 0) < (uses.get(best.id) ?? 0) ? m : best
      );
      uses.set(pick.id, (uses.get(pick.id) ?? 0) + 1);
      today.add(pick.id);
      entries.push({ day, slot, mealId: pick.id, done: false });
    }
  }
  return entries;
}

/**
 * Kuo pakeisti vieną langelį. Pirma – patiekalas, kurio šią savaitę dar
 * nėra; jei tokių nebėra – bet kuris kitas. `undefined` – nėra iš ko.
 */
export function pickSwap(
  entries: PlanEntry[],
  day: number,
  slot: MealSlot,
  candidates: Meal[],
): Meal | undefined {
  const current = entries.find((e) => e.day === day && e.slot === slot)
    ?.mealId;
  const suitable = candidates.filter((m) =>
    m.slots.includes(slot) && m.id !== current
  );
  const used = new Set(entries.map((e) => e.mealId));
  const unused = suitable.filter((m) => !used.has(m.id));
  return shuffle(unused.length > 0 ? unused : suitable)[0];
}

/** Sumaišo masyvą (Fisher–Yates). Nauja kopija, originalo neliečiam. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
