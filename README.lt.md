# WeekMenu – AI savaitės meniu planuotojas

[English](README.md) · **Lietuvių**

Atsakyk į tris klausimus ir gauk visos savaitės meniu su receptais ir
paruoštu pirkinių sąrašu, pritaikytą dešimčiai mitybos grupių.

**[▶ Gyvas demo](https://brutall100.github.io/weekmenu-ai-meal-planner/)** ·
**[Kodas](https://github.com/brutall100/weekmenu-ai-meal-planner)**

![WeekMenu – šviesus režimas](docs/screenshot.webp)

<p>
  <img src="docs/screenshot-dark.webp" alt="WeekMenu – tamsus režimas" width="600" height="375" loading="lazy" />
  <img src="docs/screenshot-mobile.webp" alt="WeekMenu telefone, 390 px pločio" width="185" height="400" loading="lazy" />
</p>

---

## Apie

Kas vakarą tas pats klausimas: _„ką šiandien valgom?“_ WeekMenu į jį
atsako vieną kartą visai savaitei. Pasirenki mitybą, kiek žmonių valgo ir
kiek turi laiko – ir gauni septynių dienų patiekalus, pirkinių sąrašą, kuriame
vienodi produktai sudėti kartu, ir švelnią seriją, kuri padeda sugrįžti.

Mokyklinis projektas, bet statomas kaip tikras produktas: sluoksniuota
architektūra, testai, CI, statistika be sausainių banerių ir užrašytos etikos
taisyklės (jokių tamsių raštų, jokių netikrų atsiliepimų).

## Funkcijos

- **Trijų žingsnių anketa** – mityba, žmonių skaičius ir laikas, kuriuos valgymus planuoti.
- **Savaitės planas** – tas pats patiekalas nekartojamas tą pačią dieną,
  pasikartojimai paskirstomi kuo tolygiau.
- **„Pagaminau“ ir „Kitas patiekalas“** – vienas paspaudimas, atsakymas iš karto.
- **Pirkinių sąrašas** – sudeda vienodus produktus, daugina iš porcijų, rodo
  tik dar nepagamintiems patiekalams, įsimena varneles telefone.
- **Claude AI** sukuria trūkstamus receptus ir įrašo juos visiems (tik kai trūksta).
- **Veikia be API rakto** – AI mygtukai išjungiami su paaiškinimu.
- **Serijos ir ženkliukai** be gėdinimo; privatus statistikos skydelis.
- **Gyvas fonas** – kylančios, besisukančios pomidorų, agurkų ir citrinų
  riekelės su lėtu paralaksu; pradžioje sukasi „savaitės lėkštė“.
- **Šviesus ir tamsus režimai** – pagal sistemą, pasirinkimas įsimenamas, puslapis nemirga.
- **Prieinamumas** – „Pereiti prie turinio“ nuoroda, matomas fokusas, visi
  laukai su `<label>`, `prefers-reduced-motion` išjungia judesį, WCAG AA kontrastas.
- **Taisyklinga lietuvių kalba** su skaičiais: „1 patiekalas“, „3 patiekalai“, „14 patiekalų“.

## Du paleidimo būdai

| | GitHub Pages demo | Pilna programa |
|---|---|---|
| Kur | `docs/` – statiniai failai | Deno + Fresh serveris |
| Duomenys | 14 pavyzdinių patiekalų, laikomi naršyklėje (`localStorage`) | Deno KV duomenų bazė |
| AI | – | Claude kuria trūkstamus receptus |
| Serijos, istorijos, statistika | – | ✓ |
| Plano ir pirkinių logika | **tas pats kodas** (`backend/services/arrange.ts`, `shopping.ts`) | ✓ |

GitHub Pages serverio nepaleidžia, todėl demo surenkamas iš to paties
planavimo kodo į `docs/js/demo.js`.

## Technologijos

- [Deno 2](https://deno.com) + [Fresh 2](https://fresh.deno.dev) + Preact (serverio renderinimas, salos)
- Deno KV – įmontuota duomenų bazė
- [Claude API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) + zod schemos
- Tailwind CSS 4 – kiekviena spalva yra dizaino žetonas viename faile
- GitHub Actions – formatas, lint, tipai, testai, build

**Dizaino kryptis – „Spalvota lėkštė“**

| Žetonas | Šviesus | Tamsus | Kam |
|---|---|---|---|
| `surface` | `#FFF6E6` | `#15172B` | puslapio fonas |
| `surface-raised` | `#FFFFFF` | `#20233F` | kortelės |
| `ink` | `#1F2240` | `#F5F1E6` | tekstas |
| `brand` (pomidoras) | `#E4572E` | `#FF7A52` | akcentai, švytėjimas, riekelės |
| `action` | `#C9461D` | `#FF7A52` | pagrindiniai mygtukai (tamsesnis pomidoras – 4.8:1 kontrastas) |
| `plate` (lėkštės mėlyna) | `#35679C` | `#7FA7E0` | antri mygtukai, nuorodos, fokuso žiedas |
| `butter` | `#F3C13A` | `#F3C13A` | tik dekoracija |
| `fresh` | `#2A7238` | `#7BC47F` | tik „pavyko“: progresas, pažymėta |

Šriftai: **Bricolage Grotesque** (antraštės), **DM Sans** (tekstas),
**DM Mono** (skaičiai) iš Google Fonts.

## Ko išmokau

- Perkelti tris repozitorijas (React + Express + MongoDB) į vieną Deno monorepo.
- Laikytis sluoksnių: puslapiai nesikreipia į DB, salos neimportuoja AI kliento.
- Kviesti AI tik kai trūksta duomenų ir išsaugoti rezultatą visiems.
- Naudoti tą pačią logiką ir serverio programoje, ir statiniame demo.
- Kurti įpročius etiškai – serijos be gėdinimo, jokio suklastoto socialinio įrodymo.
- Tikrinti spalvų kontrastą skaičiais, o ne akimis.
- Lietuviškos daugiskaitos taisyklės sudėtingesnės, nei atrodo.

## Paleisti lokaliai

Reikia [Deno](https://deno.com) 2.x.

```bash
git clone https://github.com/brutall100/weekmenu-ai-meal-planner.git
cd weekmenu-ai-meal-planner

cp .env.example .env     # tada užpildyk reikšmes (visos neprivalomos)
deno install             # priklausomybės
deno task seed           # pradinės kategorijos ir patiekalai
deno task dev            # http://localhost:5173
```

Ką įrašyti į `.env`:

| Kintamasis | Kas tai | Ar reikia? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude raktas iš [console.anthropic.com](https://console.anthropic.com) | Ne – be jo AI mygtukai išjungti |
| `WEEKMENU_AI_MODEL` | Kuris Claude modelis kuria receptus | Ne |
| `WEEKMENU_KV_PATH` | Kur laikyti lokalią duomenų bazę | Ne |
| `WEEKMENU_STATS_TOKEN` | Slaptas raktas skydeliui `/statistika` | Ne – be jo puslapis grąžina 404 |

Kitos komandos:

```bash
deno task generate   # sugeneruoti patiekalus su Claude (po 8 kategorijai)
deno task test       # 33 testai
deno task check      # formatas + lint + tipai
deno task build      # produkcijos versija į _fresh/
deno task start      # paleisti produkcijos versiją
deno task demo       # iš naujo surinkti GitHub Pages demo į docs/
```

**Tik demo:** atidaryk `docs/` bet kokiu statiniu serveriu, pvz.
`cd docs && python3 -m http.server`, ir eik į http://localhost:8000.

### Statistika

Privatus skydelis `/statistika` rodo piltuvėlį: kiek žmonių atėjo, pradėjo
anketą, gavo planą, pagamino, grįžo kitą dieną ir kitą savaitę. Įrašyk
`WEEKMENU_STATS_TOKEN` į `.env` ir atidaryk `/statistika?raktas=<tavo-raktas>`.
Renkam tik anoniminį ID ir datas – jokio IP, jokių trečiųjų šalių.

Pilnos programos diegimas nemokamai Deno Deploy platformoje –
[`docs/DIEGIMAS.md`](docs/DIEGIMAS.md).

## Struktūra

```
.
├── shared/            # tipai, kategorijos, daugiskaita ir matavimo vienetai
├── backend/
│   ├── db/            # Deno KV: raktai, saugyklos, sėkla
│   ├── ai/            # Claude klientas, promptai, zod schemos
│   ├── services/      # planavimas (arrange.ts), pirkiniai, sesija, įpročiai
│   └── lib/           # ID, datos, klaidos
├── frontend/
│   ├── routes/        # puslapiai + API keliai
│   ├── islands/       # interaktyvūs komponentai
│   ├── components/    # serveryje renderinami komponentai
│   ├── assets/        # dizaino žetonai (styles.css) ir efektai (efektai.css)
│   └── static/        # tema, gyvas fonas, mikro-efektai, favicon
├── scripts/
│   └── demo/          # GitHub Pages demo programa (surenkama į docs/js/)
├── docs/              # GitHub Pages demo + architektūros dokumentai
├── tests/             # 33 testai
└── .claude/           # projekto skill'ai ir agentai
```

Daugiau: [architektūra](docs/ARCHITEKTURA.md) ·
[produktas](docs/PRODUKTAS.md) · [migracija](docs/MIGRACIJA.md) ·
[diegimas](docs/DIEGIMAS.md)

## Apribojimai

- Patiekalus generuoja AI. Jie **nėra** medicininė konsultacija – sergant
  reikia gydytojo ar dietologo.
- Maistinė vertė apytikslė – priklauso nuo konkrečių produktų.
- Paskyros nėra: sesija laikoma sausainyje. Išvalius naršyklės duomenis
  planas dingsta.

## Padėkos

- Sėklos receptai ir visas kodas – parašyti šiam projektui.
- AI receptai – [Claude](https://www.anthropic.com/claude), Anthropic.
- Šriftai – [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque),
  [DM Sans](https://fonts.google.com/specimen/DM+Sans),
  [DM Mono](https://fonts.google.com/specimen/DM+Mono) (SIL Open Font License).

## Licencija

[MIT](LICENSE) © 2026 brutall100
