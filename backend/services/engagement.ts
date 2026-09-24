import { daysBetween, isoDate } from "../lib/dates.ts";
import type { Engagement, WeekPlan } from "@shared/types.ts";
import { plural, WORDS } from "@shared/plural.ts";

/**
 * ĮPROČIO VARIKLIS.
 *
 * Čia surašyta visa elgsenos psichologija, dėl kurios žmogus grįžta.
 * Kiekvienas gabalas turi vardą ir priežastį – žr. .claude/skills/elgsenos-psichologija.
 *
 * ETINĖ RIBA (laikomasi be išimčių):
 *  - jokio melagingo skubėjimo ("liko 2 minutės!");
 *  - jokio gėdinimo ("vėl neparuošei?");
 *  - serijos praradimas niekada nevadinamas nesėkme;
 *  - visos žinutės turi būti TIESA apie tikrus duomenis.
 */

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

/** Ženkliukai. Maži, aiškūs, pasiekiami – kad pirmas ateitų greitai. */
export const BADGES: Badge[] = [
  {
    id: "pirmas-kartas",
    name: "Pirmas kartas",
    emoji: "🥄",
    description: "Pagaminai pirmą patiekalą pagal planą.",
  },
  {
    id: "trys-dienos",
    name: "Trys iš eilės",
    emoji: "🔥",
    description: "Trys dienos be pertraukos.",
  },
  {
    id: "savaite",
    name: "Pilna savaitė",
    emoji: "🏆",
    description: "Septynios dienos iš eilės.",
  },
  {
    id: "menuo",
    name: "Mėnuo virtuvėje",
    emoji: "👑",
    description: "Trisdešimt dienų iš eilės.",
  },
  {
    id: "penkiolika",
    name: "Penkiolika patiekalų",
    emoji: "🍲",
    description: "Iš viso pagaminta 15 patiekalų.",
  },
  {
    id: "penkiasdesimt",
    name: "Penkiasdešimt patiekalų",
    emoji: "🌟",
    description: "Iš viso pagaminta 50 patiekalų.",
  },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Kuriuos ženkliukus žmogus užsitarnavo pagal dabartinius skaičius. */
export function earnedBadges(e: Engagement): string[] {
  const earned: string[] = [];
  if (e.totalCooked >= 1) earned.push("pirmas-kartas");
  if (e.bestStreak >= 3) earned.push("trys-dienos");
  if (e.bestStreak >= 7) earned.push("savaite");
  if (e.bestStreak >= 30) earned.push("menuo");
  if (e.totalCooked >= 15) earned.push("penkiolika");
  if (e.totalCooked >= 50) earned.push("penkiasdesimt");
  return earned;
}

export interface CookResult {
  engagement: Engagement;
  /** Ženkliukai, gauti būtent dabar – juos verta parodyti su animacija. */
  newBadges: Badge[];
  /** Ar serija pailgėjo šiuo veiksmu. */
  streakGrew: boolean;
}

/**
 * Žmogus pažymėjo, kad pagamino. Perskaičiuojam seriją.
 *
 * Serija auga TIK vieną kartą per dieną, kad ir kiek patiekalų pažymėtų –
 * antraip žmogus galėtų "nusipirkti" 7 dienų seriją per vieną vakarą
 * ir skaičius nustotų ką nors reikšti.
 */
export function registerCooked(
  current: Engagement,
  today = isoDate(),
): CookResult {
  const before = new Set(current.badges);
  const next: Engagement = { ...current, badges: [...current.badges] };

  next.totalCooked += 1;

  let streakGrew = false;
  if (next.lastActiveDate === today) {
    // Šiandien jau skaičiavom – serija nesikeičia.
  } else {
    const gap = next.lastActiveDate
      ? daysBetween(next.lastActiveDate, today)
      : null;
    if (gap === 1) {
      next.streak += 1; // vakar gamino – tęsiam
    } else {
      next.streak = 1; // pirmas kartas arba buvo pertrauka – pradedam iš naujo
    }
    next.lastActiveDate = today;
    streakGrew = true;
  }

  if (next.streak > next.bestStreak) next.bestStreak = next.streak;

  next.badges = earnedBadges(next);
  const newBadges = next.badges
    .filter((id) => !before.has(id))
    .map(badgeById)
    .filter((b): b is Badge => Boolean(b));

  return { engagement: next, newBadges, streakGrew };
}

/**
 * Serija nuvysta savaime, jei žmogus negamino.
 * Skaičiuojam tik SKAITANT, o ne rašant – todėl saugoma reikšmė
 * niekada netampa melu, kol žmogus nesilanko.
 */
export function currentStreak(e: Engagement, today = isoDate()): number {
  if (!e.lastActiveDate) return 0;
  const gap = daysBetween(e.lastActiveDate, today);
  // 0 = gamino šiandien, 1 = vakar (serija dar gyva iki dienos pabaigos).
  return gap <= 1 ? e.streak : 0;
}

export interface WeekProgress {
  done: number;
  total: number;
  percent: number;
  /** Kiek liko iki pabaigos – rodom būtent tai, o ne kiek padaryta. */
  remaining: number;
}

/**
 * Savaitės progresas.
 *
 * Rodom "liko 3", o ne "padaryta 11 iš 14": kuo arčiau tikslo,
 * tuo stipriau žmogus stengiasi (tikslo gradiento efektas).
 */
export function weekProgress(plan: WeekPlan | null): WeekProgress {
  const total = plan?.entries.length ?? 0;
  const done = plan?.entries.filter((e) => e.done).length ?? 0;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    remaining: total - done,
  };
}

