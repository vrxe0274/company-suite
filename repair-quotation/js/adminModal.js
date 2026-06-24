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
  setTimeout(() => App.$("paymentBank")?.focus(), 40);
};

App.bindAdminModal = () => {
  App.$("openAdminSettingsBtn")?.addEventListener("click", App.openAdminModal);
  App.$("closeAdminModalBtn")?.addEventListener("click", App.closeAdminModal);

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
