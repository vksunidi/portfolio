(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveals
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    items.forEach(function (el, i) { el.style.setProperty("--d", (i % 2) * 70 + "ms"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Nav: border once scrolled, active section
  var nav = document.querySelector(".nav");
  var ids = ["about", "experience", "projects", "skills", "contact"];
  var links = {};
  document.querySelectorAll("nav a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  function onScroll() {
    nav.classList.toggle("compact", window.scrollY > 16);
    var current = "";
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
    });
    Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  function setMenu(open) { btn.setAttribute("aria-expanded", open ? "true" : "false"); menu.classList.toggle("open", open); }
  btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); btn.focus(); } });
})();

// Download buttons: a normal file download on the open web; inside the artifact viewer, hand the PDF to the viewer's save prompt.
(function () {
  var buttons = document.querySelectorAll("[data-download]");
  if (!buttons.length || !window.claude || typeof window.claude.use !== "function") return;
  window.claude.use("downloads").then(function (dl) {
    if (!dl) return;
    buttons.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        fetch(b.getAttribute("href")).then(function (r) { return r.blob(); }).then(function (blob) {
          return dl.save({ filename: b.getAttribute("download") || "resume.pdf", data: blob });
        }).catch(function () { /* declined or unavailable: nothing else to do */ });
      });
    });
  }).catch(function () {});
})();
