/* Repair quotation code generator — monthly sequential, persisted in localStorage. */
App.generateQuoteCode = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const key   = `vrxe_repair_seq_${year}_${month}`;

  let seq = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(seq));

  return `${String(year).slice(-2)}00-00VR${String(seq).padStart(2, "0")}-${String(seq).padStart(3, "0")}`;
};
