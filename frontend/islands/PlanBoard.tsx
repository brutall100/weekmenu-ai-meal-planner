import { useSignal } from "@preact/signals";
import { WEEKDAYS } from "@shared/types.ts";
import type { Meal, MealSlot, PlanEntry } from "@shared/types.ts";
import { plural, WORDS } from "@shared/plural.ts";

interface Props {
  entries: PlanEntry[];
  /** Patiekalai pagal id – siunčiam iš serverio, kad nereiktų kviesti API. */
  meals: Record<string, Meal>;
  /** 0–6; šiandienos diena paryškinama. */
  todayIndex: number;
}

interface Toast {
  emoji: string;
  text: string;
}

/**
 * SAVAITĖS LENTA – pagrindinis ekranas.
 *
 * Psichologija, įdėta į šį komponentą:
 *  - šiandienos diena paryškinta ir atidaryta pirma (mažiau paieškos);
 *  - „Pagaminau“ yra vienas paspaudimas, o atsakymas grįžta iškart;
 *  - serijos skaičius pasikeičia tavo akyse – atlygis matomas;
 *  - „Kitas patiekalas“ grąžina kontrolę, kad planas jaustųsi savas;
 *  - praėjusios dienos nerodomos raudonai. Jokio gėdinimo.
 */
export default function PlanBoard(
  { entries: initial, meals, todayIndex }: Props,
) {
  const entries = useSignal<PlanEntry[]>(initial);
  const mealMap = useSignal<Record<string, Meal>>(meals);
  const openDay = useSignal(todayIndex);
  const streak = useSignal<number | null>(null);
  const busy = useSignal<string | null>(null);
  const toast = useSignal<Toast | null>(null);
  const error = useSignal<string | null>(null);

  const total = entries.value.length;
  const done = entries.value.filter((e) => e.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  function keyOf(day: number, slot: MealSlot) {
    return `${day}-${slot}`;
  }

  function showToast(t: Toast) {
    toast.value = t;
    setTimeout(() => toast.value = null, 3500);
  }

  async function toggle(entry: PlanEntry) {
    const key = keyOf(entry.day, entry.slot);
    busy.value = key;
    error.value = null;
    try {
      const res = await fetch("/api/planas/atzymeti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          day: entry.day,
          slot: entry.slot,
          done: !entry.done,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      entries.value = entries.value.map((e) =>
        e.day === entry.day && e.slot === entry.slot
          ? { ...e, done: data.done }
          : e
      );
      streak.value = data.streak;

      if (data.newBadges?.length) {
        const badge = data.newBadges[0];
        showToast({
          emoji: badge.emoji,
          text: `Naujas ženkliukas: ${badge.name}`,
        });
      } else if (data.done) {
        const left = data.progress.remaining;
        showToast({
          emoji: "✅",
          text: left === 0
            ? "Visi savaitės patiekalai pagaminti!"
            : `Puiku. Liko ${plural(left, WORDS.patiekalas)}.`,
        });
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Nepavyko išsaugoti.";
    } finally {
      busy.value = null;
    }
  }

  async function swap(entry: PlanEntry) {
    const key = keyOf(entry.day, entry.slot);
    busy.value = key;
    error.value = null;
    try {
      const res = await fetch("/api/planas/keisti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ day: entry.day, slot: entry.slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      mealMap.value = { ...mealMap.value, [data.meal.id]: data.meal };
      entries.value = entries.value.map((e) =>
        e.day === entry.day && e.slot === entry.slot
          ? { ...e, mealId: data.meal.id, done: false }
          : e
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Nepavyko pakeisti.";
    } finally {
      busy.value = null;
    }
  }

  const days = Array.from({ length: 7 }, (_, day) => ({
    day,
    items: entries.value.filter((e) => e.day === day),
  })).filter((d) => d.items.length > 0);

  return (
    <div>
      {/* Progresas visada viršuje – tai pagrindinis „kiek liko“ signalas. */}
      <div class="-mx-4 mb-6 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur md:sticky md:top-[61px] md:z-10">
        <div class="flex items-baseline justify-between text-sm">
          <span class="font-semibold text-ink">
            {total - done === 0
              ? "Visi savaitės patiekalai pagaminti 🎉"
              : `Liko ${total - done} iš ${
                plural(total, WORDS.patiekalasKilm)
              }`}
          </span>
          <span class="flex items-center gap-3 text-ink-soft">
            {streak.value !== null && streak.value > 0 && (
              <span class="font-semibold text-brand-strong">
                🔥 {streak.value}
              </span>
            )}
            {percent}%
          </span>
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            class="h-full rounded-full bg-fresh transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {error.value && (
        <p class="mb-4 rounded-card border border-brand bg-brand-soft p-3 text-sm text-brand-strong">
          {error.value}
        </p>
      )}

      <div class="space-y-3">
        {days.map(({ day, items }) => {
          const isToday = day === todayIndex;
          const isOpen = openDay.value === day;
          const dayDone = items.every((i) => i.done);

          return (
            <section
              key={day}
              class={`overflow-hidden rounded-card border ${
                isToday ? "border-brand" : "border-line"
              } bg-surface-raised`}
            >
              <button
                type="button"
                onClick={() => openDay.value = isOpen ? -1 : day}
                class="flex w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span class="font-display text-lg font-bold text-ink">
                  {WEEKDAYS[day]}
                </span>
                {isToday && (
                  <span class="rounded-full bg-action px-2 py-0.5 text-xs font-semibold text-on-action">
                    šiandien
                  </span>
                )}
                {dayDone && <span class="text-fresh">✓</span>}
                <span class="ml-auto text-ink-soft">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div class="space-y-3 border-t border-line px-4 py-4">
                  {items.map((entry) => {
                    const meal = mealMap.value[entry.mealId];
                    const key = keyOf(entry.day, entry.slot);
                    const isBusy = busy.value === key;

                    return (
                      <div
                        key={key}
                        class={`rounded-card border p-3 transition-colors ${
                          entry.done
                            ? "border-fresh bg-fresh-soft"
                            : "border-line"
                        }`}
                      >
                        <span class="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                          {entry.slot}
                        </span>
                        {meal
                          ? (
                            <>
                              <a
                                href={`/patiekalai/${meal.id}`}
                                class="mt-0.5 block font-display text-lg font-semibold text-ink hover:text-brand-strong"
                              >
                                {meal.name}
                              </a>
                              <p class="mt-0.5 text-sm text-ink-soft">
                                ⏱ {meal.minutes} min · {meal.nutrition.kcal}
                                {" "}
                                kcal
                              </p>
                            </>
                          )
                          : (
                            <p class="text-sm text-ink-soft">
                              Patiekalas nerastas
                            </p>
                          )}

                        <div class="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggle(entry)}
                            disabled={isBusy}
                            class={`mygtukas rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                              entry.done
                                ? "bg-fresh text-on-fresh"
                                : "bg-action text-on-action"
                            }`}
                          >
                            {entry.done ? "✓ Pagaminta" : "Pagaminau"}
                          </button>
                          <button
                            type="button"
                            onClick={() => swap(entry)}
                            disabled={isBusy}
                            class="mygtukas rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-brand hover:text-ink disabled:opacity-50"
                          >
                            Kitas patiekalas
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {toast.value && (
        <div
          role="status"
          class="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-card border border-line bg-surface-raised px-4 py-3 text-center shadow-lg"
        >
          <span class="text-xl">{toast.value.emoji}</span>
          <span class="ml-2 font-semibold text-ink">{toast.value.text}</span>
        </div>
      )}
    </div>
  );
}
