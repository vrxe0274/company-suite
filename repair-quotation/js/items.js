/* ============================================================
   items.js — Repair quotation line-item management
   Two item types: "labor" (services) and "part" (parts)
   Each card has: name + price. Simple, no collapsing.
   ============================================================ */

App.buildRepairItemCard = (item = {}) => {
  const type = item.type || "labor";

  const card = document.createElement("div");
  card.className = "ritem-card";
  card.dataset.type = type;

  /* Name input */
  const nameWrap = document.createElement("div");
  nameWrap.className = "ritem-name-wrap";
  const nameInput = document.createElement("input");
  nameInput.className = "ritem-name";
  nameInput.type = "text";
  nameInput.placeholder = type === "labor" ? "e.g. Basic Labor" : "e.g. Battery";
  nameInput.value = item.name || "";
  nameWrap.appendChild(nameInput);

  /* Price input */
  const priceWrap = document.createElement("div");
  priceWrap.className = "ritem-price-wrap";
  const priceInput = document.createElement("input");
  priceInput.className = "ritem-price";
  priceInput.type = "number";
  priceInput.min  = "0";
  priceInput.step = "0.01";
  priceInput.placeholder = "0.00";
  priceInput.value = item.price || "";
  priceWrap.appendChild(priceInput);

  /* Remove button */
  const removeBtn = document.createElement("button");
  removeBtn.className = "ritem-remove-btn";
  removeBtn.type = "button";
  removeBtn.setAttribute("aria-label", "Remove row");
  removeBtn.textContent = "🗑";
  removeBtn.addEventListener("click", () => {
    card.remove();
    App.renderPreview();
  });

  card.appendChild(nameWrap);
  card.appendChild(priceWrap);
  card.appendChild(removeBtn);

  nameInput.addEventListener("input",  App.renderPreview);
  nameInput.addEventListener("change", App.renderPreview);
  priceInput.addEventListener("input",  App.renderPreview);
  priceInput.addEventListener("change", App.renderPreview);

  return card;
};

App.addLaborItem = (item = {}) => {
  const card = App.buildRepairItemCard({ ...item, type: "labor" });
  App.$("laborList").appendChild(card);
  App.renderPreview();
};

App.addPartItem = (item = {}) => {
  const card = App.buildRepairItemCard({ ...item, type: "part" });
  App.$("partsList").appendChild(card);
  App.renderPreview();
};

App.getLaborItems = () =>
  [...document.querySelectorAll("#laborList .ritem-card")].map((card) => ({
    type:  "labor",
    name:  card.querySelector(".ritem-name")?.value.trim()  || "",
    price: Number(card.querySelector(".ritem-price")?.value) || 0
  }));

App.getPartItems = () =>
  [...document.querySelectorAll("#partsList .ritem-card")].map((card) => ({
    type:  "part",
    name:  card.querySelector(".ritem-name")?.value.trim()  || "",
    price: Number(card.querySelector(".ritem-price")?.value) || 0
  }));

App.getAllItems = () => [...App.getLaborItems(), ...App.getPartItems()];
