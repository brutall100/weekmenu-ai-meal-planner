import type { WeekProgress } from "@backend/services/engagement.ts";
import { plural, WORDS } from "@shared/plural.ts";

/**
 * Savaitės progreso juosta.
 *
 * Rodom „liko N“, o ne „padaryta N“: kuo arčiau tikslo, tuo labiau
 * žmogus stengiasi jį pabaigti. Taip pat rodom pilną juostą net kai
 * nulis – pradėti nuo matomo tuščio rėmo lengviau nei nuo nieko.
 */
export function ProgressBar({ progress }: { progress: WeekProgress }) {
  const label = progress.total === 0
    ? "Planas dar nesudarytas"
    : progress.remaining === 0
    ? "Visi savaitės patiekalai pagaminti 🎉"
    : `Liko ${progress.remaining} iš ${
      plural(progress.total, WORDS.patiekalasKilm)
    }`;

  return (
    <div>
      <div class="flex items-baseline justify-between text-sm">
        <span class="font-semibold text-ink">{label}</span>
        <span class="text-ink-soft">{progress.percent}%</span>
      </div>
      <div
        class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Savaitės progresas"
      >
        <div
          class="h-full rounded-full bg-fresh transition-[width] duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
