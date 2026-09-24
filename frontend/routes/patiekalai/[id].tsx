import { HttpError } from "fresh";
import { define } from "../../utils.ts";
import { Layout } from "../../components/Layout.tsx";
import { Card, Chip } from "../../components/ui.tsx";
import { getMeal } from "@backend/db/repositories/meals.ts";
import { getCategory } from "@backend/db/repositories/categories.ts";
import { formatQuantity } from "@shared/units.ts";

const DIFFICULTY = {
  1: "Lengva",
  2: "Vidutiniška",
  3: "Reikia patirties",
} as const;

export default define.page(async function MealPage(ctx) {
  const meal = await getMeal(ctx.params.id);
  if (!meal) throw new HttpError(404);

  const categories = (await Promise.all(meal.categoryIds.map(getCategory)))
    .filter((c) => c !== null);

  const household = ctx.state.user.profile?.household ?? 1;

  return (
    <Layout engagement={ctx.state.engagement} active="/patiekalai">
      <a href="/patiekalai" class="text-sm text-ink-soft hover:text-ink">
        ← Visi patiekalai
      </a>

      <h1 class="mt-2 font-display text-3xl font-bold text-ink">{meal.name}</h1>
      <p class="mt-2 text-lg text-ink-soft">{meal.description}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <Chip tone="brand">⏱ {meal.minutes} min</Chip>
        <Chip>{DIFFICULTY[meal.difficulty]}</Chip>
        {categories.map((c) => (
          <Chip key={c.id} tone="fresh">{c.emoji} {c.name}</Chip>
        ))}
        {meal.source === "ai" ? <Chip>✨ Sugeneravo Claude</Chip> : null}
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div class="space-y-4">
          <Card>
            <h2 class="font-display text-lg font-bold text-ink">
              Ingredientai{household > 1 ? ` (${household} porcijos)` : ""}
            </h2>
            <ul class="mt-3 space-y-2">
              {meal.ingredients.map((ing) => (
                <li
                  key={`${ing.name}-${ing.unit}`}
                  class="flex justify-between gap-3 text-sm"
                >
                  <span class="text-ink">{ing.name}</span>
                  <span class="shrink-0 text-ink-soft">
                    {formatQuantity(
                      Math.round(ing.amount * household * 10) / 10,
                      ing.unit,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 class="font-display text-lg font-bold text-ink">
              Vienoje porcijoje
            </h2>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Kalorijos", `${meal.nutrition.kcal} kcal`],
                ["Baltymai", `${meal.nutrition.protein} g`],
                ["Angliavandeniai", `${meal.nutrition.carbs} g`],
                ["Riebalai", `${meal.nutrition.fat} g`],
              ].map(([label, value]) => (
                <div key={label} class="rounded-lg bg-surface p-3">
                  <dt class="text-xs text-ink-soft">{label}</dt>
                  <dd class="mt-0.5 font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p class="mt-3 text-xs text-ink-soft">
              Reikšmės apytikslės – priklauso nuo konkrečių produktų.
            </p>
          </Card>
        </div>

        <Card>
          <h2 class="font-display text-lg font-bold text-ink">Kaip gaminti</h2>
          <ol class="mt-4 space-y-4">
            {meal.steps.map((step, i) => (
              <li key={i} class="flex gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action text-sm font-bold text-on-action">
                  {i + 1}
                </span>
                <span class="pt-0.5 text-ink">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Layout>
  );
});
