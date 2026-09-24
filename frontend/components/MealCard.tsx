import type { Meal } from "@shared/types.ts";
import { Chip } from "./ui.tsx";

const DIFFICULTY_LABEL = {
  1: "Lengva",
  2: "Vidutiniška",
  3: "Reikia patirties",
} as const;

export function MealCard(
  { meal, compact = false }: { meal: Meal; compact?: boolean },
) {
  return (
    <a
      href={`/patiekalai/${meal.id}`}
      data-atsiranda
      class="kyla group block rounded-card border border-line bg-surface-raised p-4 hover:border-brand"
    >
      <h3 class="font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand-strong">
        {meal.name}
      </h3>
      {!compact && (
        <p class="mt-1 line-clamp-2 text-sm text-ink-soft">
          {meal.description}
        </p>
      )}
      <div class="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="brand">⏱ {meal.minutes} min</Chip>
        <Chip>{DIFFICULTY_LABEL[meal.difficulty]}</Chip>
        <Chip tone="fresh">{meal.nutrition.kcal} kcal</Chip>
        {meal.source === "ai" ? <Chip>✨ AI</Chip> : null}
      </div>
    </a>
  );
}
