App.requiredFieldsByTab = {
  receipt:  ["receiptCode", "receiptDate", "preparedBy"],
  client:   ["clientName", "clientContact"],
  payment:  ["paymentMethod", "paymentBank", "paymentAccount"]
};

App.isFieldFilled = (fieldId) => {
  const field = App.$(fieldId);
  if (!field) return false;
  if (field.type === "checkbox") return field.checked;
  return field.value.trim() !== "";
};

App.isItemsSectionComplete = () => {
  if (!App.isFieldFilled("itemsVerified")) return false;
  if (typeof App.getItems !== "function") return false;

  const items = App.getItems();
  if (!items.length) return false;

  return items.some((item) => {
    const hasName  = item.name && item.name.trim() !== "";
    const hasPrice = Number(item.unitPrice) > 0;
    return hasName && hasPrice;
  });
};

App.isSectionComplete = (tabName) => {
  if (tabName === "services") return App.isItemsSectionComplete();
  const requiredFields = App.requiredFieldsByTab[tabName];
  if (!requiredFields) return false;
  return requiredFields.every(App.isFieldFilled);
};

App.updateTabProgress = () => {
  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    const tabName = btn.dataset.tab;
    const number  = btn.querySelector(".tab-number");
    if (!number) return;

    const tabIndex   = App.tabOrder.indexOf(tabName) + 1;
    const isComplete = App.isSectionComplete(tabName);

    number.textContent = isComplete ? "✓" : tabIndex;
    number.classList.toggle("is-complete", isComplete);
    btn.classList.toggle("is-complete", isComplete);
  });

  const adminButton = App.$("openAdminSettingsBtn");
  if (adminButton) {
    const number     = adminButton.querySelector(".tab-number");
    const isComplete = App.isSectionComplete("payment");
    if (number) {
      number.textContent = isComplete ? "✓" : "!";
      number.classList.toggle("is-complete", isComplete);
    }
    adminButton.classList.toggle("is-complete", isComplete);
  }
};

App.setActiveTab = (tabName) => {
  if (!App.tabOrder.includes(tabName)) return;
  App.state.activeTab = tabName;

  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${tabName}`);
  });

  const currentIndex = App.tabOrder.indexOf(tabName);
  const isLast       = currentIndex === App.tabOrder.length - 1;
  App.$("prevTabBtn").disabled = currentIndex === 0;

  const nextLabel = App.$("nextTabBtn").querySelector("span");
  if (nextLabel) nextLabel.textContent = isLast ? "Preview" : "Next";

  App.updateTabProgress();
};

App.goToNextTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  if (currentIndex === App.tabOrder.length - 1) {
    const previewBtn = document.getElementById("mptbPreviewBtn");
    if (previewBtn) previewBtn.click();
    return;
  }
  App.setActiveTab(App.tabOrder[currentIndex + 1]);
};

App.goToPrevTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  App.setActiveTab(App.tabOrder[Math.max(currentIndex - 1, 0)]);
};
