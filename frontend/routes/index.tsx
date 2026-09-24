import { define } from "../utils.ts";
import { Layout } from "../components/Layout.tsx";
import { NudgeCard } from "../components/NudgeCard.tsx";
import { MealCard } from "../components/MealCard.tsx";
import { Card, Icon, LinkButton } from "../components/ui.tsx";
import { WeekPlate } from "../components/WeekPlate.tsx";
import { pluralWord, WORDS } from "@shared/plural.ts";
import { buildNudge } from "@backend/services/engagement.ts";
import { getActivePlan } from "@backend/db/repositories/plans.ts";
import { listCategories } from "@backend/db/repositories/categories.ts";
import { listMeals } from "@backend/db/repositories/meals.ts";
import { listStories } from "@backend/db/repositories/stories.ts";

export default define.page(async function Home(ctx) {
  const [plan, categories, meals, stories] = await Promise.all([
    getActivePlan(ctx.state.user.id),
    listCategories(),
    listMeals(60),
    listStories(2),
  ]);

  const nudge = buildNudge({ engagement: ctx.state.engagement, plan });
  const featured = meals.slice(0, 3);

  return (
    <Layout engagement={ctx.state.engagement}>
      {/* Pirmas ekranas: vienas pažadas, vienas mygtukas, jokio triukšmo. */}
      <section class="grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
        {/* Tekstas ant permatomo paviršiaus – gyvas fonas netrukdo skaityti. */}
        <div class="rounded-card bg-surface/80 p-5 text-center backdrop-blur-sm sm:p-8 md:text-left">
          <p class="inline-flex items-center gap-2 rounded-full bg-plate-soft px-3 py-1 text-sm font-semibold text-plate">
            Nustok kas vakarą klausti „ką šiandien valgom?“
          </p>
          <h1 class="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Visos savaitės <span class="text-brand-strong">meniu</span>{" "}
            – per vieną minutę
          </h1>
          <p class="mt-5 max-w-xl text-lg text-ink-soft md:mx-0 mx-auto">
            Trys klausimai – ir turi septynių dienų planą su receptais bei
            pirkinių sąrašu. Pritaikyta diabetikams, sportininkams, vegetarams
            ir dar septynioms grupėms.
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <LinkButton href="/pradzia" class="px-7 py-3 text-base">
              <Icon>🍽️</Icon> Sudaryti mano meniu
            </LinkButton>
            <LinkButton
              href="/patiekalai"
              variant="secondary"
              class="px-7 py-3 text-base"
            >
              Pirma pažiūrėti patiekalus
            </LinkButton>
          </div>
          <p class="mt-3 text-sm text-ink-soft">
            Be registracijos. Be el. pašto. Iš karto.
          </p>
        </div>
        <WeekPlate />
      </section>

      {/* Skaičiai – tikri, iš duomenų bazės. Suskaičiuoja pasirodę ekrane. */}
      <dl class="mt-12 grid grid-cols-3 gap-3 text-center">
        {[
          { n: 7, t: "dienos plane" },
          {
            n: categories.length,
            t: `mitybos ${
              pluralWord(categories.length, ["grupė", "grupės", "grupių"])
            }`,
          },
          {
            n: meals.length,
            t: `${pluralWord(meals.length, WORDS.patiekalas)} kataloge`,
            plus: meals.length >= 60,
          },
        ].map((stat) => (
          <div
            key={stat.t}
            data-atsiranda
            class="flex flex-col-reverse rounded-card border border-line bg-surface-raised px-2 py-4"
          >
            <dt class="text-xs text-ink-soft sm:text-sm">{stat.t}</dt>
            <dd class="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              <span data-skaicius={stat.n}>{stat.n}</span>
              {stat.plus ? "+" : ""}
            </dd>
          </div>
        ))}
      </dl>

      {/* Asmeninis kvietimas – keičiasi pagal tai, kur žmogus yra kelyje. */}
      <div class="mt-12">
        <NudgeCard nudge={nudge} />
      </div>

      <section class="mt-12">
        <h2 class="font-display text-2xl font-bold text-ink">
          Kaip tai veikia
        </h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Atsakai į tris klausimus",
              d: "Kam gaminam, kiek jūsų ir kiek turi laiko.",
            },
            {
              n: "2",
              t: "Gauni visos savaitės meniu",
              d: "Septynios dienos be pasikartojimų, pagal tavo mitybą. Trūkstamus receptus sukuria Claude.",
            },
            {
              n: "3",
              t: "Gamini ir žymi",
              d: "Pirkinių sąrašas jau paruoštas. Kiekviena diena, kai ką nors pagamini, ilgina tavo seriją.",
            },
          ].map((step) => (
            <Card key={step.n} lift>
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-action font-mono text-sm font-bold text-on-action">
                {step.n}
              </span>
              <h3 class="mt-3 font-semibold text-ink">{step.t}</h3>
              <p class="mt-1 text-sm text-ink-soft">{step.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section class="mt-12">
        <div class="flex items-baseline justify-between">
          <h2 class="font-display text-2xl font-bold text-ink">Kategorijos</h2>
          <a
            href="/kategorijos"
            class="text-sm font-semibold text-plate hover:underline"
          >
            Visos →
          </a>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/kategorijos/${c.slug}`}
              class="mygtukas rounded-full border border-line bg-surface-raised px-4 py-2 text-sm text-ink hover:border-brand"
            >
              {c.emoji} {c.name}
            </a>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section class="mt-12">
          <div class="flex items-baseline justify-between">
            <h2 class="font-display text-2xl font-bold text-ink">
              Iš mūsų virtuvės
            </h2>
            <a
              href="/patiekalai"
              class="text-sm font-semibold text-plate hover:underline"
            >
              Visi →
            </a>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            {featured.map((meal) => <MealCard key={meal.id} meal={meal} />)}
          </div>
        </section>
      )}

      {/* Istorijos – tik tikrų lankytojų parašytos (sėkloje jų nėra). */}
      {stories.length > 0 && (
        <section class="mt-12">
          <div class="flex items-baseline justify-between">
            <h2 class="font-display text-2xl font-bold text-ink">
              Ką sako kiti
            </h2>
            <a
              href="/istorijos"
              class="text-sm font-semibold text-plate hover:underline"
            >
              Daugiau →
            </a>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            {stories.map((s) => (
              <Card key={s.id}>
                <h3 class="font-semibold text-ink">{s.title}</h3>
                <p class="mt-2 line-clamp-4 text-sm text-ink-soft">
                  {s.content}
                </p>
                <p class="mt-3 text-sm font-medium text-brand-strong">
                  — {s.author}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
});
