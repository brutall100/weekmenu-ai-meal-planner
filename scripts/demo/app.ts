/**
 * GITHUB PAGES DEMO – naršyklės programa.
 *
 * GitHub Pages nepaleidžia serverio (Deno, KV, Claude), todėl demo:
 *  - patiekalus ima iš docs/data/patiekalai.json (tie patys kaip sėkloje);
 *  - planą dėlioja TA PAČIA logika kaip serveris (backend/services/arrange.ts);
 *  - pirkinių sąrašą skaičiuoja TA PAČIA funkcija (backend/services/shopping.ts);
 *  - viską laiko localStorage – tik šioje naršyklėje.
 *
 * Surenkamas komanda `deno task demo` į docs/js/demo.js.
 */
import { arrangeWeek, pickSwap } from "../../backend/services/arrange.ts";
import { buildShoppingList } from "../../backend/services/shopping.ts";
import { plural, pluralWord, WORDS } from "@shared/plural.ts";
import { formatQuantity } from "@shared/units.ts";
import { MEAL_SLOTS, WEEKDAYS } from "@shared/types.ts";
import type {
  Category,
  Meal,
  MealSlot,
  PlanEntry,
  Profile,
  WeekPlan,
} from "@shared/types.ts";

interface Data {
  categories: Category[];
  meals: Meal[];
}

interface Saved {
  profile: Profile;
  entries: PlanEntry[];
}

const STORAGE_KEY = "weekmenu-demo";

// ---------- Pagalbininkai ----------

const $ = <T extends Element = HTMLElement>(sel: string) =>
  document.querySelector<T>(sel);

/** Tekstą visada įdedam per textContent/escape – jokio HTML iš duomenų. */
function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Saved : null;
  } catch {
    return null;
  }
}

function save(state: Saved | null): void {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Privatus langas – demo veiks, tik neįsimins po perkrovimo.
  }
}

function toast(text: string): void {
  const el = $("#pranesimas");
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(Number(el.dataset.timer));
  el.dataset.timer = String(setTimeout(() => el.hidden = true, 3200));
}

const todayIndex = (new Date().getDay() + 6) % 7;

// ---------- Savaitės lėkštė (tas pats piešinys kaip programoje) ----------

function renderPlate(): void {
  const host = $("#lekste");
  if (!host) return;
  const fills = [
    "brand",
    "butter",
    "fresh",
    "brand-soft",
    "plate",
    "butter",
    "brand",
  ];
  const r = 78;
  const pt = (a: number, rad: number) =>
    `${(100 + Math.cos(a) * rad).toFixed(2)} ${
      (100 + Math.sin(a) * rad).toFixed(2)
    }`;
  let slices = "";
  WEEKDAYS.forEach((day, i) => {
    const a0 = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / 7) * Math.PI * 2 - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const [lx, ly] = pt(am, 54).split(" ");
    slices +=
      `<path d="M100 100 L${pt(a0, r)} A${r} ${r} 0 0 1 ${
        pt(a1, r)
      } Z" class="uzpildas-${fills[i]} brukst-pavirsius" stroke-width="3"/>` +
      `<circle cx="${lx}" cy="${ly}" r="10" class="uzpildas-pavirsius"/>` +
      `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" class="lekste-diena">${
        day.slice(0, 2)
      }</text>`;
  });
  host.innerHTML = `<svg viewBox="0 0 200 200" role="img"
    aria-label="Savaitės lėkštė: septynios dienos nuo pirmadienio iki sekmadienio">
    <circle cx="100" cy="100" r="98" class="uzpildas-plate"/>
    <circle cx="100" cy="100" r="90" class="uzpildas-pavirsius"/>
    <g class="lekste-sukasi">${slices}</g>
    <circle cx="100" cy="100" r="22" class="uzpildas-pavirsius"/>
    <text x="100" y="100" text-anchor="middle" dominant-baseline="central" class="lekste-centras">7</text>
  </svg>`;
}

// ---------- Anketa ----------

