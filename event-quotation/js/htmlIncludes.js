App.loadHtmlIncludes = async () => {
  const includeTargets = [...document.querySelectorAll("[data-include]")];

  // Fetch all files in parallel for speed, but apply outerHTML replacements
  // sequentially. Setting outerHTML detaches the node from the DOM, so if two
  // sibling includes resolve concurrently their stale references can clobber
  // each other, causing one partial (e.g. form-panels.html) to silently vanish.
  const fetched = await Promise.all(includeTargets.map(async (target) => {
    const file = target.getAttribute("data-include");
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Unable to load ${file}`);
    }

    return { target, html: await response.text() };
  }));

  for (const { target, html } of fetched) {
    target.outerHTML = html;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await App.loadHtmlIncludes();
  } catch (error) {
    console.error("Failed to load HTML partials:", error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="load-error">Unable to load HTML partials. Please run this project using a local server such as VS Code Live Server.</div>`
    );
    return;
  }

  try {
    App.init();
    document.dispatchEvent(new CustomEvent("vrxe:ready"));
  } catch (error) {
    console.error("App initialization error:", error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="load-error">App failed to initialize: ${error.message}</div>`
    );
  }
});
