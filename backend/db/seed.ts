import { getKv } from "./kv.ts";
import { keys } from "./keys.ts";
import { listCategories, saveCategory } from "./repositories/categories.ts";
import { countMealsByCategory, saveMeals } from "./repositories/meals.ts";
import { newId } from "../lib/id.ts";
import { SEED_CATEGORIES } from "@shared/categories.ts";
import type { Category, Meal } from "@shared/types.ts";

/**
 * Pradinė sėkla.
 *
 * Tikslas: tuščia duomenų bazė niekada nerodoma naudotojui.
 * Net be Claude rakto svetainė turi veikti ir atrodyti gyva –
 * tuščias ekranas yra greičiausias būdas prarasti žmogų.
 */
type SeedMeal = Omit<Meal, "id" | "createdAt" | "categoryIds"> & {
  categories: string[];
};

export const SEED_MEALS: SeedMeal[] = [
  {
    name: "Grikių dubuo su vištiena ir brokoliais",
    description:
      "Sotus, lėtai virškinamas dubuo – cukrus nešoka, o alkis negrįžta po valandos.",
    categories: ["diabetikams", "sportininkams", "be-glitimo"],
    minutes: 30,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 520, protein: 42, carbs: 44, fat: 16 },
    ingredients: [
      { name: "grikiai", amount: 80, unit: "g", aisle: "kruopos ir miltai" },
      {
        name: "vištienos krūtinėlė",
        amount: 150,
        unit: "g",
        aisle: "mėsa ir žuvis",
      },
      {
        name: "brokoliai",
        amount: 150,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      },
      { name: "alyvuogių aliejus", amount: 1, unit: "šaukštas", aisle: "kita" },
      {
        name: "česnakas",
        amount: 1,
        unit: "skiltelė",
        aisle: "daržovės ir vaisiai",
      },
    ],
    steps: [
      "Grikius išvirk pasūdytame vandenyje 12–15 min., nukošk.",
      "Vištieną supjaustyk juostelėmis, pakepk keptuvėje su aliejumi 6–8 min.",
      "Įberk smulkintą česnaką ir brokolių žiedynus, kepk dar 4 min.",
      "Sumaišyk su grikiais, pagardink druska ir pipirais.",
    ],
  },
  {
    name: "Lęšių troškinys su morkomis",
    description:
      "Pigus, sotus ir pilnas skaidulų – puodas gaminasi pats, kol tu darai kitus darbus.",
    categories: ["vegetarams", "svorio-metimui", "be-alergenu", "be-glitimo"],
    minutes: 35,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 380, protein: 20, carbs: 52, fat: 9 },
    ingredients: [
      {
        name: "raudonieji lęšiai",
        amount: 100,
        unit: "g",
        aisle: "kruopos ir miltai",
      },
      { name: "morkos", amount: 2, unit: "vnt.", aisle: "daržovės ir vaisiai" },
      {
        name: "svogūnas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      { name: "pomidorų tyrė", amount: 200, unit: "g", aisle: "kita" },
      {
        name: "kmynai",
        amount: 1,
        unit: "arbatinis šaukštelis",
        aisle: "prieskoniai",
      },
    ],
    steps: [
      "Svogūną ir morkas supjaustyk kubeliais, pakepk puode 5 min.",
      "Suberk lęšius, supilk pomidorų tyrę ir 400 ml vandens.",
      "Virk ant mažos ugnies 20 min., kol lęšiai suminkštės.",
      "Pagardink kmynais, druska, pipirais.",
    ],
  },
  {
    name: "Kiaušinienė su špinatais ir feta",
    description:
      "Trys minutės ruošos, dešimt minučių iki stalo – geriausias skubaus ryto planas.",
    categories: ["sportininkams", "keto", "be-glitimo", "vegetarams"],
    minutes: 12,
    difficulty: 1,
    slots: ["pusryčiai", "užkandis"],
    source: "seed",
    nutrition: { kcal: 340, protein: 24, carbs: 5, fat: 25 },
    ingredients: [
      { name: "kiaušiniai", amount: 3, unit: "vnt.", aisle: "pieno gaminiai" },
      {
        name: "šviežias špinatas",
        amount: 60,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      },
      { name: "fetos sūris", amount: 40, unit: "g", aisle: "pieno gaminiai" },
      { name: "sviestas", amount: 10, unit: "g", aisle: "pieno gaminiai" },
    ],
    steps: [
      "Keptuvėje ištirpink sviestą, suberk špinatus ir pakaitink 1 min.",
      "Supilk išplaktus kiaušinius, maišyk ant vidutinės ugnies.",
      "Kai beveik sustings, subyrėk fetą ir nukelk nuo ugnies.",
    ],
  },
  {
    name: "Orkaitėje kepta lašiša su bulvėmis",
    description:
      "Vienas skardos pilnas – vakarienė šeimai be trijų puodų plovimo.",
    categories: ["sportininkams", "pagyvenusiems", "be-glitimo"],
    minutes: 40,
    difficulty: 1,
    slots: ["vakarienė", "pietūs"],
    source: "seed",
    nutrition: { kcal: 600, protein: 40, carbs: 45, fat: 28 },
    ingredients: [
      { name: "lašišos filė", amount: 160, unit: "g", aisle: "mėsa ir žuvis" },
      { name: "bulvės", amount: 250, unit: "g", aisle: "daržovės ir vaisiai" },
      {
        name: "citrina",
        amount: 0.5,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      { name: "alyvuogių aliejus", amount: 2, unit: "šaukštas", aisle: "kita" },
      { name: "krapai", amount: 1, unit: "šaukštas", aisle: "prieskoniai" },
    ],
    steps: [
      "Orkaitę įkaitink iki 200 °C.",
      "Bulves supjaustyk skiltelėmis, apšlakstyk aliejumi, kepk 20 min.",
      "Šalia padėk lašišą, apšlakstyk citrina, kepk dar 15 min.",
      "Prieš patiekiant pabarstyk krapais.",
    ],
  },
  {
    name: "Avižinė košė su obuoliu ir cinamonu",
    description:
      "Šiltas rytas, kuris laiko iki pietų ir kainuoja mažiau nei kava.",
    categories: ["vaikams", "pagyvenusiems", "svorio-metimui", "vegetarams"],
    minutes: 10,
    difficulty: 1,
    slots: ["pusryčiai"],
    source: "seed",
    nutrition: { kcal: 320, protein: 11, carbs: 52, fat: 8 },
    ingredients: [
      {
        name: "avižinės dribsniai",
        amount: 60,
        unit: "g",
        aisle: "kruopos ir miltai",
      },
      { name: "pienas", amount: 250, unit: "ml", aisle: "pieno gaminiai" },
      {
        name: "obuolys",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "cinamonas",
        amount: 1,
        unit: "žiupsnelis",
        aisle: "prieskoniai",
      },
    ],
    steps: [
      "Dribsnius užpilk pienu ir virk 5 min. nuolat maišydamas.",
      "Obuolį sutarkuok ir įmaišyk.",
      "Pabarstyk cinamonu.",
    ],
  },
  {
    name: "Vištienos ir daržovių keptuvė su ryžiais",
    description:
      "Klasika, kurią valgo visi namie – net tie, kurie „nemėgsta daržovių“.",
    categories: ["vaikams", "sportininkams", "be-glitimo", "be-alergenu"],
    minutes: 25,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 540, protein: 38, carbs: 60, fat: 14 },
    ingredients: [
      {
        name: "vištienos krūtinėlė",
        amount: 150,
        unit: "g",
        aisle: "mėsa ir žuvis",
      },
      { name: "ryžiai", amount: 80, unit: "g", aisle: "kruopos ir miltai" },
      {
        name: "paprika",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      { name: "morka", amount: 1, unit: "vnt.", aisle: "daržovės ir vaisiai" },
      {
        name: "sojų padažas be glitimo",
        amount: 1,
        unit: "šaukštas",
        aisle: "kita",
      },
    ],
    steps: [
      "Ryžius išvirk pagal pakuotės nurodymus.",
      "Vištieną supjaustyk kubeliais ir apkepk 6 min.",
      "Suberk pjaustytas daržoves, kepk 5 min., kad liktų traškios.",
      "Sumaišyk su ryžiais ir sojų padažu.",
    ],
  },
  {
    name: "Avokado ir kiaušinio salotos",
    description:
      "Riebalai, kurie sotina – keto dienos gelbėtojas, kai nėra laiko gaminti.",
    categories: ["keto", "vegetarams", "be-glitimo"],
    minutes: 10,
    difficulty: 1,
    slots: ["pietūs", "užkandis"],
    source: "seed",
    nutrition: { kcal: 420, protein: 16, carbs: 8, fat: 36 },
    ingredients: [
      {
        name: "avokadas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      { name: "kiaušiniai", amount: 2, unit: "vnt.", aisle: "pieno gaminiai" },
      {
        name: "salotų lapai",
        amount: 50,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      },
      { name: "alyvuogių aliejus", amount: 1, unit: "šaukštas", aisle: "kita" },
    ],
    steps: [
      "Kiaušinius išvirk kietai (8 min.), atvėsink ir supjaustyk.",
      "Avokadą supjaustyk kubeliais.",
      "Sumaišyk su salotų lapais, apšlakstyk aliejumi, pasūdyk.",
    ],
  },
  {
    name: "Pupelių ir pomidorų sriuba",
    description:
      "Vienas puodas, dvi dienos pietų – sriuba, kuri rytoj skanesnė nei šiandien.",
    categories: ["vegetarams", "svorio-metimui", "be-alergenu", "nesciosioms"],
    minutes: 30,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 300, protein: 16, carbs: 44, fat: 6 },
    ingredients: [
      {
        name: "baltosios pupelės konservuotos",
        amount: 400,
        unit: "g",
        aisle: "kita",
      },
      { name: "pomidorai konservuoti", amount: 400, unit: "g", aisle: "kita" },
      {
        name: "svogūnas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "salieras",
        amount: 2,
        unit: "stiebai",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "raudonėlis",
        amount: 1,
        unit: "arbatinis šaukštelis",
        aisle: "prieskoniai",
      },
    ],
    steps: [
      "Svogūną ir salierą pakepk puode 5 min.",
      "Supilk pomidorus ir 300 ml vandens, virk 10 min.",
      "Suberk nukoštas pupeles, virk dar 10 min.",
      "Pagardink raudonėliu ir druska.",
    ],
  },
  {
    name: "Varškės apkepas su mėlynėmis",
    description: "Saldus be cukraus kalno – vaikai valgo, tėvai ramūs.",
    categories: ["vaikams", "nesciosioms", "pagyvenusiems", "vegetarams"],
    minutes: 45,
    difficulty: 2,
    slots: ["pusryčiai", "užkandis"],
    source: "seed",
    nutrition: { kcal: 360, protein: 26, carbs: 32, fat: 13 },
    ingredients: [
      { name: "varškė 9%", amount: 400, unit: "g", aisle: "pieno gaminiai" },
      { name: "kiaušiniai", amount: 2, unit: "vnt.", aisle: "pieno gaminiai" },
      {
        name: "manų kruopos",
        amount: 3,
        unit: "šaukštai",
        aisle: "kruopos ir miltai",
      },
      { name: "mėlynės", amount: 100, unit: "g", aisle: "daržovės ir vaisiai" },
      { name: "medus", amount: 1, unit: "šaukštas", aisle: "kita" },
    ],
    steps: [
      "Varškę sutrink su kiaušiniais ir medumi.",
      "Įmaišyk manus, palik 10 min. išbrinkti.",
      "Atsargiai įmaišyk mėlynes, sudėk į kepimo formą.",
      "Kepk 180 °C orkaitėje 30 min.",
    ],
  },
  {
    name: "Bolivinės balandos salotos su avinžirniais",
    description:
      "Pilnavertis baltymas be mėsos – paruoši vakare, valgysi rytoj darbe.",
    categories: ["vegetarams", "sportininkams", "be-glitimo", "svorio-metimui"],
    minutes: 25,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 450, protein: 19, carbs: 58, fat: 15 },
    ingredients: [
      {
        name: "bolivinė balanda",
        amount: 80,
        unit: "g",
        aisle: "kruopos ir miltai",
      },
      {
        name: "avinžirniai konservuoti",
        amount: 200,
        unit: "g",
        aisle: "kita",
      },
      {
        name: "agurkas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "pomidorai",
        amount: 2,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "citrinos sultys",
        amount: 2,
        unit: "šaukštai",
        aisle: "daržovės ir vaisiai",
      },
    ],
    steps: [
      "Balandą išvirk 15 min., nukošk, atvėsink.",
      "Daržoves supjaustyk kubeliais.",
      "Sumaišyk viską su nukoštais avinžirniais.",
      "Apšlakstyk citrinos sultimis ir aliejumi.",
    ],
  },
  {
    name: "Trintų daržovių sriuba su moliūgu",
    description:
      "Minkšta, šilta ir lengvai virškinama – kai norisi paprastumo.",
    categories: [
      "pagyvenusiems",
      "svorio-metimui",
      "vegetarams",
      "be-alergenu",
      "be-glitimo",
    ],
    minutes: 30,
    difficulty: 1,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 220, protein: 6, carbs: 34, fat: 7 },
    ingredients: [
      {
        name: "moliūgas",
        amount: 400,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      },
      { name: "morka", amount: 1, unit: "vnt.", aisle: "daržovės ir vaisiai" },
      { name: "bulvė", amount: 1, unit: "vnt.", aisle: "daržovės ir vaisiai" },
      { name: "alyvuogių aliejus", amount: 1, unit: "šaukštas", aisle: "kita" },
    ],
    steps: [
      "Daržoves supjaustyk, užpilk vandeniu, kad apsemtų.",
      "Virk 20 min., kol suminkštės.",
      "Sutrink trintuvu iki vientisos masės.",
      "Įmaišyk aliejų, pagardink druska.",
    ],
  },
  {
    name: "Jautienos troškinys su daržovėmis",
    description: "Lėtas sekmadienio puodas, po kurio namai kvepia visą vakarą.",
    categories: ["sportininkams", "pagyvenusiems", "be-glitimo", "nesciosioms"],
    minutes: 90,
    difficulty: 2,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 560, protein: 44, carbs: 30, fat: 28 },
    ingredients: [
      {
        name: "jautienos mentė",
        amount: 200,
        unit: "g",
        aisle: "mėsa ir žuvis",
      },
      { name: "morkos", amount: 2, unit: "vnt.", aisle: "daržovės ir vaisiai" },
      {
        name: "svogūnas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "pastarnokas",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      { name: "lauro lapas", amount: 2, unit: "vnt.", aisle: "prieskoniai" },
    ],
    steps: [
      "Mėsą supjaustyk kubeliais ir apkepk puode iš visų pusių.",
      "Suberk pjaustytas daržoves, pakepk 5 min.",
      "Užpilk vandeniu, įmesk lauro lapus.",
      "Troškink ant mažos ugnies 70 min.",
    ],
  },
  {
    name: "Ryžių košė su moliūgu vaikams",
    description:
      "Švelni, saldoka ir be jokių aštrių prieskonių – tinka ir mažiausiems.",
    categories: ["vaikams", "pagyvenusiems", "be-glitimo"],
    minutes: 25,
    difficulty: 1,
    slots: ["pusryčiai", "užkandis"],
    source: "seed",
    nutrition: { kcal: 290, protein: 8, carbs: 52, fat: 6 },
    ingredients: [
      { name: "ryžiai", amount: 60, unit: "g", aisle: "kruopos ir miltai" },
      {
        name: "moliūgas",
        amount: 150,
        unit: "g",
        aisle: "daržovės ir vaisiai",
      },
      { name: "pienas", amount: 250, unit: "ml", aisle: "pieno gaminiai" },
      { name: "sviestas", amount: 10, unit: "g", aisle: "pieno gaminiai" },
    ],
    steps: [
      "Moliūgą supjaustyk mažais kubeliais.",
      "Sudėk su ryžiais į puodą, užpilk pienu.",
      "Virk ant mažos ugnies 20 min. maišydamas.",
      "Įmaišyk sviestą.",
    ],
  },
  {
    name: "Kalakutienos maltinukai su daržovėmis",
    description:
      "Liesi, sultingi ir tinka į lunchbox'ą – gamini kartą, valgai tris kartus.",
    categories: ["svorio-metimui", "sportininkams", "vaikams", "be-alergenu"],
    minutes: 35,
    difficulty: 2,
    slots: ["pietūs", "vakarienė"],
    source: "seed",
    nutrition: { kcal: 400, protein: 38, carbs: 18, fat: 18 },
    ingredients: [
      {
        name: "kalakutienos faršas",
        amount: 200,
        unit: "g",
        aisle: "mėsa ir žuvis",
      },
      {
        name: "cukinija",
        amount: 1,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "svogūnas",
        amount: 0.5,
        unit: "vnt.",
        aisle: "daržovės ir vaisiai",
      },
      {
        name: "avižiniai dribsniai",
        amount: 2,
        unit: "šaukštai",
        aisle: "kruopos ir miltai",
      },
      {
        name: "paprikos milteliai",
        amount: 1,
        unit: "arbatinis šaukštelis",
        aisle: "prieskoniai",
      },
    ],
    steps: [
      "Cukiniją sutarkuok ir nusunk skystį.",
      "Sumaišyk su faršu, smulkintu svogūnu ir dribsniais.",
      "Suformuok maltinukus.",
      "Kepk orkaitėje 190 °C apie 25 min.",
    ],
  },
];

