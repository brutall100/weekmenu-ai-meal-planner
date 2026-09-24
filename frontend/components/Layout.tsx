import type { ComponentChildren } from "preact";
import type { Engagement } from "@shared/types.ts";
import { currentStreak } from "@backend/services/engagement.ts";

const NAV = [
  { href: "/planas", label: "Mano planas" },
  { href: "/kategorijos", label: "Kategorijos" },
  { href: "/patiekalai", label: "Patiekalai" },
  { href: "/pirkiniai", label: "Pirkiniai" },
  { href: "/istorijos", label: "Istorijos" },
];

/** Serijos skaitliukas viršuje – matomas kiekviename puslapyje. */
function StreakChip({ engagement }: { engagement: Engagement }) {
  const streak = currentStreak(engagement);
  if (streak === 0) return null;
  return (
    <span
      class="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong"
      title={`Ilgiausia serija: ${engagement.bestStreak} d.`}
    >
      <span class="streak-flame">🔥</span>
      {streak}
    </span>
  );
}

/** Logotipas – maža lėkštė su pomidoro riekele (tas pats motyvas kaip favicon). */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" class="h-8 w-8 shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="15" class="fill-plate" />
      <circle cx="16" cy="16" r="11.5" class="fill-surface" />
      <circle cx="16" cy="16" r="8" class="fill-brand" />
      <circle cx="16" cy="16" r="5.6" class="fill-brand-soft" />
    </svg>
  );
}

export function Layout(
  { children, engagement, active }: {
    children: ComponentChildren;
    engagement: Engagement;
    active?: string;
  },
) {
  const linkClass = (href: string) =>
    `shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
      active === href
        ? "bg-brand-soft font-semibold text-brand-strong"
        : "text-ink-soft hover:text-ink"
    }`;

  return (
    <div class="flex min-h-screen flex-col">
      <a href="#turinys" class="praleisti">Pereiti prie turinio</a>

      <header class="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-md">
        <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <a
            href="/"
            class="flex shrink-0 items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink"
          >
            <LogoMark />
            <span>
              Week<span class="text-brand-strong">Menu</span>
            </span>
          </a>
          <nav
            class="ml-auto hidden items-center gap-1 md:flex"
            aria-label="Pagrindinė navigacija"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                class={linkClass(item.href)}
                aria-current={active === item.href ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div class="ml-auto flex items-center gap-2 md:ml-0">
            <StreakChip engagement={engagement} />
            <button
              type="button"
              data-temos-mygtukas
              class="mygtukas temos-mygtukas inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-raised text-ink"
              aria-label="Perjungti temą"
            >
              <span class="menulis" aria-hidden="true">☾</span>
              <span class="saule" aria-hidden="true">☀</span>
            </button>
          </div>
        </div>
        {/* Mažame ekrane navigacija atskiroje juostoje, kad tilptų. */}
        <nav
          class="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden"
          aria-label="Pagrindinė navigacija"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              class={linkClass(item.href)}
              aria-current={active === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main
        id="turinys"
        tabIndex={-1}
        class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none"
      >
        {children}
      </main>

      <footer class="border-t border-line bg-surface/85 backdrop-blur-md">
        <div class="mx-auto max-w-5xl px-4 py-6 text-sm text-ink-soft">
          <p>
            WeekMenu · mokyklinis projektas, statomas kaip tikras produktas.
          </p>
          <p class="mt-1">
            Patiekalus generuoja Claude. Tai nėra medicininė konsultacija –
            sergant pasitark su gydytoju ar dietologu.
          </p>
        </div>
      </footer>
    </div>
  );
}
