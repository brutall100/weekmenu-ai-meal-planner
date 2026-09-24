---
name: dizaino-sistema
description: Naudok, kai kuri arba keiti bet kokį WeekMenu vaizdinį elementą – puslapį, komponentą, spalvą, tarpą, šriftą, mygtuką, formą ar tuščią būseną. Taip pat naudok prieš pridedant naują CSS klasę arba naują spalvą, kad nesikurtų antra dizaino sistema šalia esamos.
---

# WeekMenu dizaino sistema

## Vienintelė tiesa – `frontend/assets/styles.css`

Visos spalvos, apvalinimai ir šriftai gyvena `@theme` bloke. **Komponente
niekada nerašom `#d96a3f` ar `bg-orange-500`** – rašom `bg-brand`.

Priežastis paprasta: kai spalva pakartota 40 vietų, jos pakeisti nebeįmanoma.
Kai ji viena – visos svetainės nuotaiką pakeiti trimis eilutėmis.

### Kryptis – „Spalvota lėkštė“

Drąsu ir žaisminga: sultingos daržovių riekelės ant mėlynos lėkštės. Fone lėtai
kyla pomidorų, agurkų ir citrinų riekelės (`static/fonas.js`), pradžios
puslapyje sukasi „savaitės lėkštė“ (`components/WeekPlate.tsx`).

### Spalvų vardai ir kada kurią

| Žetonas          | Šviesus   | Kam                                                                        |
| ---------------- | --------- | -------------------------------------------------------------------------- |
| `brand`          | `#E4572E` | Pomidoras. Akcentai, rėmeliai, švytėjimas, riekelės. **Ne mygtuko fonas.** |
| `brand-soft`     | `#FDE3D6` | Fonas po akcentu (kvietimai, pažymėti pasirinkimai)                        |
| `brand-strong`   | `#B83A14` | Tekstas brand spalva (5.4:1 ant fono)                                      |
| `action`         | `#C9461D` | Pagrindinio mygtuko fonas (baltas tekstas – 4.8:1)                         |
| `on-action`      | `#FFFFFF` | Tekstas ant `action`. Tamsiame režime – tamsus.                            |
| `plate`          | `#35679C` | Lėkštės mėlyna: antri mygtukai, nuorodos, fokuso žiedas                    |
| `plate-soft`     | `#E3ECF7` | Fonas po mėlynu tekstu (etiketės)                                          |
| `butter`         | `#F3C13A` | Tik dekoracija (lėkštė, riekelės). Niekada – tekstui.                      |
| `fresh`          | `#2A7238` | Tik „pavyko“: progresas, pažymėta, sėkmė                                   |
| `fresh-soft`     | `#DDF0DC` | Fonas po sėkmės pranešimu                                                  |
| `on-fresh`       | `#FFFFFF` | Tekstas ant `fresh`                                                        |
| `surface`        | `#FFF6E6` | Puslapio fonas                                                             |
| `surface-raised` | `#FFFFFF` | Kortelės, iškilę paviršiai                                                 |
| `line`           | `#EADBC2` | Rėmeliai, skirtukai                                                        |
| `ink`            | `#1F2240` | Pagrindinis tekstas                                                        |
| `ink-soft`       | `#545873` | Antrinis tekstas, paaiškinimai                                             |

**Taisyklės:** `fresh` niekada nenaudojamas dekoracijai. `text-white` nerašom –
rašom `text-on-action` / `text-on-fresh`, nes tamsiame režime tekstas tamsus.

### Šriftai

`font-display` – **Bricolage Grotesque** (antraštės), numatytasis – **DM Sans**,
`font-mono` – **DM Mono** (skaičiai, dienų trumpiniai). Kraunami iš Google Fonts
`_app.tsx` faile.

### Efektai

Klasės iš `frontend/assets/efektai.css` (bendra su Pages demo): `mygtukas`
(pakyla + bangelė), `kyla` (kortelė pakyla), `data-atsiranda` (atsiranda
slenkant), `data-skaicius` (skaičius suskaičiuoja), `ikona` (pasisuka užvedus
pelę). Animuojam tik `transform` ir `opacity`.

### Tamsi tema

Kiekvienas naujas žetonas turi būti apibrėžtas **trijose vietose**: `@theme`,
`@media (prefers-color-scheme: dark)` ir `:root[data-theme="dark"]`. Praleidus
vieną – tamsioje temoje atsiras nematomas tekstas.

## Komponentų taisyklės

1. **Trečias kartas → komponentas.** Jei tą patį stilių rašai trečią kartą, jam
   vieta `frontend/components/ui.tsx`.
2. **Mobilusis pirmas.** Rašom bazinį stilių telefonui, `sm:` ir `lg:` prideda.
   Šoninis tarpas visada 16px (`px-4`). Horizontalaus slinkimo puslapyje nebūna.
3. **Apvalinimas:** kortelės `rounded-card` (28px), mygtukai `rounded-full`,
   maži elementai `rounded-lg`. Kitų variantų nėra.
4. **Šriftai:** antraštės `font-display` (storas grotesk), tekstas –
   numatytasis. Storas, apvalus šriftas daro projektą panašų į linksmą plakatą,
   ne į admin skydelį.

## Prieinamumas – privaloma

- `:focus-visible` žiedas **niekada nenuimamas**. Yra žmonių, kurie naršo
  klaviatūra.
- Kiekvienas mygtukas – `<button>`, kiekviena nuoroda – `<a>`. Ne atvirkščiai.
- `aria-label` ten, kur tekstas tik piktograma.
- Progreso juostai – `role="progressbar"` su `aria-valuenow`.
- Animacijos gerbia `prefers-reduced-motion` (jau įrašyta globaliai).
- Kontrastas: `ink` ant `surface` ir `ink-soft` ant `surface` – tikrinam
  abiejose temose.

## Tuščios būsenos

Tuščias ekranas – greičiausias būdas prarasti žmogų. Kiekviena tuščia būsena
naudoja `<EmptyState>` ir turi **visus keturis**: emoji, antraštę, vieną
paaiškinimo sakinį ir vieną mygtuką.

## Ko šiame projekte NEDAROM

- ❌ Nuotraukų iš stock bankų. Emoji ir tipografika – sąžiningiau ir greičiau.
- ❌ Modalinių langų, kuriuos reikia uždaryti prieš naudojant puslapį.
- ❌ Karuselių. Niekas jų neslenka.
- ❌ Animacijų ilgesnių nei 500 ms.
- ❌ Antros spalvų sistemos „tik šitam vienam puslapiui“.

## Prieš įrašant naują komponentą – trys klausimai

1. Ar toks jau yra `ui.tsx`?
2. Ar naudoju tik dizaino žetonus (jokių `#hex`, jokių `bg-orange-*`)?
3. Ar veikia 390px pločio ekrane ir tamsioje temoje?

Jei bent vienas „ne“ – taisom prieš commit'ą.
