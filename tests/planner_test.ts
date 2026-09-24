import { assertEquals, assertThrows } from "@std/assert";
import { composePlan, swapEntry } from "@backend/services/planner.ts";
import { buildShoppingList } from "@backend/services/shopping.ts";
import { weekStart } from "@backend/lib/dates.ts";
import type { Meal, Profile, WeekPlan } from "@shared/types.ts";

function meal(id: string, over: Partial<Meal> = {}): Meal {
  return {
    id,
    name: `Patiekalas ${id}`,
    description: "Aprašymas",
    categoryIds: ["c1"],
    ingredients: [
      { name: "ryžiai", amount: 100, unit: "g", aisle: "kruopos ir miltai" },
    ],
    steps: ["Virk", "Valgyk"],
    minutes: 20,
    difficulty: 1,
    nutrition: { kcal: 400, protein: 20, carbs: 50, fat: 10 },
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    createdAt: "2026-09-14T00:00:00.000Z",
    ...over,
  };
}

const profile: Profile = {
  name: "",
  categoryId: "c1",
  household: 2,
  dislikes: [],
  minutesPerDay: 30,
  slots: ["pietūs"],
};

Deno.test("planas užpildo visas septynias dienas", () => {
  const meals = Array.from({ length: 10 }, (_, i) => meal(`m${i}`));
  const plan = composePlan({ userId: "u1", profile, meals });
  assertEquals(plan.entries.length, 7);
  assertEquals(new Set(plan.entries.map((e) => e.day)).size, 7);
});

Deno.test("patiekalai nesikartoja, kol yra iš ko rinktis", () => {
  const meals = Array.from({ length: 10 }, (_, i) => meal(`m${i}`));
  const plan = composePlan({ userId: "u1", profile, meals });
  const ids = plan.entries.map((e) => e.mealId);
  assertEquals(new Set(ids).size, 7, "visi septyni turi būti skirtingi");
});

Deno.test("tą pačią dieną pietums ir vakarienei – skirtingi patiekalai", () => {
  // Tik trys patiekalai 14-ai langelių: kartotis teks, bet ne tą pačią dieną.
  const meals = Array.from({ length: 3 }, (_, i) => meal(`m${i}`));
  const plan = composePlan({
    userId: "u1",
    profile: { ...profile, slots: ["pietūs", "vakarienė"] },
    meals,
  });
  for (let day = 0; day < 7; day++) {
    const ids = plan.entries.filter((e) => e.day === day).map((e) => e.mealId);
    assertEquals(new Set(ids).size, ids.length, `diena ${day}`);
  }
  // Ir pasikartojimai paskirstyti tolygiai: 14 langelių / 3 patiekalai ≤ 5.
  const counts = new Map<string, number>();
  for (const e of plan.entries) {
    counts.set(e.mealId, (counts.get(e.mealId) ?? 0) + 1);
  }
  for (const n of counts.values()) {
    assertEquals(n <= 5, true, "nė vienas neturi kartotis per dažnai");
  }
});

Deno.test("darbo dieną nesiūlom ilgesnio recepto nei turimas laikas", () => {
  const meals = [
    ...Array.from(
      { length: 5 },
      (_, i) => meal(`greitas${i}`, { minutes: 20 }),
    ),
    meal("ilgas", { minutes: 120 }),
  ];
  const plan = composePlan({ userId: "u1", profile, meals });
  const weekdayEntries = plan.entries.filter((e) => e.day < 5);
  const byId = new Map(meals.map((m) => [m.id, m]));
  for (const entry of weekdayEntries) {
    const chosen = byId.get(entry.mealId)!;
    assertEquals(
      chosen.minutes <= 30,
      true,
      `${chosen.name} per ilgas darbo dienai`,
    );
  }
});

Deno.test("nemėgstami produktai išmetami", () => {
  const meals = [
    meal("su-grybais", {
      ingredients: [{
        name: "grybai",
        amount: 100,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      }],
    }),
    ...Array.from({ length: 8 }, (_, i) => meal(`be-grybu${i}`)),
  ];
  const plan = composePlan({
    userId: "u1",
    profile: { ...profile, dislikes: ["grybai"] },
    meals,
  });
  assertEquals(plan.entries.some((e) => e.mealId === "su-grybais"), false);
});

Deno.test("be tinkamų patiekalų metam aiškią klaidą, o ne tuščią planą", () => {
  assertThrows(
    () => composePlan({ userId: "u1", profile, meals: [] }),
    Error,
    "Nepavyko rasti tinkamų patiekalų",
  );
});

Deno.test("swapEntry parenka kitą patiekalą, o ne tą patį", () => {
  const meals = Array.from({ length: 10 }, (_, i) => meal(`m${i}`));
  const plan = composePlan({ userId: "u1", profile, meals });
  const before = plan.entries.find((e) => e.day === 0)!.mealId;
  const after = swapEntry(plan, 0, "pietūs", meals);
  const now = after.entries.find((e) => e.day === 0)!.mealId;
  assertEquals(now === before, false);
});

Deno.test("swapEntry veikia net kai visi patiekalai jau panaudoti", () => {
  // 7 langeliai, 7 patiekalai – laisvų nebėra.
  const meals = Array.from({ length: 7 }, (_, i) => meal(`m${i}`));
  const plan = composePlan({ userId: "u1", profile, meals });
  const after = swapEntry(plan, 0, "pietūs", meals);
  assertEquals(after.entries.length, 7);
});

Deno.test("pirkinių sąrašas sudeda vienodus ingredientus ir daugina iš porcijų", () => {
  const meals = new Map([
    ["m1", meal("m1")],
    ["m2", meal("m2")],
  ]);
  const plan: WeekPlan = {
    id: "p1",
    userId: "u1",
    categoryId: "c1",
    weekStart: weekStart(new Date("2026-09-17T00:00:00Z")),
    createdAt: "2026-09-14T00:00:00.000Z",
    entries: [
      { day: 0, slot: "pietūs", mealId: "m1", done: false },
      { day: 1, slot: "pietūs", mealId: "m2", done: false },
    ],
  };
  const sections = buildShoppingList(plan, meals, 3);
  const rice = sections.flatMap((s) => s.lines).find((l) =>
    l.name === "ryžiai"
  )!;
  // 100 g × 2 patiekalai × 3 žmonės
  assertEquals(rice.amount, 600);
});

Deno.test("jau pagaminti patiekalai į pirkinių sąrašą nepatenka", () => {
  const meals = new Map([["m1", meal("m1")], ["m2", meal("m2")]]);
  const plan: WeekPlan = {
    id: "p1",
    userId: "u1",
    categoryId: "c1",
    weekStart: "2026-09-14",
    createdAt: "2026-09-14T00:00:00.000Z",
    entries: [
      { day: 0, slot: "pietūs", mealId: "m1", done: true },
      { day: 1, slot: "pietūs", mealId: "m2", done: false },
    ],
  };
  const sections = buildShoppingList(plan, meals, 1, { onlyUndone: true });
  const rice = sections.flatMap((s) => s.lines).find((l) =>
    l.name === "ryžiai"
  )!;
  assertEquals(rice.amount, 100, "tik nepagamintas patiekalas");
});

Deno.test("weekStart visada grąžina pirmadienį", () => {
  assertEquals(weekStart(new Date("2026-09-17T12:00:00Z")), "2026-09-14"); // ketvirtadienis
  assertEquals(weekStart(new Date("2026-09-14T00:00:00Z")), "2026-09-14"); // pirmadienis
  assertEquals(weekStart(new Date("2026-09-20T23:00:00Z")), "2026-09-14"); // sekmadienis
});
