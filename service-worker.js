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

const FEATURE_FILES = (feature, extraCss) => [
  `/${feature}/`,
  `/${feature}/index.html`,
  `/${feature}/styles.css`,
  `/${feature}/${extraCss}`,
  `/${feature}/js/config.js`,
  `/${feature}/js/codes.js`,
  `/${feature}/js/tabs.js`,
  `/${feature}/js/items.js`,
  `/${feature}/js/previewRenderer.js`,
  `/${feature}/js/pdf.js`,
  `/${feature}/js/pdfFix.js`,
  `/${feature}/js/defaultData.js`,
  `/${feature}/js/adminModal.js`,
  `/${feature}/js/init.js`,
  `/${feature}/js/navMenu.js`,
  `/${feature}/js/htmlIncludes.js`,
  `/${feature}/partials/header.html`,
  `/${feature}/partials/tabs.html`,
  `/${feature}/partials/form-panels.html`,
  `/${feature}/partials/preview.html`,
  `/${feature}/partials/item-template.html`,
  `/${feature}/partials/admin-modal.html`
];

const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  /* Shared */
  "/shared/css/home.css",
  "/shared/css/nav.css",
  "/shared/css/responsive.css",
  "/shared/js/utils.js",
  "/shared/js/previewControls.js",
  "/shared/js/mobileTabUI.js",
  "/shared/js/featureNav.js",
  "/shared/partials/form-footer.html",
  "/shared/assets/vrxe-logo.png",
  "/shared/assets/icon-192.png",
  "/shared/assets/icon-512.png",
  "/shared/assets/icon-maskable-192.png",
  "/shared/assets/icon-maskable-512.png",
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
          caches.match(request).then((r) => r || caches.match("/index.html"))
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
