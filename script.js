/* UN Agent — Security Architecture presentation
   Vanilla slide-deck engine. No dependencies, no external requests. */
(function () {
  "use strict";

  var deck    = document.getElementById("deck");
  var slides  = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var dotsBox = document.getElementById("dots");
  var menuList= document.getElementById("menuList");
  var progress= document.getElementById("progress");
  var curEl   = document.getElementById("cur");
  var totEl   = document.getElementById("tot");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var menu    = document.getElementById("menu");
  var scrim   = document.getElementById("scrim");
  var hint    = document.getElementById("hint");
  var N       = slides.length;
  var current = 0;
  var navigated = false;

  totEl.textContent = N;

  /* ---- assign ids, build dots + contents menu ---- */
  slides.forEach(function (s, i) {
    if (!s.id) {
      var t = (s.dataset.title || ("slide-" + (i + 1)))
                .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      s.id = t || ("slide-" + (i + 1));
    }
    var d = document.createElement("button");
    d.className = "dot";
    d.setAttribute("aria-label", "Go to slide " + (i + 1));
    d.addEventListener("click", function () { go(i); flagNav(); });
    dotsBox.appendChild(d);

    var li = document.createElement("li");
    var b = document.createElement("button");
    b.className = "menu-item";
    b.innerHTML = '<span class="menu-num">' +
      (i + 1 < 10 ? "0" + (i + 1) : (i + 1)) + '</span>' +
      '<span class="menu-label">' + (s.dataset.title || "Slide") + '</span>';
    b.addEventListener("click", function () {
      go(i); flagNav(); closeMenu();
    });
    li.appendChild(b);
    menuList.appendChild(li);
  });
  var dots = Array.prototype.slice.call(dotsBox.children);
  var menuItems = Array.prototype.slice.call(menuList.querySelectorAll(".menu-item"));

  /* ---- core navigation ---- */
  function go(i) {
    i = Math.max(0, Math.min(N - 1, i));
    current = i;
    slides.forEach(function (s, idx) {
      s.classList.toggle("active", idx === i);
      s.classList.toggle("is-prev", idx < i);
    });
    dots.forEach(function (d, idx) { d.classList.toggle("active", idx === i); });
    menuItems.forEach(function (m, idx) { m.classList.toggle("active", idx === i); });
    progress.style.width = (N > 1 ? (i / (N - 1)) * 100 : 100) + "%";
    curEl.textContent = i + 1;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === N - 1;
    var id = slides[i].id;
    if (id && ("#" + id) !== location.hash) {
      history.replaceState(null, "", "#" + id);
    }
    var inner = slides[i].querySelector(".slide-inner");
    if (inner) inner.scrollTop = 0;
    if (menuItems[i]) menuItems[i].scrollIntoView({ block: "nearest" });
  }
  function next() { if (current < N - 1) { go(current + 1); flagNav(); } }
  function prev() { if (current > 0)     { go(current - 1); flagNav(); } }
  function flagNav() {
    if (!navigated) { navigated = true; hint.classList.add("hide"); }
  }

  /* ---- controls ---- */
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  document.addEventListener("keydown", function (e) {
    if (lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      return;
    }
    if (menu.classList.contains("open")) {
      if (e.key === "Escape") closeMenu();
      return;
    }
    switch (e.key) {
      case "ArrowRight": case "PageDown": next(); e.preventDefault(); break;
      case "ArrowLeft":  case "PageUp":   prev(); e.preventDefault(); break;
      case " ":          next(); e.preventDefault(); break;
      case "Home":       go(0); flagNav(); e.preventDefault(); break;
      case "End":        go(N - 1); flagNav(); e.preventDefault(); break;
    }
  });

  /* ---- touch swipe ---- */
  var tx = 0, ty = 0;
  deck.addEventListener("touchstart", function (e) {
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
  }, { passive: true });
  deck.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ---- contents menu ---- */
  function openMenu()  { menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false"); scrim.classList.add("show"); }
  function closeMenu() { menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true"); scrim.classList.remove("show"); }
  document.getElementById("menuBtn").addEventListener("click", openMenu);
  document.getElementById("menuClose").addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);

  /* ---- deep linking ---- */
  function fromHash() {
    var h = location.hash.replace("#", "");
    if (!h) return 0;
    for (var i = 0; i < N; i++) { if (slides[i].id === h) return i; }
    return 0;
  }
  window.addEventListener("hashchange", function () {
    var i = fromHash();
    if (i !== current) go(i);
  });

  /* ---- team avatars (initials derived from each name) ---- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".team-card"), function (card) {
      var b = card.querySelector("b");
      if (!b) return;
      var words = b.textContent.trim().split(/\s+/);
      var initials = (words[0].charAt(0) +
        (words.length > 1 ? words[words.length - 1].charAt(0) : ""))
        .toUpperCase();
      var av = document.createElement("span");
      av.className = "avatar";
      av.textContent = initials;
      var txt = document.createElement("div");
      txt.className = "tc-text";
      while (card.firstChild) txt.appendChild(card.firstChild);
      card.appendChild(av);
      card.appendChild(txt);
    });

  /* ---- image lightbox (click to open, click image to zoom) ---- */
  var lightbox  = document.getElementById("lightbox");
  var lightImg  = document.getElementById("lightboxImg");
  function openLightbox(src, alt) {
    lightImg.src = src;
    lightImg.alt = alt || "";
    lightImg.classList.remove("zoomed");
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightImg.classList.remove("zoomed");
    lightImg.src = "";
  }
  deck.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest(".media img") : null;
    if (img) { openLightbox(img.src, img.alt); }
  });
  lightImg.addEventListener("click", function (e) {
    e.stopPropagation();
    lightImg.classList.toggle("zoomed");
    lightbox.scrollTop = 0; lightbox.scrollLeft = 0;
  });
  lightbox.addEventListener("click", closeLightbox);
  document.getElementById("lightboxClose").addEventListener("click", function (e) {
    e.stopPropagation(); closeLightbox();
  });

  /* ---- start ---- */
  go(fromHash());
  setTimeout(function () { if (!navigated) hint.classList.add("hide"); }, 6000);
})();
