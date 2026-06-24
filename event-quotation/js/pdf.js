const PDF_LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function ensurePdfLibs() {
  if (window.html2canvas && window.jspdf) return;
  await Promise.all(PDF_LIBS.map(loadScript));
}

/* pdfFix.js wraps this function to handle scale reset and error feedback.
   Keep the core generation logic here; no duplicate scale/class handling. */
App.downloadPdf = async () => {
  await ensurePdfLibs();

  const { jsPDF } = window.jspdf;
  const pages      = [...document.querySelectorAll(".quotation-page")];
  const pdf        = new jsPDF("p", "mm", "a4");
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const cvs = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    });
    const imgData = cvs.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  const safeCode = (App.$("quoteCode")?.value || "VRXE-Quotation").replace(/[^a-z0-9-]/gi, "_");
  pdf.save(`${safeCode}.pdf`);
};
