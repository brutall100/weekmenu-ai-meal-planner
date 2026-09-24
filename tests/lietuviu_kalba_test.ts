import { assertEquals } from "@std/assert";
import { plural, WORDS } from "@shared/plural.ts";
import { formatQuantity, normalizeUnit } from "@shared/units.ts";

Deno.test("skaičius derinamas su žodžiu", () => {
  const p = (n: number) => plural(n, WORDS.patiekalas);
  assertEquals(p(1), "1 patiekalas");
  assertEquals(p(3), "3 patiekalai");
  assertEquals(p(10), "10 patiekalų");
  assertEquals(p(12), "12 patiekalų");
  assertEquals(p(21), "21 patiekalas");
  assertEquals(p(111), "111 patiekalų");
  // Po „iš“ – kilmininkas
  assertEquals(plural(7, WORDS.patiekalasKilm), "7 patiekalų");
  assertEquals(plural(21, WORDS.patiekalasKilm), "21 patiekalo");
});

Deno.test("vienodi vienetai suvienodinami, kad susidėtų", () => {
  assertEquals(normalizeUnit("šaukštai"), "šaukštas");
  assertEquals(normalizeUnit(" Šaukštas "), "šaukštas");
  assertEquals(normalizeUnit("g"), "g");
});

Deno.test("kiekis rašomas taip, kaip pasakytų žmogus", () => {
  assertEquals(formatQuantity(3900, "g"), "3,9 kg");
  assertEquals(formatQuantity(250, "g"), "250 g");
  assertEquals(formatQuantity(26, "skiltelė"), "26 skiltelės");
  assertEquals(formatQuantity(1, "šaukštai"), "1 šaukštas");
  assertEquals(formatQuantity(1.5, "šaukštas"), "1,5 šaukšto");
  assertEquals(formatQuantity(1500, "ml"), "1,5 l");
});