function renderForm(data: Data, saved: Saved | null): void {
  const list = $("#kategorijos");
  if (!list) return;
  const chosen = saved?.profile.categoryId ?? data.categories[0]?.id;
  list.innerHTML = data.categories.map((c) => {
    const count = data.meals.filter((m) => m.categoryIds.includes(c.id))
      .length;
    return `<label class="pasirinkimas">
      <input type="radio" name="kategorija" value="${esc(c.id)}" ${
      c.id === chosen ? "checked" : ""
    } />
      <span class="pasirinkimas-kortele">
        <span class="pasirinkimas-emoji" aria-hidden="true">${
      esc(c.emoji)
    }</span>
        <span><strong>${esc(c.name)}</strong>
        <small>${esc(c.summary)}</small>
        <small class="pasirinkimas-kiek">${
      plural(count, WORDS.patiekalas)
    } demo kataloge</small></span>
      </span>
    </label>`;
  }).join("");

  const slotsBox = $("#valgymai");
  if (slotsBox) {
    const on = saved?.profile.slots ?? ["pietūs", "vakarienė"];
    slotsBox.innerHTML = MEAL_SLOTS.map((s) =>
      `<label class="zyma"><input type="checkbox" name="valgymas" value="${s}" ${
        on.includes(s) ? "checked" : ""
      }/> <span>${s}</span></label>`
    ).join("");
  }

  const household = $<HTMLInputElement>("#zmones");
  const minutes = $<HTMLInputElement>("#minutes");
  if (saved && household && minutes) {
    household.value = String(saved.profile.household);
    minutes.value = String(saved.profile.minutesPerDay);
  }
  const syncLabels = () => {
    const h = Number(household?.value ?? 2);
    const out = $("#zmones-rodo");
    if (out) out.textContent = `${h}`;
    const m = $("#minutes-rodo");
    if (m) m.textContent = `${minutes?.value ?? 30} min`;
  };
  household?.addEventListener("input", syncLabels);
  minutes?.addEventListener("input", syncLabels);
  syncLabels();
}

function readProfile(form: HTMLFormElement): Profile {
  const fd = new FormData(form);
  const slots = fd.getAll("valgymas").map(String) as MealSlot[];
  return {
    name: "",
    categoryId: String(fd.get("kategorija") ?? ""),
    household: Number(fd.get("zmones") ?? 2),
    minutesPerDay: Number(fd.get("minutes") ?? 30),
    slots: slots.length ? slots : ["vakarienė"],
    dislikes: String(fd.get("nevalgom") ?? "").split(",").map((d) => d.trim())
      .filter(Boolean),
  };
}

// ---------- Planas ----------

function mealsFor(data: Data, profile: Profile): Meal[] {
  return data.meals.filter((m) => m.categoryIds.includes(profile.categoryId));
}

