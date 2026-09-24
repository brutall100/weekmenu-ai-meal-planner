/**
 * Pasėja pradinius duomenis į Deno KV.
 * Paleidimas:  deno task seed
 */
import { seed } from "@backend/db/seed.ts";
import { closeKv } from "@backend/db/kv.ts";

const force = Deno.args.includes("--force");
const result = await seed({ force });

console.log("Sėkla baigta:");
console.log(`  kategorijos: +${result.categories}`);
console.log(`  patiekalai:  +${result.meals}`);
if (result.categories + result.meals === 0) {
  console.log(
    "  (viskas jau buvo vietoje – paleisk su --force, jei nori perrašyti)",
  );
}

await closeKv();
