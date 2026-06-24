/* Receipt code generator — monthly sequential, persisted in localStorage. */
App.generateReceiptCode = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const key   = `vrxe_receipt_seq_${year}_${month}`;

  let seq = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(seq));

  return `RCP-${year}-${month}-${String(seq).padStart(4, "0")}`;
};