function renderPlan(data: Data, state: Saved | null): void {
  const box = $("#plano-dienos");
  const summary = $("#plano-santrauka");
  const bar = $("#plano-juosta");
  const barFill = $("#plano-juosta-uzpildas");
  if (!box || !summary || !bar || !barFill) return;

  if (!state || state.entries.length === 0) {
    summary.textContent = "Planas dar nesudarytas";
    bar.setAttribute("aria-valuenow", "0");
    barFill.style.width = "0%";
    box.innerHTML = `<div class="tuscia">
      <div class="tuscia-emoji" aria-hidden="true">📋</div>
      <h3>Plano dar nėra</h3>
      <p>Užpildyk anketą aukščiau – ir čia atsiras visos savaitės meniu.</p>
      <a class="mygtukas mygtukas-pagrindinis" href="#anketa"><span class="ikona" aria-hidden="true">🍽️</span> Į anketą</a>
    </div>`;
    return;
  }

  const byId = new Map(data.meals.map((m) => [m.id, m]));
  const total = state.entries.length;
  const done = state.entries.filter((e) => e.done).length;
  const left = total - done;
  const percent = Math.round((done / total) * 100);
  summary.textContent = left === 0
    ? "Visi savaitės patiekalai pagaminti 🎉"
    : `Liko ${left} iš ${plural(total, WORDS.patiekalasKilm)}`;
  bar.setAttribute("aria-valuenow", String(percent));
  barFill.style.width = `${percent}%`;

  const category = data.categories.find((c) =>
    c.id === state.profile.categoryId
  );
  const title = $("#plano-kategorija");
  if (title && category) {
    const available = mealsFor(data, state.profile).length;
    // Sąžiningai pasakom, kodėl patiekalai kartojasi – kad neatrodytų kaip klaida.
    const note = available < 7
      ? ` · demo kataloge šiai grupei tik ${
        plural(available, WORDS.patiekalas)
      }, todėl jie kartojasi. Tikroje versijoje trūkstamus sukuria Claude.`
      : "";
    title.textContent =
      `${category.emoji} ${category.name} · ${state.profile.household} ${
        pluralWord(state.profile.household, WORDS.zmoguiNaud)
      }${note}`;
  }

  box.innerHTML = WEEKDAYS.map((dayName, day) => {
    const items = state.entries.filter((e) => e.day === day);
    if (items.length === 0) return "";
    const allDone = items.every((i) => i.done);
    const isToday = day === todayIndex;
    return `<details class="diena ${
      isToday ? "diena-siandien" : ""
    }" data-diena="${day}" ${isToday ? "open" : ""} data-atsiranda>
      <summary><span class="diena-vardas">${dayName}</span>
        ${isToday ? '<span class="zenkliukas">šiandien</span>' : ""}
        ${
      allDone ? '<span class="diena-atlikta" aria-label="atlikta">✓</span>' : ""
    }
      </summary>
      <div class="diena-turinys">${
      items.map((entry) => {
        const meal = byId.get(entry.mealId);
        if (!meal) return "";
        return `<article class="valgis ${entry.done ? "valgis-atliktas" : ""}">
          <span class="valgis-laikas">${entry.slot}</span>
          <h4>${esc(meal.name)}</h4>
          <p class="valgis-info">⏱ ${meal.minutes} min · ${meal.nutrition.kcal} kcal</p>
          <details class="receptas">
            <summary>Receptas</summary>
            <ul>${
          meal.ingredients.map((i) =>
            `<li>${esc(i.name)} — ${
              formatQuantity(
                Math.round(i.amount * state.profile.household * 10) / 10,
                i.unit,
              )
            }</li>`
          ).join("")
        }</ul>
            <ol>${meal.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          </details>
          <div class="valgis-veiksmai">
            <button type="button" class="mygtukas ${
          entry.done ? "mygtukas-pavyko" : "mygtukas-pagrindinis"
        }" data-veiksmas="pagaminau" data-diena="${day}" data-valgymas="${entry.slot}">
              ${entry.done ? "✓ Pagaminta" : "Pagaminau"}
            </button>
            <button type="button" class="mygtukas mygtukas-antrinis" data-veiksmas="keisti" data-diena="${day}" data-valgymas="${entry.slot}">
              <span class="ikona" aria-hidden="true">🔄</span> Kitas patiekalas
            </button>
          </div>
        </article>`;
      }).join("")
    }</div>
    </details>`;
  }).join("");

  // Naujai sukurti elementai – rodom iš karto (stebėtojas jų nemato).
  box.querySelectorAll("[data-atsiranda]").forEach((el) =>
    el.classList.add("matomas")
  );
}

// ---------- Pirkiniai ----------

function renderShopping(data: Data, state: Saved | null): void {
  const box = $("#pirkiniu-sarasas");
  const info = $("#pirkiniu-info");
  if (!box || !info) return;
  if (!state) {
    info.textContent = "Sąrašas atsiras kartu su planu.";
    box.innerHTML = "";
    return;
  }
  const plan: WeekPlan = {
    id: "demo",
    userId: "demo",
    categoryId: state.profile.categoryId,
    weekStart: "",
    entries: state.entries,
    createdAt: "",
  };
  const meals = new Map(data.meals.map((m) => [m.id, m]));
  const sections = buildShoppingList(plan, meals, state.profile.household, {
    onlyUndone: true,
  });
  const lines = sections.reduce((n, s) => n + s.lines.length, 0);
  info.textContent = lines === 0
    ? "Visi patiekalai pagaminti – pirkti nieko nereikia 🎉"
    : `${plural(lines, WORDS.preke)} · ${state.profile.household} ${
      pluralWord(state.profile.household, WORDS.zmoguiNaud)
    } · tik dar nepagamintiems patiekalams`;

  let checked: Record<string, 1> = {};
  try {
    checked = JSON.parse(
      localStorage.getItem(`${STORAGE_KEY}-pirkiniai`) ??
        "{}",
    );
  } catch { /* nieko */ }

  box.innerHTML = sections.map((section) =>
    `<section class="kortele kyla" data-atsiranda>
      <h3 class="skyrius">${esc(section.aisle)}</h3>
      <ul>${
      section.lines.map((line) => {
        const key = `${line.name}|${line.unit}`;
        return `<li><label class="pirkinys">
          <input type="checkbox" data-pirkinys="${esc(key)}" ${
          checked[key] ? "checked" : ""
        }/>
          <span>${esc(line.name)} <span class="blankus">— ${
          formatQuantity(line.amount, line.unit)
        }</span></span>
        </label></li>`;
      }).join("")
    }</ul>
    </section>`
  ).join("");
  box.querySelectorAll("[data-atsiranda]").forEach((el) =>
    el.classList.add("matomas")
  );
}

