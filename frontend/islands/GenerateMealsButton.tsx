import { useSignal } from "@preact/signals";
import { Button } from "../components/ui.tsx";
import { plural, WORDS } from "@shared/plural.ts";

/**
 * „Sugeneruok daugiau“ mygtukas.
 *
 * Laukimas paaiškinamas žodžiais, o ne tik sukučiu: kai žmogus žino,
 * kad Claude dabar galvoja receptus, 10 sekundžių atrodo įdomiai,
 * o ne kaip sugedusi svetainė.
 */
export default function GenerateMealsButton(
  { categoryId, enabled }: { categoryId: string; enabled: boolean },
) {
  const loading = useSignal(false);
  const message = useSignal<string | null>(null);
  const isError = useSignal(false);

  if (!enabled) {
    return (
      <p class="text-sm text-ink-soft">
        AI generavimas išjungtas – serveryje nėra{" "}
        <code>ANTHROPIC_API_KEY</code>.
      </p>
    );
  }

  async function generate() {
    loading.value = true;
    message.value = null;
    isError.value = false;
    try {
      const res = await fetch("/api/patiekalai/generuoti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ categoryId, count: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      message.value = `Sugeneruota: ${
        plural(data.meals.length, WORDS.patiekalas)
      }. Atnaujinam puslapį…`;
      setTimeout(() => globalThis.location.reload(), 900);
    } catch (e) {
      isError.value = true;
      message.value = e instanceof Error ? e.message : "Nepavyko sugeneruoti.";
      loading.value = false;
    }
  }

  return (
    <div>
      <Button onClick={generate} disabled={loading.value}>
        {loading.value ? "Claude galvoja receptus…" : "✨ Sugeneruoti 4 naujus"}
      </Button>
      {message.value && (
        <p
          class={`mt-2 text-sm ${
            isError.value ? "text-brand-strong" : "text-fresh"
          }`}
        >
          {message.value}
        </p>
      )}
    </div>
  );
}
