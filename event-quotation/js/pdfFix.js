/* ============================================================
   pdfFix.js — Wraps App.downloadPdf to:
     1. Reset preview scale before capture (prevents mobile blur).
     2. Show a loading state on the download button.
     3. Show a visible error toast if export fails.
     4. Restore state in all cases (success or failure).
   ============================================================ */
(function () {
  "use strict";

  if (!window.App || typeof App.downloadPdf !== "function") {
    console.warn("pdfFix: App.downloadPdf not found — skipping patch.");
    return;
  }

  function showToast(msg) {
    var el = document.createElement("div");
    el.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
      "background:#DC2626;color:#fff;padding:12px 20px;border-radius:8px;" +
      "font-size:14px;font-weight:500;z-index:9999;" +
      "box-shadow:0 4px 12px rgba(0,0,0,.25);white-space:nowrap;";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 5000);
  }

  var original = App.downloadPdf;

  App.downloadPdf = async function () {
    var canvas     = document.getElementById("previewCanvas");
    var savedScale = App.state ? App.state.previewScale : 1;
    var savedFit   = App.state ? App.state.isFitMode   : true;
    var btn        = document.getElementById("downloadPdfBtn");
    var mobileBtn  = document.getElementById("mobilePreviewDownloadBtn");

    /* Save button content and show loading state */
    var btnHtml       = btn       ? btn.innerHTML       : "";
    var mobileBtnHtml = mobileBtn ? mobileBtn.innerHTML : "";
    if (btn)       { btn.disabled       = true; btn.textContent       = "Generating…"; }
    if (mobileBtn) { mobileBtn.disabled = true; mobileBtn.textContent = "Generating…"; }

    /* Reset canvas to native A4 size so html2canvas captures at full resolution */
    if (canvas) {
      canvas.style.setProperty("--preview-scale", "1");
      canvas.style.width     = "794px";
      canvas.style.minHeight = "2310px";
    }
    document.body.classList.add("vrxe-pdf-rendering");

    try {
      await original.call(this);
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed — please try again.");
    } finally {
      document.body.classList.remove("vrxe-pdf-rendering");

      if (canvas) {
        canvas.style.width     = "";
        canvas.style.minHeight = "";
      }
      if (typeof App.applyPreviewScale === "function") {
        App.applyPreviewScale(savedScale, savedFit);
      }

      /* Restore buttons */
      if (btn)       { btn.disabled       = false; btn.innerHTML       = btnHtml; }
      if (mobileBtn) { mobileBtn.disabled = false; mobileBtn.innerHTML = mobileBtnHtml; }
    }
  };

})();
