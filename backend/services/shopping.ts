import { GROCERY_AISLES } from "@shared/types.ts";
import { normalizeUnit } from "@shared/units.ts";
import type {
  GroceryAisle,
  Ingredient,
  Meal,
  WeekPlan,
} from "@shared/types.ts";

export interface ShoppingLine {
  name: string;
  amount: number;
  unit: string;
  aisle: GroceryAisle;
}

export interface ShoppingSection {
  aisle: GroceryAisle;
  lines: ShoppingLine[];
}

/**
 * Pirkinių sąrašas iš savaitės plano.
 *
 * Kodėl tai svarbu psichologiškai: didžiausia kliūtis tarp
 * "noriu sveikai valgyti" ir realaus valgymo yra ne receptas,
 * o tai, kad namie nėra produktų. Sąrašas paverčia ketinimą veiksmu.
 *
 * Grupuojam pagal parduotuvės skyrius, nes taip einama per parduotuvę –
 * ne pagal patiekalus.
 */
export function buildShoppingList(
  plan: WeekPlan,
  meals: Map<string, Meal>,
  household = 1,
  options: { onlyUndone?: boolean } = {},
): ShoppingSection[] {
  const totals = new Map<string, ShoppingLine>();

  const entries = options.onlyUndone
    ? plan.entries.filter((e) => !e.done)
    : plan.entries;

  for (const entry of entries) {
    const meal = meals.get(entry.mealId);
    if (!meal) continue;
    for (const ing of meal.ingredients) {
      add(totals, ing, household);
    }
  }

  return GROCERY_AISLES
    .map((aisle) => ({
      aisle,
      lines: [...totals.values()]
        .filter((l) => l.aisle === aisle)
        .sort((a, b) => a.name.localeCompare(b.name, "lt")),
    }))
    .filter((section) => section.lines.length > 0);
}

/** Sudeda tą patį ingredientą su tuo pačiu matu į vieną eilutę. */
function add(
  totals: Map<string, ShoppingLine>,
  ing: Ingredient,
  household: number,
): void {
  const unit = normalizeUnit(ing.unit);
  const key = `${ing.name.toLowerCase().trim()}|${unit}`;
  const existing = totals.get(key);
  const amount = round(ing.amount * household);
  if (existing) {
    existing.amount = round(existing.amount + amount);
  } else {
    totals.set(key, {
      name: ing.name,
      amount,
      unit,
      aisle: ing.aisle,
    });
  }
}

/** Vienas skaičius po kablelio – "187,5 g" skaitosi, "187,49999 g" ne. */
function round(n: number): number {
  return Math.round(n * 10) / 10;
}
