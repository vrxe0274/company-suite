/* ============================================================
   VRXE Business Suite — Service Worker (root scope "/")
   Controls the home launcher + both feature apps.
   - Precaches the app shell (HTML, CSS, JS, partials, icons)
   - Runtime-caches CDN libraries and Google Fonts so PDF export
     keeps working offline after the first online visit
   - Navigation requests fall back to the cached home launcher
   ============================================================ */

const VERSION       = "vrxe-suite-v1";
const SHELL_CACHE   = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

/* Resolve the site root relative to this SW file so the cache URLs
   are correct whether the site is served from / or a GitHub Pages
   subdirectory like /company-suite/. */
const BASE = new URL(".", self.location.href).pathname; // e.g. "/" or "/company-suite/"

const FEATURE_FILES = (feature, extraCss) => [
  `${BASE}${feature}/`,
  `${BASE}${feature}/index.html`,
  `${BASE}${feature}/styles.css`,
  `${BASE}${feature}/${extraCss}`,
  `${BASE}${feature}/js/config.js`,
  `${BASE}${feature}/js/codes.js`,
  `${BASE}${feature}/js/tabs.js`,
  `${BASE}${feature}/js/items.js`,
  `${BASE}${feature}/js/previewRenderer.js`,
  `${BASE}${feature}/js/pdf.js`,
  `${BASE}${feature}/js/pdfFix.js`,
  `${BASE}${feature}/js/defaultData.js`,
  `${BASE}${feature}/js/adminModal.js`,
  `${BASE}${feature}/js/init.js`,
  `${BASE}${feature}/js/navMenu.js`,
  `${BASE}${feature}/js/htmlIncludes.js`,
  `${BASE}${feature}/partials/header.html`,
  `${BASE}${feature}/partials/tabs.html`,
  `${BASE}${feature}/partials/form-panels.html`,
  `${BASE}${feature}/partials/preview.html`,
  `${BASE}${feature}/partials/item-template.html`,
  `${BASE}${feature}/partials/admin-modal.html`
];

const SHELL = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  /* Shared */
  `${BASE}shared/css/home.css`,
  `${BASE}shared/css/nav.css`,
  `${BASE}shared/css/responsive.css`,
  `${BASE}shared/js/utils.js`,
  `${BASE}shared/js/previewControls.js`,
  `${BASE}shared/js/mobileTabUI.js`,
  `${BASE}shared/js/featureNav.js`,
  `${BASE}shared/partials/form-footer.html`,
  `${BASE}shared/assets/vrxe-logo.png`,
  `${BASE}shared/assets/icon-192.png`,
  `${BASE}shared/assets/icon-512.png`,
  `${BASE}shared/assets/icon-maskable-192.png`,
  `${BASE}shared/assets/icon-maskable-512.png`,
  /* Features */
  ...FEATURE_FILES("quotation", "quotation.css"),
  ...FEATURE_FILES("receipt", "receipt.css")
];

/* Install — cache the shell (best-effort, never fail the whole install) */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        SHELL.map((url) => cache.add(new Request(url, { cache: "reload" })))
      );
    })
  );
  self.skipWaiting();
});

/* Activate — drop old versioned caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch strategy */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  /* Navigation: network-first, fall back to the cached page then home */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match(`${BASE}index.html`))
        )
    );
    return;
  }

  /* Same-origin assets: cache-first, then network (and cache it) */
  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  /* Cross-origin (CDN libs, Google Fonts): stale-while-revalidate */
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) {
            cache.put(request, res.clone()).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
