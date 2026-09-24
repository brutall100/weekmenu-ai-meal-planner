import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="lt">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WeekMenu – visos savaitės meniu per minutę</title>
        <meta
          name="description"
          content="Atsakyk į tris klausimus ir gauk visos savaitės meniu su receptais ir pirkinių sąrašu. Pritaikyta diabetikams, sportininkams, vegetarams ir dar septynioms grupėms."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Naršyklės juostos spalva – ta pati kaip --color-surface (styles.css). */}
        <meta
          name="theme-color"
          content="#fff6e6"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#15172b"
          media="(prefers-color-scheme: dark)"
        />
        {/* Tema nustatoma PRIEŠ piešimą, kad puslapis nesumirgėtų. */}
        <script src="/tema.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Mono:wght@500&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap"
        />
        <script src="/fonas.js" defer></script>
        <script src="/efektai.js" defer></script>
      </head>
      <body>
        {/* Gyvas fonas: švytėjimai čia, riekeles prideda static/fonas.js. */}
        <div class="gyvas-fonas" data-gyvas-fonas aria-hidden="true">
          <div class="svytejimas svytejimas-1"></div>
          <div class="svytejimas svytejimas-2"></div>
        </div>
        <Component />
      </body>
    </html>
  );
});
