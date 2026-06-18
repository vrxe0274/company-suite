# VRXE Business Suite

A single product that unifies the **Quotation Maker** and **Receipt Maker** into
one app with a shared launcher and a persistent feature switcher. Built as a
zero-dependency static multi-page PWA (vanilla HTML/CSS/JS) — no build step.

## Structure

```
company-suite/
├─ index.html            Home launcher (pick Quotation or Receipt)
├─ manifest.json         Unified PWA manifest (scope "/")
├─ service-worker.js     Unified service worker (controls all pages)
├─ shared/
│  ├─ css/   home.css · nav.css · responsive.css
│  ├─ js/    utils.js · previewControls.js · mobileTabUI.js · featureNav.js
│  ├─ partials/ form-footer.html
│  └─ assets/  icons + logo
├─ quotation/            Quotation Maker (feature-specific HTML/CSS/JS/partials)
└─ receipt/              Receipt Maker  (feature-specific HTML/CSS/JS/partials)
```

### What is shared vs. per-feature

The two apps had drifted apart, so only genuinely-identical pieces are shared
(formatting utilities, preview controls, mobile tab UI, responsive rules, icons,
the form footer). Everything that differs between the apps (data model, preview
rendering, PDF export, admin modal, themes) stays in each feature folder,
untouched — so all original functionality is preserved.

`shared/js/utils.js` is the common helper module; each feature's
`js/codes.js` holds its own document-code generator
(`generateQuoteCode` / `generateReceiptCode`).

## Navigation

- **Home launcher** (`/`) — two cards to enter either tool.
- **Persistent switcher** (`shared/js/featureNav.js`, styled by `nav.css`):
  - Desktop (≥768px): a slim activity rail on the far left (Home / Quotation /
    Receipt), separate from each feature's in-page steps sidebar.
  - Mobile (≤767px): a fixed bottom navigation bar.

Switcher links are **root-absolute** (`/`, `/quotation/`, `/receipt/`), so the
project must be served with `company-suite` as the web root.

## Running

`fetch()` of HTML partials does not work over `file://`, so use a static server:

- VS Code **Live Server** — open the `company-suite` folder and "Go Live".
- or `npx serve` / `python3 -m http.server` from inside `company-suite`.

Then visit the served root (e.g. `http://localhost:5500/`).
