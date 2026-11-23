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

  /* 5 Adimli Siparis Kartlarini 5 Adimli Kurumsal Uretim Surecine Donustur */
  setInterval(function () {
    var map = {
      "5 adımda siparişin hazır": "5 Adımda Kurumsal Üretim Süreci",
      "kolay, hızlı ve güvenli sipariş süreci. ödeme dekontunu yükle, whatsapp'tan onayla.": "Bilgisayarlı kalıp çiziminden numune ve seri üretime kadar uçtan uca profesyonel atölye süreci.",
      "tasarımını seç": "Model & Kalıp Çıkarma",
      "ürün kategorisini seç, beğendiğin tasarıma tıkla ya da kendi görselini hazırla.": "Bilgisayarlı çizim sistemiyle en düşük fire ve hassas ölçümle model kalıbı hazırlanır.",
      "sepete ekle": "Kumaş & Baskı Seçimi",
      "boyut, renk ve adet seçimini yap, sepete ekle.": "Penye, dokuma ve denim seçenekleriyle DTF veya süblimasyon baskı tekniği belirlenir.",
      "iban'a öde": "Numune Üretimi",
      "gösterilen iban numarasına havale/eft yapın, dekontunu yükleyin.": "Kesim ve dikim sonrası onayınız için birebir ölçülerde ürün numunesi hazırlanır.",
      "whatsapp'tan onayla": "Paket & Seri Üretim",
      "otomatik yönlendirme ile sipariş detayların whatsapp'a gönderilir.": "Kumaş tedarikli veya minimum 50 adet paket programla kurumsal ve butik üretim yapılır.",
      "kargoya hazırlanır": "Kalite Kontrol & Teslimat",
      "ödeme onaylandıktan sonra 24 saat içinde ürününüz kargoya verilir.": "Detaylı kalite kontrol, ütü ve paketleme sonrası ürünleriniz güvenle teslim edilir."
    };
    document.querySelectorAll("h1, h2, h3, h4, p, span, div").forEach(function (el) {
      if (el.children.length === 0) {
        var raw = (el.textContent || "").trim();
        var low = raw.toLocaleLowerCase("tr-TR");
        if (map[low] && raw !== map[low]) {
          el.textContent = map[low];
        }
      }
    });
  }, 400);

  /* Kartlardaki Fiyat icin WA ve Sepete Ekle alanlarini tamamen kaldir */
  setInterval(function () {
    document.querySelectorAll('a, button, span, p, div').forEach(function (el) {
      if (el.id === 'ella-network-section' || el.closest('#ella-network-section')) return;
      var t = (el.textContent || '').trim().toLocaleLowerCase('tr-TR');
      if (el.children.length <= 2 && t.length > 0 && t.length < 40) {
        if (t.indexOf('fiyat için') !== -1 || t.indexOf('fiyat icin') !== -1 || t.indexOf('sepete ekle') !== -1 || t.indexOf('whatsapp') !== -1 || t.indexOf('fiyat al') !== -1) {
          el.style.setProperty('display', 'none', 'important');
          if (el.parentElement && el.parentElement.children.length <= 2 && (el.parentElement.textContent || '').trim().length < 50) {
            el.parentElement.style.setProperty('display', 'none', 'important');
          }
        }
      }
    });
  }, 400);
    setupClickAnimations();
    setupLightbox();
    setupColorPicker();
  });
})();





