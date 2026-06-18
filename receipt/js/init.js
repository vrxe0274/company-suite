App.init = () => {
  App.$("receiptCode").value = App.generateReceiptCode();
  App.$("receiptDate").value = App.todayISO();

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

  App.$("newReceiptBtn").addEventListener("click", () => {
    App.$("receiptCode").value = App.generateReceiptCode();
    App.renderPreview();
  });

  App.$("addProductBtn")?.addEventListener("click",   () => App.addItem({ type: "product" }));
  App.$("addDiscountBtn")?.addEventListener("click",  () => App.addItem({ type: "discount" }));
  App.$("addInclusionBtn")?.addEventListener("click", () => App.addItem({ type: "inclusion" }));

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

  App.setActiveTab("receipt");
  App.defaultItems.forEach((item) => App.addItem(item));
  App.renderPreview();
  requestAnimationFrame(App.fitPreviewToPanel);
};