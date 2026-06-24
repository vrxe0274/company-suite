window.App = window.App || {};

App.logoPath = "../shared/assets/vrxe-logo.png";
App.peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP"
});

App.fields = [
  "receiptCode", "receiptDate", "preparedBy",
  "clientName", "clientCompany", "clientContact", "clientAddress",
  "paymentMethod", "paymentReference", "paymentBank", "paymentAccount",
  "receiptNote", "taxRate", "discount",
  "paymentTerms", "returnPolicy", "warrantyNote", "contactSupport"
];

App.tabOrder = ["receipt", "client", "services", "payment"];

App.state = {
  activeTab:    "receipt",
  previewScale: 1,
  isFitMode:    true
};
