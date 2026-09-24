/*
  GYVAS FONAS – kylančios daržovių riekelės.
  Kiekviena riekelė gauna atsitiktinį dydį, greitį, vėlavimą ir
  nukrypimą, todėl judėjimas atrodo natūralus, o ne robotiškas.
  Spalvos – iš CSS kintamųjų (styles.css), todėl keičiasi su tema.
*/
(function () {
  const fonas = document.querySelector("[data-gyvas-fonas]");
  if (!fonas) return;
  // „Mažiau judesio“ – riekelių nekuriam, lieka statiškas švytėjimas.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sluoksnis = document.createElement("div");
  sluoksnis.className = "fonas-sluoksnis";
  fonas.appendChild(sluoksnis);

  const RUSYS = ["pomidoras", "agurkas", "citrina"];
  // Telefone – perpus mažiau, kad nekaistų procesorius.
  const kiekis = innerWidth < 640 ? 9 : 18;

  function atsitiktinis(min, max) {
    return min + Math.random() * (max - min);
  }

  function riekelesSvg(rusis) {
    // Paprasta riekelė: žievė, minkštimas ir kelios „sėklų“ linijos.
    let linijos = "";
    const dalys = rusis === "citrina" ? 8 : 6;
    for (let i = 0; i < dalys; i++) {
      const kampas = (i / dalys) * Math.PI * 2;
      linijos += '<line x1="50" y1="50" x2="' +
        (50 + Math.cos(kampas) * 30).toFixed(1) + '" y2="' +
        (50 + Math.sin(kampas) * 30).toFixed(1) + '" />';
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle class="zieve" cx="50" cy="50" r="48" />' +
      '<circle class="vidus" cx="50" cy="50" r="38" />' +
      '<g class="linijos" stroke-width="3" stroke-linecap="round">' +
      linijos + "</g></svg>";
  }

  for (let i = 0; i < kiekis; i++) {
    const rusis = RUSYS[i % RUSYS.length];
    const el = document.createElement("span");
    el.className = "riekele riekele-" + rusis;
    el.style.setProperty("--x", atsitiktinis(0, 100).toFixed(1) + "%");
    el.style.setProperty("--dydis", atsitiktinis(18, 54).toFixed(0) + "px");
    el.style.setProperty("--trukme", atsitiktinis(22, 42).toFixed(1) + "s");
    // Neigiamas vėlavimas – riekelės jau „pakeliui“, fonas ne tuščias pradžioje.
    el.style.setProperty(
      "--velavimas",
      (-atsitiktinis(0, 40)).toFixed(1) + "s",
    );
    el.style.setProperty(
      "--nuokrypis",
      atsitiktinis(-90, 90).toFixed(0) + "px",
    );
    el.style.setProperty(
      "--sukimasis",
      atsitiktinis(14, 36).toFixed(1) + "s",
    );
    el.innerHTML = riekelesSvg(rusis);
    sluoksnis.appendChild(el);
  }

  // Paralaksas: sluoksnis šiek tiek pasislenka priešinga pelei kryptimi.
  if (matchMedia("(pointer: fine)").matches) {
    let laukia = false;
    addEventListener("pointermove", function (e) {
      if (laukia) return;
      laukia = true;
      requestAnimationFrame(function () {
        const dx = (e.clientX / innerWidth - 0.5) * -24;
        const dy = (e.clientY / innerHeight - 0.5) * -16;
        sluoksnis.style.transform = "translate(" + dx.toFixed(1) + "px," +
          dy.toFixed(1) + "px)";
        laukia = false;
      });
    }, { passive: true });
  }
})();
