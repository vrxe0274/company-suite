App.init = () => {
  App.$("quoteCode").value = App.generateQuoteCode();
  App.$("quoteDate").value = App.todayISO();

  Object.entries(App.defaultFields).forEach(([id, value]) => {
    const field = App.$(id);
    if (field) field.value = value;
  });

  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => App.setActiveTab(btn.dataset.tab));
  });

  App.bindAdminModal();

  App.$("nextTabBtn").addEventListener("click", App.goToNextTab);
  App.$("prevTabBtn").addEventListener("click", App.goToPrevTab);

  App.$("newQuoteBtn").addEventListener("click", () => {
    if (!confirm("Start a new quote? A new quote number will be generated.")) return;
    App.$("quoteCode").value = App.generateQuoteCode();
    App.renderPreview();
  });

  App.$("addLaborBtn")?.addEventListener("click", () => App.addLaborItem());
  App.$("addPartBtn")?.addEventListener("click",  () => App.addPartItem());

  App.$("downloadPdfBtn").addEventListener("click", App.downloadPdf);

  App.$("zoomOutBtn").addEventListener("click",    () => App.zoomPreview(-0.15));
  App.$("zoomInBtn").addEventListener("click",     () => App.zoomPreview(0.15));
  App.$("fitPreviewBtn").addEventListener("click",  App.fitPreviewToPanel);

  window.addEventListener("resize", () => {
    if (App.state.isFitMode) App.fitPreviewToPanel();
  });

  new ResizeObserver(() => {
    if (App.state.isFitMode) App.fitPreviewToPanel();
  }).observe(App.$("previewScroll"));

  App.fields.forEach((id) => {
    const field = App.$(id);
    field?.addEventListener("input",  App.renderPreview);
    field?.addEventListener("change", App.renderPreview);
  });

  App.setActiveTab("quote");
  App.defaultLaborItems.forEach((item) => App.addLaborItem(item));
  App.defaultPartItems.forEach((item)  => App.addPartItem(item));

  /* Debounce subsequent renders — initial render below is still immediate */
  const rawRender = App.renderPreview;
  App.renderPreview = App.debounce(rawRender, 80);
  rawRender();
  requestAnimationFrame(App.fitPreviewToPanel);
};
