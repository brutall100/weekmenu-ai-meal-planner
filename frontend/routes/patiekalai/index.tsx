import { define } from "../../utils.ts";
import { Layout } from "../../components/Layout.tsx";
import { MealCard } from "../../components/MealCard.tsx";
import { EmptyState, LinkButton } from "../../components/ui.tsx";
import { listMeals } from "@backend/db/repositories/meals.ts";
import { listCategories } from "@backend/db/repositories/categories.ts";

export default define.page(async function MealsPage(ctx) {
  const [meals, categories] = await Promise.all([
    listMeals(200),
    listCategories(),
  ]);

  // Filtras per URL (?kategorija=keto) – veikia ir be JavaScript.
  const filterSlug = ctx.url.searchParams.get("kategorija");
  const filterCategory = categories.find((c) => c.slug === filterSlug);
  const visible = filterCategory
    ? meals.filter((m) => m.categoryIds.includes(filterCategory.id))
    : meals;

  const maxMinutes = Number(ctx.url.searchParams.get("iki")) || 0;
  const shown = maxMinutes > 0
    ? visible.filter((m) => m.minutes <= maxMinutes)
    : visible;

  return (
    <Layout engagement={ctx.state.engagement} active="/patiekalai">
      <header class="mb-6">
        <h1 class="font-display text-3xl font-bold text-ink">
          Visi patiekalai
        </h1>
        <p class="mt-1 text-ink-soft">
          Rodoma: {shown.length} / {meals.length}
        </p>
      </header>

      <div class="mb-6 flex flex-wrap gap-2">
        <a
          href="/patiekalai"
          class={`rounded-full border px-3 py-1.5 text-sm ${
            !filterCategory
              ? "border-brand bg-brand-soft text-brand-strong"
              : "border-line text-ink-soft"
          }`}
        >
          Visos
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/patiekalai?kategorija=${c.slug}`}
            class={`rounded-full border px-3 py-1.5 text-sm ${
              filterCategory?.id === c.id
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-line text-ink-soft hover:border-brand"
            }`}
          >
            {c.emoji} {c.name}
          </a>
        ))}
      </div>

      <div class="mb-6 flex flex-wrap gap-2 text-sm">
        <span class="py-1.5 text-ink-soft">Kiek turiu laiko:</span>
        {[15, 30, 45].map((m) => (
          <a
            key={m}
            href={`/patiekalai?${
              filterSlug ? `kategorija=${filterSlug}&` : ""
            }iki=${m}`}
            class={`rounded-full border px-3 py-1.5 ${
              maxMinutes === m
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-line text-ink-soft"
            }`}
          >
            iki {m} min
          </a>
        ))}
      </div>

      {shown.length === 0
        ? (
          <EmptyState
            emoji="🔍"
            title="Pagal šiuos filtrus nieko nėra"
            body="Pabandyk kitą kategoriją arba ilgesnį gaminimo laiką."
            action={
              <LinkButton href="/patiekalai" variant="secondary">
                Nuimti filtrus
              </LinkButton>
            }
          />
        )
        : (
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((meal) => <MealCard key={meal.id} meal={meal} />)}
          </div>
        )}
    </Layout>
  );
});