export type NudgeTone =
  | "sveikinimas"
  | "padrasinimas"
  | "priminimas"
  | "kvietimas";

export interface Nudge {
  tone: NudgeTone;
  title: string;
  body: string;
  /** Mygtuko tekstas. Visada vienas, aiškus veiksmas. */
  cta: string;
  href: string;
}

/**
 * Ką pasakyti žmogui, kai jis atsidaro puslapį.
 *
 * Viena žinutė. Vienas veiksmas. Jokio sąrašo galimybių –
 * kuo daugiau pasirinkimų, tuo didesnė tikimybė, kad nepasirinks nieko.
 */
export function buildNudge(
  opts: { engagement: Engagement; plan: WeekPlan | null; today?: string },
): Nudge {
  const today = opts.today ?? isoDate();
  const streak = currentStreak(opts.engagement, today);
  const progress = weekProgress(opts.plan);

  // 1. Dar nieko neturi – vienintelis tikslas įvesti į vidų.
  if (!opts.plan) {
    return {
      tone: "kvietimas",
      title: "Pradėkim nuo vienos savaitės",
      body:
        "Atsakyk į tris klausimus ir gausi paruoštą savaitės planą su pirkinių sąrašu.",
      cta: "Susikurti planą",
      href: "/pradzia",
    };
  }

  // 2. Savaitė baigta – pripažįstam ir siūlom kitą.
  if (progress.total > 0 && progress.remaining === 0) {
    return {
      tone: "sveikinimas",
      title: "Visi savaitės patiekalai pagaminti 🎉",
      body: `Iš viso jau ${
        plural(opts.engagement.totalCooked, WORDS.patiekalas)
      }. Kitą savaitę galim pabandyti ką nors naujo.`,
      cta: "Naujas planas kitai savaitei",
      href: "/pradzia",
    };
  }

  // 3. Serija gyva ir vakar gamino – primenam, kas pastatyta, be spaudimo.
  if (streak >= 2 && opts.engagement.lastActiveDate !== today) {
    return {
      tone: "priminimas",
      title: `${plural(streak, WORDS.diena)} iš eilės`,
      body:
        "Šiandienos patiekalas jau parinktas – belieka pažymėti, kai pagaminsi.",
      cta: "Žiūrėti šiandienos patiekalą",
      href: "/planas",
    };
  }

  // 4. Serija nutrūko. NIEKADA nekaltinam – tiesiog atidarom duris atgal.
  if (streak === 0 && opts.engagement.totalCooked > 0) {
    return {
      tone: "padrasinimas",
      title: "Sveikas sugrįžęs",
      body: `Anksčiau esi pagaminęs ${
        plural(opts.engagement.totalCooked, WORDS.patiekalasGal)
      }. Pradėti iš naujo užtrunka vieną vakarą.`,
      cta: "Tęsti planą",
      href: "/planas",
    };
  }

  // 5. Įprasta darbo diena – rodom, kiek liko, ne kiek padaryta.
  return {
    tone: "priminimas",
    title: `Liko ${plural(progress.remaining, WORDS.patiekalas)}`,
    // „Beveik“ sakom tik tada, kai tai tiesa – ne ką tik sudarytam planui.
    body: progress.done === 0
      ? "Planas paruoštas. Pradėk nuo šiandienos patiekalo – vieno užtenka."
      : progress.remaining <= 3
      ? "Savaitė beveik baigta. Kiekviena diena, kai ką nors pagamini, ilgina tavo seriją."
      : "Kiekviena diena, kai ką nors pagamini, ilgina tavo seriją.",
    cta: "Atidaryti planą",
    href: "/planas",
  };
}
