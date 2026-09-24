import { useSignal } from "@preact/signals";
import { Button } from "../components/ui.tsx";
import { MEAL_SLOTS } from "@shared/types.ts";
import type { Category, MealSlot } from "@shared/types.ts";
import { plural, pluralWord, WORDS } from "@shared/plural.ts";

/**
 * TRIJŲ ŽINGSNIŲ ANKETA.
 *
 * Kodėl trys, o ne viena ilga forma:
 *  - vienas klausimas ekrane atrodo lengvai (mažesnė pradžios kliūtis);
 *  - matomas progresas („2 iš 3“) verčia norėti pabaigti;
 *  - pirmas žingsnis jau pažymėtas, todėl žmogus pradeda ne nuo nulio.
 *
 * Kiekvienas laukas turi protingą numatytą reikšmę – galima
 * tiesiog tris kartus spausti „Toliau“ ir vis tiek gauti gerą planą.
 */
export default function OnboardingWizard(
  { categories }: { categories: Category[] },
) {
  const step = useSignal(0);
  const categoryId = useSignal(categories[0]?.id ?? "");
  const household = useSignal(2);
  const minutesPerDay = useSignal(30);
  const slots = useSignal<MealSlot[]>(["pietūs", "vakarienė"]);
  const dislikes = useSignal("");
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const TOTAL = 3;

  function toggleSlot(slot: MealSlot) {
    const has = slots.value.includes(slot);
    // Bent vienas valgymas turi likti pažymėtas.
    if (has && slots.value.length === 1) return;
    slots.value = has
      ? slots.value.filter((s) => s !== slot)
      : [...slots.value, slot];
  }

  async function submit() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch("/api/profilis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId.value,
          household: household.value,
          minutesPerDay: minutesPerDay.value,
          slots: slots.value,
          dislikes: dislikes.value.split(",").map((d) => d.trim()).filter(
            Boolean,
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko sudaryti plano.");
      globalThis.location.href = "/planas";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Nepavyko sudaryti plano.";
      loading.value = false;
    }
  }

  const selected = categories.find((c) => c.id === categoryId.value);

  return (
    <div class="mx-auto max-w-xl">
      {/* Progresas. Rodom nuo pirmo ekrano – matyti, kad tai trumpa. */}
      <div class="mb-6">
        <div class="flex justify-between text-sm text-ink-soft">
          <span>Žingsnis {step.value + 1} iš {TOTAL}</span>
          <span>{Math.round(((step.value + 1) / TOTAL) * 100)}%</span>
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            class="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${((step.value + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {step.value === 0 && (
        <section>
          <h2 class="font-display text-2xl font-bold text-ink">
            Kam ruošiam maistą?
          </h2>
          <p class="mt-1 text-sm text-ink-soft">
            Pagal tai parenkam taisykles – ką galima, ko ne.
          </p>
          <div class="mt-4 grid gap-2 sm:grid-cols-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => categoryId.value = c.id}
                class={`rounded-card border p-3 text-left transition-colors ${
                  categoryId.value === c.id
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-surface-raised hover:border-brand"
                }`}
              >
                <span class="text-xl">{c.emoji}</span>
                <span class="ml-2 font-semibold text-ink">{c.name}</span>
                <p class="mt-1 text-xs text-ink-soft">{c.summary}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step.value === 1 && (
        <section>
          <h2 class="font-display text-2xl font-bold text-ink">
            Kiek jūsų ir kiek laiko?
          </h2>
          <p class="mt-1 text-sm text-ink-soft">
            Pagal tai apskaičiuojam porcijas ir neduodam recepto, kuriam nėra
            laiko.
          </p>

          <label class="mt-5 block">
            <span class="text-sm font-semibold text-ink">
              Kiek žmonių valgo: {household.value}
            </span>
            <input
              type="range"
              min={1}
              max={8}
              value={household.value}
              onInput={(e) => household.value = Number(e.currentTarget.value)}
              class="mt-2 w-full accent-[var(--color-brand)]"
            />
          </label>

          <label class="mt-5 block">
            <span class="text-sm font-semibold text-ink">
              Kiek minučių darbo dieną gali skirti gaminimui:{" "}
              {minutesPerDay.value}
            </span>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={minutesPerDay.value}
              onInput={(e) =>
                minutesPerDay.value = Number(e.currentTarget.value)}
              class="mt-2 w-full accent-[var(--color-brand)]"
            />
            <span class="mt-1 block text-xs text-ink-soft">
              Savaitgalį automatiškai leidžiam dvigubai daugiau.
            </span>
          </label>

          <fieldset class="mt-5">
            <legend class="text-sm font-semibold text-ink">
              Kuriuos valgymus planuojam?
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
              {MEAL_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  class={`rounded-full border px-4 py-2 text-sm capitalize transition-colors ${
                    slots.value.includes(slot)
                      ? "border-brand bg-brand-soft font-semibold text-brand-strong"
                      : "border-line text-ink-soft hover:border-brand"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      )}

      {step.value === 2 && (
        <section>
          <h2 class="font-display text-2xl font-bold text-ink">
            Ko nevalgote?
          </h2>
          <p class="mt-1 text-sm text-ink-soft">
            Išvardink kableliais. Gali palikti tuščią – tada nieko neišbrauksim.
          </p>
          <input
            type="text"
            value={dislikes.value}
            onInput={(e) => dislikes.value = e.currentTarget.value}
            placeholder="grybai, žuvis, aitriosios paprikos"
            class="mt-4 w-full rounded-card border border-line bg-surface-raised px-4 py-3 text-ink placeholder:text-ink-soft"
          />

          <div class="mt-6 rounded-card bg-brand-soft p-4 text-sm text-brand-strong">
            <strong>Ką gausi po šito mygtuko:</strong>
            <ul class="mt-2 list-inside list-disc space-y-1">
              <li>7 dienų planą kategorijai „{selected?.name}“</li>
              <li>
                {plural(slots.value.length * 7, WORDS.patiekalasGal)}{" "}
                su receptais
              </li>
              <li>
                pirkinių sąrašą {household.value}{" "}
                {pluralWord(household.value, WORDS.zmoguiNaud)}
              </li>
            </ul>
          </div>
        </section>
      )}

      {error.value && (
        <p class="mt-4 rounded-card border border-brand bg-brand-soft p-3 text-sm text-brand-strong">
          {error.value}
        </p>
      )}

      <div class="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => step.value = Math.max(0, step.value - 1)}
          disabled={step.value === 0 || loading.value}
        >
          Atgal
        </Button>

        {step.value < TOTAL - 1
          ? (
            <Button
              onClick={() => step.value = step.value + 1}
              disabled={!categoryId.value}
            >
              Toliau
            </Button>
          )
          : (
            <Button onClick={submit} disabled={loading.value}>
              {loading.value ? "Ruošiam planą…" : "Sudaryti mano planą"}
            </Button>
          )}
      </div>
    </div>
  );
}
