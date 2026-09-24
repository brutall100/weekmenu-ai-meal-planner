/**
 * Surenka GitHub Pages demo į `docs/`.
 *
 *   deno task demo
 *
 * Ką daro:
 *  1. Iš sėklos (tų pačių patiekalų, kaip serveryje) įrašo docs/data/patiekalai.json.
 *  2. Suriša scripts/demo/app.ts į vieną docs/js/demo.js naršyklei.
 *  3. Nukopijuoja bendrus failus (efektai, tema, fonas, favicon), kad
 *     demo ir tikra programa atrodytų ir elgtųsi vienodai.
 *
 * docs/index.html ir docs/css/stilius.css rašomi ranka – jų nekeičiam.
 */
import { SEED_MEALS } from "../backend/db/seed.ts";
import { SEED_CATEGORIES } from "../shared/categories.ts";
import type { Category, Meal } from "../shared/types.ts";

const DOCS = new URL("../docs/", import.meta.url);
const ROOT = new URL("../", import.meta.url);

// 1. Duomenys. Demo'je kategorijos ID = slug, patiekalo ID = eilės numeris.
const categories: Category[] = SEED_CATEGORIES.map((c) => ({
  ...c,
  id: c.slug,
}));
const meals: Meal[] = SEED_MEALS.map(({ categories: slugs, ...rest }, i) => ({
  ...rest,
  id: `m${i + 1}`,
  categoryIds: slugs,
  createdAt: "2026-09-01T00:00:00.000Z",
}));
await Deno.mkdir(new URL("data/", DOCS), { recursive: true });
await Deno.writeTextFile(
  new URL("data/patiekalai.json", DOCS),
  JSON.stringify({ categories, meals }),
);

// 2. Programa naršyklei
await Deno.mkdir(new URL("js/", DOCS), { recursive: true });
const bundle = await new Deno.Command(Deno.execPath(), {
  args: [
    "bundle",
    "--platform=browser",
    "--minify",
    "-o",
    new URL("js/demo.js", DOCS).pathname,
    new URL("scripts/demo/app.ts", ROOT).pathname,
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!bundle.success) Deno.exit(1);

// 3. Bendri failai
const COPY: [string, string][] = [
  ["frontend/assets/efektai.css", "css/efektai.css"],
  ["frontend/static/tema.js", "js/tema.js"],
  ["frontend/static/fonas.js", "js/fonas.js"],
  ["frontend/static/efektai.js", "js/efektai.js"],
  ["frontend/static/favicon.svg", "favicon.svg"],
];
await Deno.mkdir(new URL("css/", DOCS), { recursive: true });
for (const [from, to] of COPY) {
  await Deno.copyFile(new URL(from, ROOT), new URL(to, DOCS));
}
// Be šito GitHub Pages bandytų docs/ perdaryti su Jekyll.
await Deno.writeTextFile(new URL(".nojekyll", DOCS), "");

console.log(
  `Demo paruoštas: ${categories.length} kategorijų, ${meals.length} patiekalų → docs/`,
);
