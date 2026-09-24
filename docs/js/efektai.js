/*
  MIKRO-EFEKTAI: mygtukų bangelė, atsiradimas slenkant,
  skaičių suskaičiavimas ir pirkinių varnelių įsiminimas.
  Viskas veikia per data-* atributus, todėl serverio komponentams
  nereikia jokio JS – užtenka pridėti atributą.
*/
(function () {
  const mazaiJudesio = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Bangelė paspaudus bet kurį .mygtukas
  document.addEventListener("pointerdown", function (e) {
    const m = e.target.closest && e.target.closest(".mygtukas");
    if (!m || m.disabled || mazaiJudesio) return;
    const r = m.getBoundingClientRect();
    const dydis = Math.max(r.width, r.height) * 2;
    const b = document.createElement("span");
    b.className = "bangele";
    b.style.width = b.style.height = dydis + "px";
    b.style.left = e.clientX - r.left - dydis / 2 + "px";
    b.style.top = e.clientY - r.top - dydis / 2 + "px";
    m.appendChild(b);
    setTimeout(function () {
      b.remove();
    }, 600);
  });

  // 2. Atsiradimas slenkant
  const elementai = document.querySelectorAll("[data-atsiranda]");
  if ("IntersectionObserver" in window && !mazaiJudesio) {
    const stebetojas = new IntersectionObserver(function (irasai) {
      irasai.forEach(function (irasas) {
        if (!irasas.isIntersecting) return;
        irasas.target.classList.add("matomas");
        stebetojas.unobserve(irasas.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    elementai.forEach(function (el) {
      stebetojas.observe(el);
    });
  } else {
    elementai.forEach(function (el) {
      el.classList.add("matomas");
    });
  }

  // 3. Skaičiai suskaičiuoja nuo nulio, kai pasirodo ekrane
  const skaiciai = document.querySelectorAll("[data-skaicius]");
  function suskaiciuoti(el) {
    const tikslas = Number(el.dataset.skaicius) || 0;
    if (mazaiJudesio) {
      el.textContent = String(tikslas);
      return;
    }
    const pradzia = performance.now();
    const trukme = 900;
    function kadras(dabar) {
      const t = Math.min(1, (dabar - pradzia) / trukme);
      const lengva = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(tikslas * lengva));
      if (t < 1) requestAnimationFrame(kadras);
    }
    requestAnimationFrame(kadras);
  }
  if ("IntersectionObserver" in window) {
    const skaitiklis = new IntersectionObserver(function (irasai) {
      irasai.forEach(function (irasas) {
        if (!irasas.isIntersecting) return;
        suskaiciuoti(irasas.target);
        skaitiklis.unobserve(irasas.target);
      });
    });
    skaiciai.forEach(function (el) {
      skaitiklis.observe(el);
    });
  }

  // 4. Pirkinių varnelės įsimenamos šioje naršyklėje
  function skaityti() {
    try {
      return JSON.parse(localStorage.getItem("pirkiniai") || "{}");
    } catch (_) {
      return {};
    }
  }
  const pazymeti = skaityti();
  document.querySelectorAll("input[data-isimink]").forEach(function (box) {
    const raktas = box.dataset.isimink;
    box.checked = Boolean(pazymeti[raktas]);
    box.addEventListener("change", function () {
      const dabar = skaityti();
      if (box.checked) dabar[raktas] = 1;
      else delete dabar[raktas];
      try {
        localStorage.setItem("pirkiniai", JSON.stringify(dabar));
      } catch (_) { /* saugykla neprieinama – varnelė tiesiog neišliks */ }
    });
  });
})();
