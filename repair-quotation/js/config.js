window.App = window.App || {};

App.logoPath = "../shared/assets/vrxe-logo.png";
App.peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP"
});

App.fields = [
  "quoteCode", "quoteDate", "repName", "serviceAvailed",
  "clientName", "clientCompany", "clientAddress", "clientPhone",
  "unitName", "unitQty",
  "paymentBank", "paymentAccount", "discountPercent",
  "warrantyNote", "orderTerms", "warrantyApproval", "notesText"
];

App.tabOrder = ["quote", "client", "items"];

App.state = {
  activeTab:    "quote",
  previewScale: 1,
  isFitMode:    true
};
