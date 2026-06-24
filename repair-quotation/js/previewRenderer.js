/* ============================================================
   previewRenderer.js — Live repair quotation preview
   Single-page PDF matching VRXE repair quotation format.
   ============================================================ */

App.formatPrice = (amount) =>
  App.peso.format(Number(amount) || 0).replace("₱", "₱ ");

App.renderPreview = () => {
  const data   = App.getValues();
  const labor  = App.getLaborItems().filter((i) => i.name);
  const parts  = App.getPartItems().filter((i) => i.name);
  const total  = [...labor, ...parts].reduce((s, i) => s + i.price, 0);

  const discPct     = Math.min(Math.max(Number(data.discountPercent) || 20, 0), 100);
  const option1Price = Math.round(total * (1 - discPct / 100));
  const option2Price = total;

  const unitName = App.esc(data.unitName || "VR Unit");
  const unitQty  = App.esc(data.unitQty  || "1");

  /* ── Build items table rows ─────────────────────────────── */
  const rowCount = labor.length + parts.length;

  let tableBody = "";

  if (rowCount === 0) {
    tableBody = `
      <tr>
        <td class="rq-unit-cell">VR Unit:<br><strong>${unitName}</strong></td>
        <td class="rq-qty-cell">${unitQty}</td>
        <td class="rq-desc-cell" style="color:#bbb;font-style:italic;">No items added yet</td>
        <td class="rq-subtotal-cell">—</td>
      </tr>`;
  } else {
    /* Combine: labor first, then parts — all share the unit cell via rowspan */
    const allRows = [...labor, ...parts];
    const spanRows = allRows.length;

    tableBody += `<tr class="rq-first-row">
      <td class="rq-unit-cell" rowspan="${spanRows}">VR Unit:<br><strong>${unitName}</strong></td>
      <td class="rq-qty-cell" rowspan="${spanRows}">${unitQty}</td>
      <td class="rq-desc-cell">${App.esc(allRows[0].name)}</td>
      <td class="rq-subtotal-cell">${App.formatPrice(allRows[0].price)}</td>
    </tr>`;

    for (let i = 1; i < allRows.length; i++) {
      const row = allRows[i];
      /* Visual separator before parts section */
      const isSeparator = i === labor.length && parts.length > 0;
      const style = isSeparator ? ' style="border-top:1.5px solid #ccc;"' : "";
      tableBody += `<tr${style}>
        <td class="rq-desc-cell">${App.esc(row.name)}</td>
        <td class="rq-subtotal-cell">${App.formatPrice(row.price)}</td>
      </tr>`;
    }
  }

  /* ── Payment option text ─────────────────────────────────── */
  const opt1Text = `Full payment upon receipt of the quotation, a ${discPct}% discount from the total price is applicable. Fee of ${App.peso.format(option1Price)}`;
  const opt2Text = `Full payment after the completion of the VR repair, total fee is ${App.peso.format(option2Price)}`;

  const warrantyNote     = App.esc(data.warrantyNote     || "6 months warranty for parts and services (free of charge)");
  const orderTerms       = App.nl2br(data.orderTerms     || "VRXE will exercise due care in handling and delivering the product. However, we shall not be held liable for any damages incurred during or after delivery, except in cases where negligence on our part is clearly established.");
  const warrantyApproval = App.nl2br(data.warrantyApproval || "The warranty covers manufacturer defects only, valid for one year from the delivery date.\n\nIt does not cover physical damage, water damage, or issues resulting from misuse or unauthorized repairs after the Unit has been received by the client.\n\nAll warranty claims will be subject to inspection and approval by VRXE.");
  const notesText        = App.esc(data.notesText        || "If you have any questions regarding this document, please contact us as soon as possible.");

  App.$("quotationPreview").innerHTML = `
    <section class="repair-page">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="rq-page-header">
        <img class="rq-logo" src="${App.logoPath}" alt="VRXE Logo" />
        <h1 class="rq-title">QUOTATION</h1>
      </div>

      <!-- ── Bill To + Receipt Number ──────────────────────── -->
      <div class="rq-doc-head">
        <div class="rq-bill-box">
          <div class="rq-bill-label">BILL TO:</div>
          <div class="rq-bill-info">
            <strong>${App.esc(data.clientName    || "Client Name")}</strong><br>
            ${data.clientCompany ? App.esc(data.clientCompany) + "<br>" : ""}
            ${App.esc(data.clientAddress || "Client Address")}<br>
            ${App.esc(data.clientPhone   || "Contact No.")}
          </div>
        </div>
        <div class="rq-ref-box">
          <div class="rq-ref-label">RECEIPT NUMBER</div>
          <div class="rq-ref-value">${App.esc(data.quoteCode || "—")}</div>
        </div>
      </div>

      <!-- ── Service Strip ──────────────────────────────────── -->
      <div class="rq-service-strip">
        <div class="rq-strip-col">
          <div class="rq-strip-label">SERVICE AVAILED</div>
          <div class="rq-strip-value">${App.esc(data.serviceAvailed || "Repair Unit")}</div>
        </div>
        <div class="rq-strip-col">
          <div class="rq-strip-label">DATE OF SERVICE</div>
          <div class="rq-strip-value">${data.quoteDate ? App.formatDateShort(data.quoteDate) : "—"}</div>
        </div>
        <div class="rq-strip-col">
          <div class="rq-strip-label">REPRESENTATIVE NAME</div>
          <div class="rq-strip-value">${App.esc(data.repName || "NA")}</div>
        </div>
      </div>

      <!-- ── Items Table ─────────────────────────────────────── -->
      <table class="rq-table">
        <thead>
          <tr>
            <th class="rq-th-items">ITEMS</th>
            <th class="rq-th-qty">QTY</th>
            <th class="rq-th-desc">DESCRIPTION / PARTICULARS</th>
            <th class="rq-th-sub">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>${tableBody}</tbody>
      </table>

      <div class="rq-nothing">*nothing follows*</div>

      <!-- ── Conforme + Payment Terms ───────────────────────── -->
      <div class="rq-conforme-row">
        <div class="rq-conforme-line"></div>
        <div class="rq-conforme-name">${App.esc(data.clientName || "Client Name")}${data.clientCompany ? "<br>" + App.esc(data.clientCompany) : ""}</div>
      </div>

      <!-- ── Footer two-column ──────────────────────────────── -->
      <div class="rq-footer">
        <div class="rq-footer-left">
          <div class="rq-warranty-badge">📄 ${warrantyNote}</div>

          <div class="rq-terms-block">
            <p class="rq-terms-heading"><strong>🛍 Order and Payment Terms:</strong></p>
            <p class="rq-terms-body">${orderTerms}</p>
          </div>

          <div class="rq-terms-block">
            <p class="rq-terms-heading"><strong>🛠 Warranty Approval:</strong></p>
            <p class="rq-terms-body">${warrantyApproval}</p>
          </div>
        </div>

        <div class="rq-footer-right">
          <div class="rq-payment-section">
            <div class="rq-payment-title">PAYMENT TERMS</div>
            <p class="rq-option"><em><strong>OPTION 1:</strong> ${App.esc(opt1Text)}</em></p>
            <p class="rq-option"><em><strong>Option 2:</strong> ${App.esc(opt2Text)}</em></p>

            <div class="rq-bank-grid">
              <span class="rq-bank-label">BANK / E-WALLET</span>
              <span class="rq-bank-value">${App.esc(data.paymentBank || "GCASH")}</span>
              <span class="rq-bank-label">ACCOUNT NUMBER</span>
              <span class="rq-bank-value">${App.esc(data.paymentAccount || "—")}</span>
            </div>

            <div class="rq-notes-section">
              <div class="rq-notes-label">NOTES</div>
              <p class="rq-notes-body">${notesText}</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  `;

  if (typeof App.updateTabProgress === "function") {
    App.updateTabProgress();
  }
};
