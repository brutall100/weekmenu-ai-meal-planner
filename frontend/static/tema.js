/*
  TEMA – kraunama <head> viršuje, SINCHRONIŠKAI.
  Kodėl ne gale: jei temą nustatytume po piešimo, puslapis
  sumirgėtų (pirma šviesus, paskui tamsus). Taip – iš karto teisingas.
*/
(function () {
  const root = document.documentElement;
  // Žymim, kad JS veikia – tik tada slepiam „atsirandančius“ elementus.
  root.classList.add("js");

  let saved = null;
  try {
    saved = localStorage.getItem("tema");
  } catch (_) {
    // Privatus langas ar išjungta saugykla – tiesiog sekam sistemą.
  }
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;

  function dabartine() {
    if (root.dataset.theme) return root.dataset.theme;
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function pazymetiMygtuka(mygtukas) {
    const tamsi = dabartine() === "dark";
    mygtukas.setAttribute("aria-pressed", String(tamsi));
    mygtukas.setAttribute(
      "aria-label",
      tamsi ? "Įjungti šviesų režimą" : "Įjungti tamsų režimą",
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const mygtukai = document.querySelectorAll("[data-temos-mygtukas]");
    mygtukai.forEach(function (m) {
      pazymetiMygtuka(m);
      m.addEventListener("click", function () {
        const nauja = dabartine() === "dark" ? "light" : "dark";
        root.dataset.theme = nauja;
        try {
          localStorage.setItem("tema", nauja);
        } catch (_) { /* nesvarbu – tiesiog neįsimins */ }
        mygtukai.forEach(pazymetiMygtuka);
      });
    });
  });
})();
