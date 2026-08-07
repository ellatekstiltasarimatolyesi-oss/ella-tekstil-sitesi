/* ================= ELLA — Ek Özellikler JS (React uygulamasına dokunmaz) ================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------- 1) Tüm buton/kart/link tıklamalarına renkli animasyon ---------- */
  function setupClickAnimations() {
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target.closest(
          "button, a, .glass-card, .glass-card-static"
        );
        if (!el) return;
        el.classList.remove("ella-flash");
        void el.offsetWidth; /* reflow: animasyonu yeniden başlatmak için */
        el.classList.add("ella-flash");
        setTimeout(function () {
          el.classList.remove("ella-flash");
        }, 700);
      },
      true
    );
  }

  /* ---------- 2) Görsele tıklayınca büyük ekran genişliğinde açılan lightbox ---------- */
  function setupLightbox() {
    var overlay = document.createElement("div");
    overlay.id = "ella-lightbox";
    overlay.innerHTML =
      '<button id="ella-lightbox-close" aria-label="Kapat" type="button">&times;</button>' +
      '<img id="ella-lightbox-img" src="" alt="">' +
      '<div id="ella-lightbox-hint">Kapatmak için dışarı tıklayın ya da ESC</div>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector("#ella-lightbox-img");

    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
    function open(src, alt) {
      imgEl.src = src;
      imgEl.alt = alt || "";
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#ella-lightbox-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    document.addEventListener(
      "click",
      function (e) {
        if (overlay.classList.contains("open")) return;
        var img = e.target.closest("img");
        if (!img) return;
        if (img.closest("#ella-lightbox")) return;
        if (img.dataset.noLightbox !== undefined) return;
        e.preventDefault();
        e.stopPropagation();
        open(img.currentSrc || img.src, img.alt);
      },
      true
    );
  }

  /* ---------- 3) Ziyaretçinin site yazı rengini istediği gibi değiştirebildiği RGB paneli ---------- */
  function setupColorPicker() {
    var STORAGE_KEY = "ella_text_color_override";
    var btn, panel;

    function applyColor(hex) {
      document.documentElement.style.setProperty("--text", hex);
      document.documentElement.style.setProperty("--text-muted", hex);
      try {
        localStorage.setItem(STORAGE_KEY, hex);
      } catch (err) {}
    }
    function resetColor() {
      document.documentElement.style.removeProperty("--text");
      document.documentElement.style.removeProperty("--text-muted");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {}
    }

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (err) {}
    if (saved) applyColor(saved);

    btn = document.createElement("button");
    btn.id = "ella-color-toggle";
    btn.type = "button";
    btn.title = "Yazı Rengini Özelleştir";
    btn.setAttribute("aria-label", "Yazı Rengini Özelleştir");
    btn.innerHTML = "🎨";

    panel = document.createElement("div");
    panel.id = "ella-color-panel";
    panel.innerHTML =
      '<div class="ella-color-panel-title">Yazı Rengi</div>' +
      '<div class="ella-color-panel-sub">Sitedeki tüm yazı rengini kendine göre ayarla</div>' +
      '<input type="color" id="ella-color-input" value="' + (saved || "#F5F3EF") + '">' +
      '<div class="ella-color-swatches"></div>' +
      '<button id="ella-color-reset" type="button">Varsayılana Dön</button>';
    document.body.appendChild(panel);

    var swatchColors = [
      "#F5F3EF", "#1A1A2E", "#C9A227", "#7B2FF7",
      "#00E0FF", "#F27A1A", "#E1306C", "#00E054"
    ];
    var swatchWrap = panel.querySelector(".ella-color-swatches");
    swatchColors.forEach(function (c) {
      var sw = document.createElement("button");
      sw.type = "button";
      sw.className = "ella-swatch";
      sw.style.background = c;
      sw.title = c;
      sw.addEventListener("click", function () {
        applyColor(c);
        panel.querySelector("#ella-color-input").value = c;
      });
      swatchWrap.appendChild(sw);
    });

    panel.querySelector("#ella-color-input").addEventListener("input", function (e) {
      applyColor(e.target.value);
    });
    panel.querySelector("#ella-color-reset").addEventListener("click", function () {
      resetColor();
      panel.querySelector("#ella-color-input").value = "#F5F3EF";
    });

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove("open");
      }
    });

    function findThemeToggle() {
      return document.querySelector(
        '[title="Gündüz Modu"], [title="Gece Modu"]'
      );
    }

    function placeButton() {
      var themeToggle = findThemeToggle();
      if (themeToggle && themeToggle.parentNode) {
        themeToggle.insertAdjacentElement("afterend", btn);
        return true;
      }
      return false;
    }

    if (!placeButton()) {
      /* Header henüz React tarafından render edilmemiş olabilir: geçici olarak
         sağ altta sabit göster, header hazır olunca yanına taşı. */
      btn.classList.add("ella-color-fallback-fixed");
      document.body.appendChild(btn);
      var tries = 0;
      var interval = setInterval(function () {
        tries++;
        var themeToggle = findThemeToggle();
        if (themeToggle) {
          btn.classList.remove("ella-color-fallback-fixed");
          themeToggle.insertAdjacentElement("afterend", btn);
          clearInterval(interval);
        } else if (tries > 100) {
          clearInterval(interval); /* buton sağ altta sabit kalır, kaybolmaz */
        }
      }, 300);
    }
  }

  ready(function () {
    setupClickAnimations();
    setupLightbox();
    setupColorPicker();
  });
})();
