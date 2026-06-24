/* ============================================================
   previewRenderer.js
   Renders the live single-page receipt preview.
   ============================================================ */

App.shouldRenderItem = (item) => {
  return Boolean(item.name && item.name.trim() !== "");
};

App.renderLineRow = (item) => {
  if (item.type === "discount") {
    return `
      <tr class="discount-row">
        <td class="item-name-cell" colspan="2">
          <span style="border-left:3px solid #DC2626;padding-left:8px;display:block;">
            ${App.esc(item.name)}
            ${item.description ? `<span class="line-desc">${App.esc(item.description)}</span>` : ""}
          </span>
        </td>
        <td class="qty-cell">—</td>
        <td class="unit-cell">—</td>
        <td class="total-cell" style="color:#DC2626;font-weight:800;">(${App.peso.format(Math.abs(item.total))})</td>
      </tr>`;
  }

  if (item.type === "inclusion") {
    return `
      <tr class="inclusion-row">
        <td class="item-name-cell" colspan="2">
          <span style="border-left:3px solid #2563EB;padding-left:8px;display:block;font-weight:700;">
            ${App.esc(item.name)}
            ${item.description ? `<span class="line-desc">${App.esc(item.description)}</span>` : ""}
          </span>
        </td>
        <td class="qty-cell">—</td>
        <td class="unit-cell">—</td>
        <td class="total-cell" style="color:#2563EB;font-weight:800;">Included</td>
      </tr>`;
  }

  return `
    <tr>
      <td class="item-name-cell" colspan="2">
        <span style="border-left:3px solid #16A34A;padding-left:8px;display:block;font-weight:700;">
          ${App.esc(item.name)}
          ${item.description ? `<span class="line-desc">${App.esc(item.description)}</span>` : ""}
        </span>
      </td>
      <td class="qty-cell">${item.qty}</td>
      <td class="unit-cell">${App.peso.format(item.unitPrice)}</td>
      <td class="total-cell">${App.peso.format(item.total)}</td>
    </tr>`;
};

App.renderPreview = () => {
  const data  = App.getValues();
  const items = App.getItems().filter(App.shouldRenderItem);

  const subtotal    = items.reduce((s, i) => s + (i.type !== "discount" ? i.total : 0), 0);
  const discounts   = items.reduce((s, i) => s + (i.type === "discount" ? Math.abs(i.total) : 0), 0);
  const discountAmt = parseFloat(data.discount) || discounts;
  const grandTotal  = Math.max(0, subtotal - discountAmt);

  /* Payment method badge */
  const pmBadge = data.paymentMethod
    ? `<span class="pm-badge">${App.esc(data.paymentMethod)}</span>`
    : `<span class="pm-badge" style="color:#bbb;">—</span>`;

  App.$("receiptPreview").innerHTML = `
    <section class="receipt-page">
      <div class="rcp-header">
        <img class="rcp-logo" src="${App.logoPath}" alt="Company Logo" />
        <div class="rcp-header-info">
          <div class="rcp-title">OFFICIAL RECEIPT</div>
          <div class="rcp-meta-grid">
            <span class="rcp-meta-label">Receipt No.</span>
            <span class="rcp-meta-value">${App.esc(data.receiptCode || "RCP-XXXX-XXXX")}</span>
            <span class="rcp-meta-label">Date</span>
            <span class="rcp-meta-value">${data.receiptDate ? App.formatDateShort(data.receiptDate) : "—"}</span>
            <span class="rcp-meta-label">Prepared By</span>
            <span class="rcp-meta-value">${App.esc(data.preparedBy || "—")}</span>
          </div>
        </div>
      </div>

      <div class="rcp-parties">
        <div class="rcp-bill-to">
          <div class="rcp-party-label">BILLED TO</div>
          <strong>${App.esc(data.clientName || "Client Name")}</strong>
          ${data.clientCompany ? `<br>${App.esc(data.clientCompany)}` : ""}
          ${data.clientAddress ? `<br>${App.esc(data.clientAddress)}` : ""}
          ${data.clientContact ? `<br>${App.esc(data.clientContact)}` : ""}
        </div>
        <div class="rcp-payment-info">
          <div class="rcp-party-label">PAYMENT</div>
          <div class="rcp-pm-row">Method: ${pmBadge}</div>
          ${data.paymentReference ? `<div class="rcp-pm-row">Ref: <strong>${App.esc(data.paymentReference)}</strong></div>` : ""}
          ${data.paymentBank      ? `<div class="rcp-pm-row">Via: <strong>${App.esc(data.paymentBank)}</strong></div>` : ""}
        </div>
      </div>

      <table class="rcp-table">
        <thead>
          <tr>
            <th colspan="2" style="text-align:left;width:46%">Item / Service</th>
            <th style="text-align:center;width:8%">Qty</th>
            <th style="text-align:right;width:18%">Unit Price</th>
            <th style="text-align:right;width:18%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.length
            ? items.map(App.renderLineRow).join("")
            : `<tr><td colspan="5" style="text-align:center;color:#bbb;padding:18px;">No items added yet.</td></tr>`}
        </tbody>
      </table>

      <div class="rcp-totals">
        <div class="totals-grid">
          <span>Subtotal</span>
          <span>${App.peso.format(subtotal)}</span>

          ${discountAmt > 0 ? `
          <span style="color:#DC2626;">Discount</span>
          <span style="color:#DC2626;">(${App.peso.format(discountAmt)})</span>
          ` : ""}

          <span class="total-final-label">TOTAL AMOUNT DUE</span>
          <span class="total-final-value">${App.peso.format(grandTotal)}</span>

          <span class="words-span">${App.esc(App.numberToWords(Math.round(grandTotal)))}</span>
        </div>
      </div>

      ${data.receiptNote ? `
      <div class="rcp-note">
        <span class="rcp-note-label">Note:</span>
        ${App.nl2br(data.receiptNote)}
      </div>` : ""}

      <div class="rcp-footer-strip">
        <div class="rcp-footer-col">
          <div class="rcp-footer-label">PAYMENT TERMS</div>
          <div class="rcp-footer-text">${App.nl2br(data.paymentTerms || "Thank you for your business. We appreciate your trust and support.")}</div>
        </div>
        ${data.returnPolicy ? `
        <div class="rcp-footer-col">
          <div class="rcp-footer-label">RETURNS &amp; REFUNDS</div>
          <div class="rcp-footer-text">${App.nl2br(data.returnPolicy)}</div>
        </div>` : ""}
        ${data.warrantyNote ? `
        <div class="rcp-footer-col">
          <div class="rcp-footer-label">WARRANTY</div>
          <div class="rcp-footer-text">${App.nl2br(data.warrantyNote)}</div>
        </div>` : ""}
      </div>

      <div class="rcp-sign-row">
        <div>
          <div class="rcp-sign-caption">RECEIVED BY (Customer Signature):</div>
          <div class="rcp-sign-line"></div>
          <div class="rcp-sign-name">${App.esc(data.clientName || "")}</div>
        </div>
        <div>
          <div class="rcp-sign-caption">ISSUED BY:</div>
          <div class="rcp-sign-line"></div>
          <div class="rcp-sign-name">${App.esc(data.preparedBy || "")}</div>
        </div>
      </div>

      <div class="rcp-small-footer">
        This is an official receipt. ${data.contactSupport ? App.esc(data.contactSupport) : "Please keep this receipt for your records."}
      </div>

      <div class="rcp-page-no">page 1 of 1</div>
    </section>
  `;

  if (typeof App.updateTabProgress === "function") {
    App.updateTabProgress();
  }
};