import { newId } from "../lib/id.ts";
import { weekStart } from "../lib/dates.ts";
import { ensureMeals } from "./catalog.ts";
import { savePlan } from "../db/repositories/plans.ts";
import { AppError } from "../lib/errors.ts";
import { MEAL_SLOTS } from "@shared/types.ts";
import { arrangeWeek, pickSwap } from "./arrange.ts";
import type { Meal, MealSlot, Profile, WeekPlan } from "@shared/types.ts";

/** Sudėlioja savaitės planą (taisyklės – arrange.ts). */
export function composePlan(opts: {
  userId: string;
  profile: Profile;
  meals: Meal[];
  weekStartIso?: string;
}): WeekPlan {
  const { userId, profile, meals } = opts;
  const entries = arrangeWeek(meals, profile);

  if (entries.length === 0) {
    throw new AppError(
      "Nepavyko rasti tinkamų patiekalų. Pabandyk kitą kategoriją.",
      422,
    );
  }

  return {
    id: newId(),
    userId,
    categoryId: profile.categoryId,
    weekStart: opts.weekStartIso ?? weekStart(),
    entries,
    createdAt: new Date().toISOString(),
  };
}

/** Visas kelias: pasirūpinam patiekalais, sudėliojam planą, įrašom. */
export async function createPlanForUser(
  userId: string,
  profile: Profile,
): Promise<WeekPlan> {
  const slots = profile.slots.length ? profile.slots : [MEAL_SLOTS[1]];
  // Norim bent 1,5 karto daugiau patiekalų nei langelių – kad būtų iš ko rinktis.
  const need = Math.ceil(7 * slots.length * 1.5);
  const { meals } = await ensureMeals({
    categoryId: profile.categoryId,
    need,
    profile,
    slots,
  });
  const plan = composePlan({ userId, profile: { ...profile, slots }, meals });
  await savePlan(plan);
  return plan;
}

/**
 * Pakeičia vieną langelį kitu patiekalu.
 * Tai "nepatinka – duok kitą" mygtukas: žmogus jaučia, kad valdo planą,
 * o ne planas jį. Be šito mygtuko žmonės tiesiog uždaro puslapį.
 */
export function swapEntry(
  plan: WeekPlan,
  day: number,
  slot: MealSlot,
  candidates: Meal[],
): WeekPlan {
  // Jei nebėra nepanaudotų – leidžiam pasikartojimą, nes tylus
  // "nieko negaliu" būtų blogiau nei tas pats patiekalas du kartus.
  const pick = pickSwap(plan.entries, day, slot, candidates);
  if (!pick) {
    throw new AppError(
      "Šiam valgymui kitų patiekalų neturim. Sugeneruok naujų kategorijos puslapyje.",
      409,
    );
  }

  return {
    ...plan,
    entries: plan.entries.map((e) =>
      e.day === day && e.slot === slot
        ? { ...e, mealId: pick.id, done: false }
        : e
    ),
  };
}
