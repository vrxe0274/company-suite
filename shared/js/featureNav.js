/* ============================================================
   featureNav.js — Persistent product switcher (Quotation ⇄ Receipt ⇄ Home)

   ADDITIVE layer, no dependency on the App framework. Builds two
   navigation surfaces and lets CSS decide which is visible:
     • Desktop (≥ 768px): a slim vertical activity rail on the far
       left, separate from each feature's in-page steps sidebar.
     • Mobile  (≤ 767px): a fixed bottom navigation bar.

   The same item is highlighted in both. The current feature is
   detected from the URL path. On the home launcher this script
   does nothing (the launcher is itself the menu).

   Links are root-absolute, so serve company-suite as the web root
   (e.g. open this folder in VS Code Live Server).
   ============================================================ */
(function () {
  "use strict";

  var path = location.pathname.replace(/\\/g, "/");
  var feature = /\/receipt(\/|$)/.test(path)   ? "receipt"
              : /\/quotation(\/|$)/.test(path) ? "quotation"
              : "home";

  /* Home page is the launcher — no switcher chrome needed. */
  if (feature === "home") return;

  var ICON = {
    home:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9.5 20v-6h5v6"/></svg>',
    quotation:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>' +
      '<path d="M14 3v5h5"/><line x1="8.5" y1="13" x2="15.5" y2="13"/>' +
      '<line x1="8.5" y1="16.5" x2="13" y2="16.5"/></svg>',
    receipt:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M6 3h12v18l-3-1.6L12 21l-3-1.6L6 21z"/>' +
      '<line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/></svg>'
  };

  var ITEMS = [
    { key: "home",      href: "/",           label: "Home" },
    { key: "quotation", href: "/quotation/", label: "Quotation" },
    { key: "receipt",   href: "/receipt/",   label: "Receipt" }
  ];

  function itemHTML(it) {
    var active = it.key === feature;
    return '<a class="fnav-item' + (active ? " is-active" : "") + '" href="' + it.href + '"' +
           (active ? ' aria-current="page"' : "") + '>' +
           '<span class="fnav-icon">' + ICON[it.key] + "</span>" +
           '<span class="fnav-label">' + it.label + "</span></a>";
  }

  var links = ITEMS.map(itemHTML).join("");

  /* Desktop activity rail */
  var rail = document.createElement("nav");
  rail.className = "feature-rail";
  rail.setAttribute("aria-label", "Switch product");
  rail.innerHTML =
    '<a class="fnav-brand" href="/" aria-label="VRXE Suite home">' +
      '<img src="/shared/assets/vrxe-logo.png" alt="" /></a>' +
    '<div class="fnav-rail-items">' + links + "</div>";

  /* Mobile bottom navigation */
  var bottom = document.createElement("nav");
  bottom.className = "feature-bottomnav";
  bottom.setAttribute("aria-label", "Switch product");
  bottom.innerHTML = links;

  function mount() {
    if (document.querySelector(".feature-rail")) return;
    document.body.appendChild(rail);
    document.body.appendChild(bottom);
    document.body.classList.add("has-feature-nav");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