/*
  Istorijų sėklos nėra – sąmoningai.
  Anksčiau čia buvo sugalvoti atsiliepimai su vardais („Rūta, 34“).
  Tai suklastotas socialinis įrodymas, o jis mūsų etinėje riboje
  uždraustas (žr. CLAUDE.md). Istorijas rašo tik tikri žmonės.
*/

/**
 * Pasėja pradinius duomenis. Saugu paleisti daug kartų –
 * jei kategorija ar patiekalai jau yra, antrą kartą nerašo.
 */
export async function seed(options: { force?: boolean } = {}): Promise<{
  categories: number;
  meals: number;
}> {
  const kv = await getKv();
  const already = await kv.get<boolean>(keys.seeded());
  if (already.value && !options.force) {
    return { categories: 0, meals: 0 };
  }

  // 1. Kategorijos
  const existing = await listCategories();
  const bySlug = new Map(existing.map((c) => [c.slug, c]));
  let categoriesAdded = 0;

  for (const seedCategory of SEED_CATEGORIES) {
    if (bySlug.has(seedCategory.slug)) continue;
    const category: Category = { ...seedCategory, id: newId() };
    await saveCategory(category);
    bySlug.set(category.slug, category);
    categoriesAdded++;
  }

  // 2. Patiekalai – tik tiems, kurie dar tušti
  const now = new Date().toISOString();
  const meals: Meal[] = [];
  for (const seedMeal of SEED_MEALS) {
    const { categories, ...rest } = seedMeal;
    const categoryIds = categories
      .map((slug) => bySlug.get(slug)?.id)
      .filter((id): id is string => Boolean(id));
    if (categoryIds.length === 0) continue;
    meals.push({ ...rest, id: newId(), categoryIds, createdAt: now });
  }

  // Nerašom, jei kategorijos jau turi patiekalų (pvz., AI sugeneruotų).
  const firstCategory = bySlug.get(SEED_CATEGORIES[0].slug);
  const alreadyHasMeals = firstCategory
    ? await countMealsByCategory(firstCategory.id) > 0
    : false;
  const mealsAdded = alreadyHasMeals ? 0 : meals.length;
  if (!alreadyHasMeals) await saveMeals(meals);

  await kv.set(keys.seeded(), true);
  return {
    categories: categoriesAdded,
    meals: mealsAdded,
  };
}
