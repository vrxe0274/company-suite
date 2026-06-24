App.currentAdminTab = "payment";

App.openAdminModal = () => {
  const modal = App.$("adminModal");
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  App.showAdminEditorView();
};

App.closeAdminModal = () => {
  const modal = App.$("adminModal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  App.renderPreview();
};

App.showAdminEditorView = () => {
  App.$("adminPasswordView")?.setAttribute("hidden", "");
  App.$("adminEditorView")?.removeAttribute("hidden");
  App.setAdminModalTab("payment");
  setTimeout(() => App.$("paymentMethod")?.focus(), 40);
};

App.setAdminModalTab = (tabName) => {
  App.currentAdminTab = tabName === "footer" ? "footer" : "payment";

  document.querySelectorAll(".modal-tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.adminTab === App.currentAdminTab);
  });

  App.$("adminPaymentPanel")?.classList.toggle("is-active", App.currentAdminTab === "payment");
  App.$("adminFooterPanel")?.classList.toggle("is-active",  App.currentAdminTab === "footer");
};

App.bindAdminModal = () => {
  App.$("openAdminSettingsBtn")?.addEventListener("click", App.openAdminModal);
  App.$("closeAdminModalBtn")?.addEventListener("click", App.closeAdminModal);

  document.querySelectorAll(".modal-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => App.setAdminModalTab(btn.dataset.adminTab));
  });

  document.querySelectorAll(".close-admin-editor").forEach((btn) => {
    btn.addEventListener("click", App.closeAdminModal);
  });

  App.$("adminModal")?.addEventListener("click", (e) => {
    if (e.target === App.$("adminModal")) App.closeAdminModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && App.$("adminModal")?.classList.contains("is-open")) {
      App.closeAdminModal();
    }
  });
};
