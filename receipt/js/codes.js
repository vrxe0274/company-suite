/* Receipt code generator — yearly random reference. */
App.generateReceiptCode = () => {
  const year   = new Date().getFullYear();
  const random = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
  return `RCP-${year}-${random}`;
};
