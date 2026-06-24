/* ============================================================
   pdfFix.js — Fixes PDF export quality on mobile.
   ============================================================ */
(function () {
  "use strict";

  if (!window.App || typeof App.downloadPdf !== "function") {
    console.warn("pdfFix: App.downloadPdf not found — skipping patch.");
    return;
  }

  var original = App.downloadPdf;

  App.downloadPdf = async function () {
    var canvas     = document.getElementById("previewCanvas");
    var savedScale = (App.state && App.state.previewScale) || 1;
    var savedFit   = (App.state && App.state.isFitMode)    || true;

    if (canvas) {
      canvas.style.setProperty("--preview-scale", "1");
      canvas.style.width     = "794px";
      canvas.style.minHeight = "1123px";
    }

    document.body.classList.add("app-pdf-rendering");

    try {
      await original.call(this);
    } finally {
      document.body.classList.remove("app-pdf-rendering");

      if (canvas) {
        canvas.style.width     = "";
        canvas.style.minHeight = "";
      }

      if (typeof App.applyPreviewScale === "function") {
        App.applyPreviewScale(savedScale, savedFit);
      }
    }
  };

})();
