# Diegimas į Deno Deploy (nemokamai)

> ⚠️ **Senasis Deno Deploy (`dash.deno.com`) uždarytas 2026-07-20.**
> Viskas žemiau – apie naująjį, adresu [console.deno.com](https://console.deno.com).
> Senieji projektai ir KV duomenys patys nepersikelia.

## Kodėl Deno Deploy

- Nemokamas planas be kredito kortelės.
- **Deno KV įskaičiuota** – nereikia atskiros duomenų bazės.
- Neužmiega (skirtingai nei senasis Render nemokamas lygis).
- Kiekvienas push'as į `main` – automatiškai nauja versija.

## Žingsniai

### 1. Organizacija ir programa

1. Eik į [console.deno.com](https://console.deno.com) ir prisijunk per GitHub.
2. Sukurk **organizaciją** – be jos programos sukurti nepavyks.
3. **New App** → prijunk GitHub → pasirink `brutall100/weekmenu-ai-meal-planner`, šaka `main`.

Diegiam **per GitHub integraciją**, ne per `deno deploy` komandą – ji su
Fresh 2 kol kas neranda `_fresh/server.js`
([denoland/deno#32296](https://github.com/denoland/deno/issues/32296)).

### 2. Build nustatymai

Fresh atpažįstamas pats. Jei reikia suvesti ranka:

| Laukas | Reikšmė |
|---|---|
| Framework preset | Fresh |
| Install command | `deno install` |
| Build command | `deno task build` |
| Entrypoint | `_fresh/server.js` |

`--unstable-kv` vėliavos nereikia – KV įjungta `deno.json` faile
(`"unstable": ["kv"]`).

### 3. Duomenų bazė – **šito žingsnio nepraleisk**

Naujajame Deploy KV reikia priskirti ranka. Be bazės **kiekviena** užklausa
grąžina 500 – sesija skaitoma iš KV dar prieš puslapį.

**Jei organizacijoje KV bazė jau yra** (pvz., naudoja kita programa) – naujos
nekurk, priskirk tą pačią:

1. Organizacijos meniu → **Databases** → prie esamos Deno KV → **Assign** →
   pasirink WeekMenu programą.
   (Arba: programos skirtukas **Databases** → **Attach Database**.)

Tai saugu: viena bazė gali tarnauti kelioms programoms, o kiekviena programa
joje gauna **savo atskirą** duomenų bazę (`{app-id}-production` ir t. t.).
Kitos programos duomenų WeekMenu nemato ir neliečia. Bendros lieka tik
nemokamo plano ribos (1 GiB, skaitymai, rašymai) – jos skaičiuojamos visai
organizacijai.

**Jei KV bazės dar nėra:**

1. Organizacijos meniu → **Databases** → **Provision Database**.
2. Variklis: **Deno KV**, pavadinimas, pvz., `weekmenu`.
3. Sąraše prie duomenų bazės → **Assign** → pasirink WeekMenu programą.

Priskyrus bazę, programą reikia **perdiegti** (naujas push'as arba
**Redeploy** skydelyje), kad ji prisijungtų.

Kode nieko keisti nereikia: `Deno.openKv()` be argumento Deploy platformoje
pati prisijungia prie priskirtos bazės (žr. `backend/db/kv.ts`).
Pradinė sėkla pasėjama per pirmą užklausą (`frontend/main.ts`).

Kiekviena laiko juosta (production, kiekviena git šaka, preview) gauna
**atskirą** bazę. Todėl šakos peržiūroje duomenys kiti nei gyvoje svetainėje –
taip ir turi būti.

### 4. Aplinkos kintamieji

Programos nustatymuose → **Environment Variables**. Slaptus raktus žymėk
kaip **Secret**. Kontekstas – **Production** (ir **Development**, jei nori,
kad veiktų ir šakų peržiūrose).

| Vardas | Reikšmė | Būtinas? |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (Secret) | Ne. Be jo svetainė veikia, AI mygtukai išjungti. |
| `WEEKMENU_AI_MODEL` | `claude-opus-5` | Ne |
| `WEEKMENU_AI_EFFORT` | `medium` | Ne |
| `WEEKMENU_STATS_TOKEN` | ilga atsitiktinė eilutė (Secret) | Ne. Be jo `/statistika` grąžina 404. |

⚠️ **Rakto niekada nerašom į kodą.** `.env` yra `.gitignore` sąraše.
`WEEKMENU_KV_PATH` Deploy platformoje nereikalingas – ignoruojamas.

### 5. Patikrink

Atidaryk gautą adresą (`<programa>.<organizacija>.deno.net`) ir pereik:

- [ ] pagrindinis puslapis atsidaro
- [ ] `/kategorijos` rodo 10 kategorijų
- [ ] `/pradzia` anketa veikia iki galo
- [ ] `/planas` rodo savaitę
- [ ] „Pagaminau“ pakeičia serijos skaičių
- [ ] `/pirkiniai` rodo sąrašą
- [ ] neegzistuojantis adresas grąžina 404
- [ ] `/statistika` be rakto grąžina 404, su teisingu raktu – skydelį

## Vietinis paleidimas kaip produkcijoje

```bash
deno task build
deno task start
```

## Dažnos klaidos

| Klaida | Priežastis | Sprendimas |
|---|---|---|
| `Deno.openKv is not a function` | KV neįjungta | `deno.json` → `"unstable": ["kv"]` (jau įrašyta) |
| Visi puslapiai – `Internal server error` (500) | KV bazė nepriskirta programai | 3 žingsnis: **Assign** + perdiegti |
| Nepavyksta sukurti naujos KV bazės | organizacijoje jau yra viena | priskirk esamą – duomenys vis tiek atskiri |
| Tuščios kategorijos | sėkla nepasėta | lokaliai `deno task seed`; Deploy – pirma užklausa pasėja pati |
| „AI generavimas išjungtas“ | nėra rakto | įrašyk `ANTHROPIC_API_KEY` |
| `Module not found file:///_fresh/server.js` | diegta per `deno deploy` CLI | diek per GitHub integraciją |
| Windows'e `deno task check` rodo dešimtis failų | CRLF eilučių pabaigos | `.gitattributes` jau sutvarko; senam klonui – `git rm --cached -r . && git reset --hard` |

## Kaina

Nemokamo plano ribos visai organizacijai (pagal
[deno.com/deploy/pricing](https://deno.com/deploy/pricing), 2026 m. rugsėjis):

| Dalis | Riba | Kaina |
|---|---|---|
| Užklausos | 1 mln. per mėnesį | 0 € |
| Srautas | 20 GiB per mėnesį | 0 € |
| CPU laikas | 10 val. aktyvaus CPU per mėnesį | 0 € |
| Aktyvūs diegimai | 10 | 0 € |
| Deno KV | 1 GiB, 1 mln. skaitymo ir 500 tūkst. rašymo vienetų per mėnesį | 0 € |
| Savi domenai | iki 5, TLS automatiškai | 0 € (domenas pats – atskirai) |
| Claude API | ~pora centų už kategorijos patiekalų rinkinį; sugeneruota kartą – naudojama visiems | pagal naudojimą |

Be `ANTHROPIC_API_KEY` visas projektas kainuoja **0 €**.

Ko naujajame Deploy nėra: KV eilių (`kv.enqueue()`) – projektas jų
nenaudoja.
