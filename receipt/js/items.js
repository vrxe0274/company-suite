/* ============================================================
   items.js — receipt line item management (collapsible cards)

   Row types
   ─────────────────────────────────────────────────────────────
   "product"   Standard product/service with qty & unit price.
   "discount"  Discount row (negative amount, shown in red).
   "inclusion" Included item with no pricing (shown in teal).
   ============================================================ */

App.getItems = () => {
  return [...document.querySelectorAll(".item-card")].map((card) => {
    const type = card.dataset.type || "product";

    if (type === "inclusion") {
      return {
        type,
        name:        card.querySelector(".item-name")?.value.trim()        || "",
        description: card.querySelector(".item-description")?.value.trim() || "",
        qty:         0,
        unitPrice:   0,
        total:       0
      };
    }

    const qty       = Number(card.querySelector(".item-qty")?.value)       || 0;
    const unitPrice = Number(card.querySelector(".item-unitprice")?.value) || 0;
    const total     = type === "discount" ? -Math.abs(unitPrice) : qty * unitPrice;

    return {
      type,
      name:        card.querySelector(".item-name")?.value.trim()        || "",
      description: card.querySelector(".item-description")?.value.trim() || "",
      qty:         type === "discount" ? 1 : qty,
      unitPrice,
      total
    };
  });
};

/* ── Build a card DOM element ─────────────────────────────── */
App.buildItemCard = (item = {}) => {
  const type = item.type || "product";

  const card = document.createElement("div");
  card.className    = "item-card";
  card.dataset.type = type;

  /* ── Card header row (badge + controls) ── */
  const cardHeader = document.createElement("div");
  cardHeader.className = "item-card-header";

  /* ── Type badge ── */
  const badge = document.createElement("div");
  badge.className = "item-type-badge";
  badge.textContent =
    type === "discount"  ? "−  Discount / Deduction" :
    type === "inclusion" ? "✓  Inclusion"             :
                           "⬤  Product / Service";
  cardHeader.appendChild(badge);

  /* ── Header right controls (remove + toggle) ── */
  const headerControls = document.createElement("div");
  headerControls.className = "item-card-controls";

  /* ── Remove button ── */
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-item-btn";
  removeBtn.type = "button";
  removeBtn.setAttribute("aria-label", "Remove line item");
  removeBtn.title = "Remove";
  removeBtn.textContent = "🗑";
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    card.remove();
    App.renderPreview();
  });
  headerControls.appendChild(removeBtn);

  /* ── Collapse toggle ── */
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "item-toggle-btn";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("aria-label", "Toggle item");
  toggleBtn.setAttribute("aria-expanded", "true");
  toggleBtn.innerHTML = `<svg class="item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>`;
  headerControls.appendChild(toggleBtn);

  cardHeader.appendChild(headerControls);
  card.appendChild(cardHeader);

  /* ── Collapsible body ── */
  const cardBody = document.createElement("div");
  cardBody.className = "item-card-body";

  /* ── Grid ── */
  const grid = document.createElement("div");
  grid.className = "grid item-grid";

  /* Item Name */
  const lName = document.createElement("label");
  lName.textContent =
    type === "discount"  ? "Discount Label"           :
    type === "inclusion" ? "Included Item / Service"  :
                           "Item / Service Name";
  const iName = document.createElement("input");
  iName.className   = "item-name";
  iName.type        = "text";
  iName.placeholder =
    type === "discount"  ? "e.g. Senior Citizen Discount" :
    type === "inclusion" ? "e.g. Free Delivery"            :
                           "e.g. Web Design Package";
  iName.value = item.name || "";
  lName.appendChild(iName);
  grid.appendChild(lName);

  /* Description */
  const lDesc = document.createElement("label");
  lDesc.textContent = "Description";
  const iDesc = document.createElement("input");
  iDesc.className   = "item-description";
  iDesc.type        = "text";
  iDesc.placeholder = "Optional short description";
  iDesc.value       = item.description || "";
  lDesc.appendChild(iDesc);
  grid.appendChild(lDesc);

  if (type === "product") {
    const lQty = document.createElement("label");
    lQty.textContent = "Quantity";
    const iQty = document.createElement("input");
    iQty.className   = "item-qty";
    iQty.type        = "number";
    iQty.min         = "0";
    iQty.step        = "1";
    iQty.placeholder = "1";
    iQty.value       = item.qty != null ? item.qty : 1;
    lQty.appendChild(iQty);
    grid.appendChild(lQty);

    const lUnit = document.createElement("label");
    lUnit.textContent = "Unit Price (₱)";
    const iUnit = document.createElement("input");
    iUnit.className   = "item-unitprice";
    iUnit.type        = "number";
    iUnit.min         = "0";
    iUnit.step        = "0.01";
    iUnit.placeholder = "0.00";
    iUnit.value       = item.unitPrice || "";
    lUnit.appendChild(iUnit);
    grid.appendChild(lUnit);
  } else if (type === "discount") {
    /* Discount: hidden qty=1, full-width amount field */
    const hidden = document.createElement("input");
    hidden.className = "item-qty";
    hidden.type      = "hidden";
    hidden.value     = "1";
    grid.appendChild(hidden);

    const lAmt = document.createElement("label");
    lAmt.textContent = "Discount Amount (₱)";
    lAmt.style.gridColumn = "1 / -1";
    const iAmt = document.createElement("input");
    iAmt.className   = "item-unitprice";
    iAmt.type        = "number";
    iAmt.min         = "0";
    iAmt.step        = "0.01";
    iAmt.placeholder = "0.00";
    iAmt.value       = item.unitPrice || "";
    lAmt.appendChild(iAmt);
    grid.appendChild(lAmt);
  }
  /* inclusion: name + description only — no pricing fields */

  cardBody.appendChild(grid);
  card.appendChild(cardBody);

  /* ── Collapsed name preview (visible when folded) ── */
  const collapsedPreview = document.createElement("div");
  collapsedPreview.className = "item-collapsed-preview";
  card.appendChild(collapsedPreview);

  const updateCollapsedPreview = () => {
    collapsedPreview.textContent = iName.value.trim() || "(unnamed item)";
  };
  updateCollapsedPreview();
  iName.addEventListener("input", updateCollapsedPreview);

  /* ── Toggle logic ── */
  let isExpanded = false;

  const setExpanded = (expanded) => {
    isExpanded = expanded;
    card.classList.toggle("is-collapsed", !expanded);
    toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  setExpanded(false);

  toggleBtn.addEventListener("click", () => setExpanded(!isExpanded));
  collapsedPreview.addEventListener("click", () => setExpanded(true));
  cardHeader.addEventListener("click", (e) => {
    if (e.target === cardHeader || e.target === badge) {
      setExpanded(!isExpanded);
    }
  });

  /* Wire all visible inputs to renderPreview */
  card.querySelectorAll("input:not([type=hidden]), textarea").forEach((input) => {
    input.addEventListener("input",  App.renderPreview);
    input.addEventListener("change", App.renderPreview);
  });

  return card;
};

/* ── Public: add a row ────────────────────────────────────── */
App.addItem = (item = {}) => {
  const card = App.buildItemCard(item);
  App.$("itemsList").appendChild(card);
  App.renderPreview();
};