// ---------- Paleidimas ----------

async function main(): Promise<void> {
  renderPlate();
  let data: Data;
  try {
    const res = await fetch("data/patiekalai.json");
    data = await res.json();
  } catch {
    const box = $("#plano-dienos");
    if (box) box.textContent = "Nepavyko užkrauti patiekalų. Perkrauk puslapį.";
    return;
  }

  let state = load();
  // Jei demo duomenys pasikeitė ir išsaugoti patiekalai nebeegzistuoja – iš naujo.
  const ids = new Set(data.meals.map((m) => m.id));
  if (state && state.entries.some((e) => !ids.has(e.mealId))) state = null;

  const stat = document.querySelector<HTMLElement>("[data-patiekalu-skaicius]");
  if (stat) {
    stat.dataset.skaicius = String(data.meals.length);
    stat.textContent = String(data.meals.length);
    const label = stat.closest("div")?.querySelector("dt");
    if (label) {
      label.textContent = `${
        pluralWord(data.meals.length, WORDS.patiekalas)
      } demo kataloge`;
    }
  }

  renderForm(data, state);
  renderPlan(data, state);
  renderShopping(data, state);

  const form = $<HTMLFormElement>("#anketa-forma");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = readProfile(form);
    const entries = arrangeWeek(mealsFor(data, profile), profile);
    if (entries.length === 0) {
      toast("Šiai grupei tinkamų patiekalų demo kataloge nėra.");
      return;
    }
    state = { profile, entries };
    save(state);
    renderPlan(data, state);
    renderShopping(data, state);
    toast(`Meniu paruoštas: ${plural(entries.length, WORDS.patiekalas)}.`);
    $("#planas")?.scrollIntoView({ behavior: "smooth" });
  });

  $("#plano-dienos")?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(
      "button[data-veiksmas]",
    );
    if (!btn || !state) return;
    const day = Number(btn.dataset.diena);
    const slot = btn.dataset.valgymas as MealSlot;
    const current = state;

    if (btn.dataset.veiksmas === "pagaminau") {
      current.entries = current.entries.map((en) =>
        en.day === day && en.slot === slot ? { ...en, done: !en.done } : en
      );
      const entry = current.entries.find((en) =>
        en.day === day && en.slot === slot
      );
      const left = current.entries.filter((en) => !en.done).length;
      if (entry?.done) {
        toast(
          left === 0
            ? "Visi savaitės patiekalai pagaminti! 🎉"
            : `Puiku. Liko ${plural(left, WORDS.patiekalas)}.`,
        );
      }
    } else {
      const pick = pickSwap(
        current.entries,
        day,
        slot,
        mealsFor(data, current.profile),
      );
      if (!pick) {
        toast("Šiam valgymui kitų patiekalų demo kataloge nėra.");
        return;
      }
      current.entries = current.entries.map((en) =>
        en.day === day && en.slot === slot
          ? { ...en, mealId: pick.id, done: false }
          : en
      );
    }
    save(current);
    // Išlaikom tą pačią dieną atidarytą po perpiešimo.
    renderPlan(data, current);
    const opened = document.querySelector<HTMLDetailsElement>(
      `#plano-dienos details[data-diena="${day}"]`,
    );
    if (opened) opened.open = true;
    renderShopping(data, current);
  });

  $("#pirkiniu-sarasas")?.addEventListener("change", (e) => {
    const box = e.target as HTMLInputElement;
    const key = box.dataset.pirkinys;
    if (!key) return;
    try {
      const all = JSON.parse(
        localStorage.getItem(`${STORAGE_KEY}-pirkiniai`) ?? "{}",
      );
      if (box.checked) all[key] = 1;
      else delete all[key];
      localStorage.setItem(`${STORAGE_KEY}-pirkiniai`, JSON.stringify(all));
    } catch { /* saugykla neprieinama */ }
  });

  $("#isvalyti")?.addEventListener("click", () => {
    save(null);
    try {
      localStorage.removeItem(`${STORAGE_KEY}-pirkiniai`);
    } catch { /* nieko */ }
    state = null;
    renderPlan(data, null);
    renderShopping(data, null);
    toast("Demo duomenys ištrinti iš šios naršyklės.");
  });
}

main();
