App.requiredFieldsByTab = {
  quote:  ["quoteCode", "quoteDate", "serviceAvailed"],
  client: ["clientName", "clientAddress", "clientPhone"],
  items:  []
};

App.isFieldFilled = (fieldId) => {
  const field = App.$(fieldId);
  if (!field) return false;
  if (field.type === "checkbox") return field.checked;
  return field.value.trim() !== "";
};

App.isItemsSectionComplete = () => {
  const items = App.getAllItems();
  return items.some((i) => i.name.trim() !== "" && i.price > 0);
};

App.isSectionComplete = (tabName) => {
  if (tabName === "items") return App.isItemsSectionComplete();
  const fields = App.requiredFieldsByTab[tabName];
  if (!fields) return false;
  return fields.every(App.isFieldFilled);
};

App.updateTabProgress = () => {
  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    const tabName = btn.dataset.tab;
    const number  = btn.querySelector(".tab-number");
    if (!number) return;

    const tabIndex  = App.tabOrder.indexOf(tabName) + 1;
    const isComplete = App.isSectionComplete(tabName);

    number.textContent = isComplete ? "✓" : tabIndex;
    number.classList.toggle("is-complete", isComplete);
    btn.classList.toggle("is-complete", isComplete);
  });

  const adminButton = App.$("openAdminSettingsBtn");
  if (adminButton) {
    const number     = adminButton.querySelector(".tab-number");
    const isComplete = App.isFieldFilled("paymentBank") && App.isFieldFilled("paymentAccount");
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
  if (nextLabel) nextLabel.textContent = isLast
    ? (window.innerWidth <= 767 ? "Preview" : "Back to Start")
    : "Next";

  App.updateTabProgress();
};

App.goToNextTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  if (currentIndex === App.tabOrder.length - 1) {
    const previewBtn = document.getElementById("mptbPreviewBtn");
    if (previewBtn) {
      previewBtn.click();
    } else {
      App.setActiveTab(App.tabOrder[0]);
    }
    return;
  }
  App.setActiveTab(App.tabOrder[currentIndex + 1]);
};

App.goToPrevTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  App.setActiveTab(App.tabOrder[Math.max(currentIndex - 1, 0)]);
};
