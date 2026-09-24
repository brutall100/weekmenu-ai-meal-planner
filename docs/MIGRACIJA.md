# Migracija: 3 repozitoriumai → 1 Deno projektas

## Kas buvo

| Repozitoriumas | Kas jame |
|---|---|
| `WeekMenu` | React (CRA) sąsaja: 8 puslapiai, 4 formos, 2 kontekstai |
| `WeekMenuBack` | Vienas `server.js` failas, 460 eilučių, Express + MongoDB |
| `WeekMen-uBack` | Tuščias (tik `.git`) |

Senasis kodas (`legacy/` aplankas) 2026 m. rugsėjį **ištrintas** – jis
niekur nebenaudotas. Jei prireiktų, jis tebėra git istorijoje
(`git log -- legacy/`).

## Ką pakeitėm ir kodėl

### Node + Express → Deno + Fresh

Senasis `server.js` visa turėjo viename faile: prisijungimą prie duomenų
bazės, 17 maršrutų ir logiką. Dabar tai išskaidyta į sluoksnius
(`db` / `services` / `routes`).

Deno pasirinktas dėl vienos priežasties: **nemokamas hostingas su duomenų
baze**. Deno Deploy duoda ir vykdymą, ir KV.

### MongoDB → Deno KV

| | MongoDB Atlas | Deno KV |
|---|---|---|
| Nustatymas | atskira paskyra, connection string, IP sąrašas | nieko |
| Kaina | nemokamas lygis su ribomis | įskaičiuota |
| Paieška | `find({ categoryId })` | reikia savo indekso |
| Lokaliai | reikia serverio arba debesies | vienas failas |

Kaina: KV nemoka ieškoti pagal laukus, todėl indeksus darom patys
(`backend/db/keys.ts`). Mokyklinio projekto apimčiai tai visiškai tinka.

### `_id` → ULID

MongoDB `ObjectId` reikalavo `new ObjectId(id)` konvertavimo kiekviename
maršrute – dažniausias 500 klaidos šaltinis senajame kode. ULID yra
paprasta eilutė, kuri dar ir rikiuojasi pagal laiką.

### Rankiniu būdu įvesti patiekalai → AI

Senajame projekte patiekalus reikėjo suvedinėti per formą.
Dabar Claude juos generuoja pagal kategorijos taisykles, o zod schema
garantuoja, kad į duomenų bazę nepateks „beveik teisingas“ patiekalas.

### Kas visiškai nauja

Šito senajame projekte nebuvo išvis:

- anoniminė sesija be registracijos;
- trijų žingsnių anketa;
- savaitės plano sudarymas pagal laiką ir nemėgstamus produktus;
- serijos, ženkliukai, progresas, kvietimai;
- pirkinių sąrašas;
- tamsi tema ir prieinamumo taisyklės;
- testai (jų nebuvo nė vieno);
- `.claude/` skills ir agentai.

## Ką iš senojo projekto pasilikom

- **10 kategorijų** – tos pačios, tik su pridėtomis taisyklėmis.
- **Istorijų idėja** – liko, bet dabar turi aiškų vaidmenį (socialinis įrodymas).
- **Lietuvių kalba** visoje sąsajoje.

## Ko nebeliko

| Buvo | Kodėl nebėra |
|---|---|
| `RegisterForm`, `LoginForm` | registracijos nebėra – sesija sausainyje |
| `CategoryForm`, `MealForm` | patiekalus generuoja AI, ne administratorius |
| `react-toastify` | pranešimai įtaisyti į `PlanBoard` |
| `react-spinners` | laukimas rodomas mygtuko tekstu |
| `axios` | `fetch` yra standartas |
| SCSS moduliai | Tailwind 4 su dizaino žetonais |

## Kaip patikrinti, kad migracija pavyko

```bash
deno task check   # formatas, lint, tipai
deno task test    # 20 testų
deno task build   # produkcijos versija
deno task start   # atidaryk http://localhost:8000
```
