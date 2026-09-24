import { define } from "../../utils.ts";
import { Layout } from "../../components/Layout.tsx";
import { Card } from "../../components/ui.tsx";
import { listCategories } from "@backend/db/repositories/categories.ts";
import { countMealsByCategory } from "@backend/db/repositories/meals.ts";
import { plural, WORDS } from "@shared/plural.ts";

export default define.page(async function CategoriesPage(ctx) {
  const categories = await listCategories();
  const counts = await Promise.all(
    categories.map((c) => countMealsByCategory(c.id)),
  );

  return (
    <Layout engagement={ctx.state.engagement} active="/kategorijos">
      <header class="mb-6">
        <h1 class="font-display text-3xl font-bold text-ink">Kategorijos</h1>
        <p class="mt-1 text-ink-soft">
          Kiekviena kategorija turi savo taisykles, kurių AI privalo laikytis.
        </p>
      </header>

      <div class="grid gap-4 sm:grid-cols-2">
        {categories.map((category, i) => (
          <a
            key={category.id}
            href={`/kategorijos/${category.slug}`}
            class="block"
          >
            <Card lift class="h-full hover:border-brand">
              <div class="flex items-start gap-3">
                <span class="text-3xl">{category.emoji}</span>
                <div>
                  <h2 class="font-display text-xl font-bold text-ink">
                    {category.name}
                  </h2>
                  <p class="mt-1 text-sm text-ink-soft">{category.summary}</p>
                  <p class="mt-3 text-xs font-medium text-brand-strong">
                    {plural(counts[i], WORDS.patiekalas)}
                  </p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </Layout>
  );
});
