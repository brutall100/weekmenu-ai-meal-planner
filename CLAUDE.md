# WeekMenu – gairės Claude'ui

Savaitės maisto planavimo produktas. Mokyklinis projektas, bet sprendimai
priimami kaip tikrame produkte.

## Kas čia yra

| Aplankas | Kas jame |
|---|---|
| `shared/` | Tipai ir kategorijos. Naudoja **ir** front, **ir** back. |
| `backend/db/` | Deno KV: raktai, saugyklos (repositories), pradinė sėkla |
| `backend/ai/` | Claude klientas, promptai, zod schemos, generavimas |
| `backend/services/` | Logika: planuotojas, pirkiniai, sesija, įpročio variklis |
| `backend/lib/` | Smulkmenos: ID, datos, klaidos |
| `frontend/routes/` | Puslapiai ir API keliai (Fresh failų maršrutizacija) |
| `frontend/islands/` | Interaktyvūs komponentai (veikia naršyklėje) |
| `frontend/components/` | Serveryje renderinami komponentai |
| `scripts/demo/` | GitHub Pages demo programa (naršyklėje, be serverio) |
| `docs/` | Dokumentacija + surinktas Pages demo (`index.html`, `css/`, `js/`) |

## Komandos

```bash
deno task dev      # kūrimo serveris
deno task build    # produkcijos versija
deno task start    # paleisti sukurtą versiją
deno task seed     # pradiniai duomenys
deno task generate # sugeneruoti patiekalus su Claude
deno task demo     # surinkti GitHub Pages demo į docs/
deno task test     # testai
deno task check    # fmt + lint + tipai
```

## Taisyklės, kurių laikomės

1. **Sluoksniai neperšokami.**
   `shared` → `backend/db` → `backend/services` → `frontend/routes/api` → `frontend/routes`.
   Puslapis niekada nesikreipia į KV tiesiogiai.
2. **`islands/` negali importuoti nieko iš `backend/db` ar `backend/ai`.**
   Tai patektų į naršyklės paketą kartu su API raktu. Duomenys keliauja
   per props arba `fetch`.
3. **Jokių spalvų kode.** Tik dizaino žetonai – žr.
   `.claude/skills/dizaino-sistema/SKILL.md`.
4. **Svetainė privalo veikti be `ANTHROPIC_API_KEY`.** AI mygtukai tada
   išsijungia su paaiškinimu, bet niekas nelūžta.
5. **Statistika niekada nelaužo puslapio.** `track()` pati gaudo klaidas –
   matavimo įrankis neturi teisės sugadinti to, ką matuoja.
6. **AI kviečiamas tik kai trūksta.** Sugeneruota – įrašoma į KV ir
   tarnauja visiems.
7. **Lietuviškai.** Sąsaja, komentarai, commit'ai. Skaičius derinam su
   žodžiu per `shared/plural.ts` („1 patiekalas“, „14 patiekalų“), kiekius –
   per `shared/units.ts`.
8. **Demo ir programa – ta pati logika.** Planas dėliojamas
   `backend/services/arrange.ts`, pirkiniai – `shopping.ts`. Pakeitus juos
   arba `frontend/static/*`, `frontend/assets/efektai.css` – paleisk
   `deno task demo`, kad atsinaujintų `docs/`.

## Kada kviesti skill'ą ar agentą

| Situacija | Ką naudoti |
|---|---|
| Kuriu kažką, kas turi paveikti elgesį | skill `elgsenos-psichologija` |
| Liečiu bet kokį stilių ar komponentą | skill `dizaino-sistema` |
| Planuoju naują funkciją | skill `produkto-planavimas` |
| Reikia daug variantų | agentas `idejos` |
| Idėja atrinkta, reikia plano | agentas `planuotojas` |
| Sukurta, bet nesinaudoja | agentas `ux-psichologas` |
| Prieš commit'ą po vaizdinio keitimo | agentas `dizaino-recenzentas` |

## Etinė riba

Tamsūs raštai draudžiami be išimčių – melagingas skubėjimas, gėdinimas,
suklastotas socialinis įrodymas, sunkiai randamas atsisakymas.
Pilna lentelė: `.claude/skills/elgsenos-psichologija/SKILL.md`.
