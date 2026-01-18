// assets/js/menu.js
// Menu-only logic: fetch + cache + render + search + veg filter + collapsible categories.
// No theme logic here (moved to site.js).

console.log("menu.js is running");

// ==============================
// Config
// ==============================
const CFG = window.SITE_CONFIG || {};
const MENU_API_URL = CFG.MENU_API_URL;
const MENU_CACHE_KEY = CFG.MENU_CACHE_KEY || "menuDataCache.v1";
const MENU_CACHE_TS_KEY = CFG.MENU_CACHE_TS_KEY || "menuDataCacheTs.v1";
const MENU_CACHE_TTL_MS = CFG.MENU_CACHE_TTL_MS || 10 * 60 * 1000;

// Store original menu data for filtering
let originalMenuData = null;
// Current filter state: 'all' or 'veg'
let currentFilter = "all";

// Boot (menu page only)
document.addEventListener("DOMContentLoaded", async function () {
  // Guard: if this page doesn't have menu container, do nothing
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  const menuData = await loadMenuData();

  if (menuData) {
    console.log("Menu data loaded:", menuData);
    originalMenuData = menuData;

    renderMenu(originalMenuData);
    setupSearch();
    setupVegetarianFilter();
  } else {
    console.error("Menu data not found from API, cache, or local fallback.");
    menuContainer.innerHTML =
      '<div class="p-4 text-sm text-slate-600 dark:text-text-muted-dark">Menu temporarily unavailable. Please try again later.</div>';
  }
});

// ==============================
// Helpers (Data Loading + Cache)
// ==============================
async function loadMenuData() {
  // 1) Try fresh API first
  const apiData = await fetchMenuFromApiSafe();
  if (apiData) {
    writeMenuCache(apiData);
    return apiData;
  }

  // 2) Try cache (even if stale)
  const cached = readMenuCache(true);
  if (cached) {
    console.warn("Using cached menu data.");
    return cached;
  }

  // 3) Optional fallback: local mock if still included
  if (window.menuData && isValidMenuData(window.menuData)) {
    console.warn("Using local mock menu data (window.menuData).");
    return sanitizeMenuData(window.menuData);
  }

  return null;
}

async function fetchMenuFromApiSafe() {
  try {
    // If cache is still fresh, skip network
    const cachedFresh = readMenuCache(false);
    if (cachedFresh) return cachedFresh;

    if (!MENU_API_URL) {
      console.warn("MENU_API_URL missing. Check assets/js/config.js");
      return null;
    }

    const res = await fetch(MENU_API_URL, { cache: "no-store" });

    if (!res.ok) {
      console.warn("Menu API non-200 status:", res.status);
      return null;
    }

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("Menu API returned non-JSON response.");
      return null;
    }

    if (!isValidMenuData(data)) {
      console.warn("Menu API payload is malformed (missing categories/menuItems arrays).");
      return null;
    }

    return sanitizeMenuData(data);
  } catch (err) {
    console.warn("Menu API fetch failed:", err);
    return null;
  }
}

function isValidMenuData(data) {
  return data && Array.isArray(data.categories) && Array.isArray(data.menuItems);
}

function sanitizeMenuData(data) {
  const categories = (data.categories || [])
    .filter((c) => c && typeof c.name === "string" && c.name.trim() !== "")
    .map((c) => ({
      id: Number(c.id),
      name: c.name,
      description: (c.description ?? "").toString(),
      displayOrder: Number.isFinite(Number(c.displayOrder)) ? Number(c.displayOrder) : 999,
      isActive: c.isActive !== false,
    }))
    .filter((c) => Number.isFinite(c.id));

  const menuItems = (data.menuItems || [])
    .filter((i) => i && typeof i.name === "string" && i.name.trim() !== "")
    .map((i) => {
      const price = Number(i.priceEuro);
      return {
        id: Number(i.id),
        categoryId: Number(i.categoryId),
        name: i.name,
        description: (i.description ?? "").toString(),
        priceEuro: price,
        isAvailable: i.isAvailable !== false,
        displayOrder: Number.isFinite(Number(i.displayOrder)) ? Number(i.displayOrder) : 999,
        isVegetarian: i.isVegetarian === true,
      };
    })
    .filter(
      (i) =>
        Number.isFinite(i.id) &&
        Number.isFinite(i.categoryId) &&
        Number.isFinite(i.priceEuro) &&
        i.name
    );

  return { categories, menuItems };
}

function readMenuCache(allowStale) {
  try {
    const ts = Number(localStorage.getItem(MENU_CACHE_TS_KEY));
    const raw = localStorage.getItem(MENU_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidMenuData(parsed)) return null;

    if (!allowStale) {
      const age = Date.now() - ts;
      if (!Number.isFinite(ts) || age > MENU_CACHE_TTL_MS) return null;
    }

    return sanitizeMenuData(parsed);
  } catch {
    return null;
  }
}

function writeMenuCache(menuData) {
  try {
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menuData));
    localStorage.setItem(MENU_CACHE_TS_KEY, String(Date.now()));
  } catch (e) {
    console.warn("Failed to write menu cache:", e);
  }
}

// ==============================
// Render + UI (same functionality)
// ==============================
function renderMenu(menuData, isSearchMode = false) {
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  const { categories, menuItems } = menuData;
  menuContainer.innerHTML = "";

  if (isSearchMode) {
    let filteredItems = menuItems.filter((item) => item.isAvailable !== false);

    if (currentFilter === "veg") {
      filteredItems = filteredItems.filter((item) => item.isVegetarian === true);
    }

    filteredItems = filteredItems.sort((a, b) => {
      const categoryA = categories.find((cat) => cat.id === a.categoryId);
      const categoryB = categories.find((cat) => cat.id === b.categoryId);
      if (categoryA && categoryB && categoryA.displayOrder !== categoryB.displayOrder) {
        return categoryA.displayOrder - categoryB.displayOrder;
      }
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "space-y-3 md:space-y-4";

    filteredItems.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      const isLastItem = index === filteredItems.length - 1;
      const borderClass = isLastItem ? "" : "border-b border-stone-200 dark:border-dark-border";

      itemDiv.className = `p-2.5 sm:p-3 md:p-5 bg-parchment-card dark:bg-dark-card border border-stone-200 dark:border-dark-border rounded-xl shadow-sm ${borderClass} hover:scale-[1.01] transition-all duration-200 mb-2 sm:mb-3 md:mb-4`;

      const itemHeader = document.createElement("div");
      itemHeader.className = "flex justify-between items-start mb-1 md:mb-2";

      const itemName = document.createElement("h3");
      itemName.className =
        "text-base md:text-lg font-medium text-text-ink dark:text-text-light flex-1 pr-4";
      itemName.textContent = item.name;

      const itemPrice = document.createElement("p");
      itemPrice.className =
        "text-base sm:text-lg md:text-xl font-medium text-ember-accent dark:text-ember-accent flex-shrink-0";
      itemPrice.textContent = `€${item.priceEuro.toFixed(2)}`;

      itemHeader.appendChild(itemName);
      itemHeader.appendChild(itemPrice);

      const itemDesc = document.createElement("p");
      itemDesc.className =
        "text-sm text-slate-500 dark:text-text-muted-dark leading-relaxed mt-0.5 md:mt-1";
      itemDesc.textContent = item.description;

      itemDiv.appendChild(itemHeader);
      itemDiv.appendChild(itemDesc);
      resultsContainer.appendChild(itemDiv);
    });

    menuContainer.appendChild(resultsContainer);
    return;
  }

  const sortedCategories = [...categories]
    .filter((cat) => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  sortedCategories.forEach((category) => {
    let categoryItems = menuItems.filter(
      (item) => item.categoryId === category.id && item.isAvailable !== false
    );

    if (currentFilter === "veg") {
      categoryItems = categoryItems.filter((item) => item.isVegetarian === true);
    }

    categoryItems = categoryItems.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

    if (categoryItems.length === 0) return;

    const categoryDiv = document.createElement("div");
    categoryDiv.className =
      "bg-parchment-card dark:bg-dark-card border border-stone-300 dark:border-dark-border rounded-lg overflow-hidden";

    const categoryHeader = document.createElement("div");
    categoryHeader.className =
      "bg-parchment-card dark:bg-dark-card border-b border-stone-200 dark:border-dark-border hover:bg-stone-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 p-2.5 sm:p-3 md:p-5 flex justify-between items-center";
    categoryHeader.setAttribute("data-category-id", category.id);

    const headerContent = document.createElement("div");
    headerContent.className = "flex-1";

    const categoryName = document.createElement("h2");
    categoryName.className =
      "text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-text-ink dark:text-text-light tracking-normal sm:tracking-wide md:tracking-widest font-clarendon";
    categoryName.textContent = category.name;
    headerContent.appendChild(categoryName);

    if (category.description) {
      const categoryDesc = document.createElement("p");
      categoryDesc.className =
        "text-xs sm:text-sm md:text-base text-slate-500 dark:text-text-muted-dark mt-0.5 md:mt-1";
      categoryDesc.textContent = category.description;
      headerContent.appendChild(categoryDesc);
    }

    const icon = document.createElement("div");
    icon.className = "ml-4 flex-shrink-0";
    icon.setAttribute("data-icon", category.id);
    icon.innerHTML = `
      <svg class="w-5 h-5 text-ember-accent transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-icon-state="collapsed" style="transform: rotate(0deg);">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    `;

    categoryHeader.appendChild(headerContent);
    categoryHeader.appendChild(icon);

    const itemsContainer = document.createElement("div");
    itemsContainer.className = "items-container hidden overflow-hidden transition-all duration-300 ease-out";
    itemsContainer.setAttribute("data-items", category.id);
    itemsContainer.style.maxHeight = "0";
    itemsContainer.style.opacity = "0";

    const itemsGrid = document.createElement("div");
    itemsGrid.className = "p-2.5 sm:p-3 md:p-5";

    categoryItems.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      const isFirstItem = index === 0;
      const borderClass = isFirstItem ? "" : "border-t border-stone-200 dark:border-dark-border";

      itemDiv.className = `p-2.5 sm:p-3 md:p-5 bg-parchment-card dark:bg-dark-card ${borderClass} hover:scale-[1.01] transition-all duration-200`;

      const itemHeader = document.createElement("div");
      itemHeader.className = "flex justify-between items-start mb-1 md:mb-2";

      const itemName = document.createElement("h3");
      itemName.className =
        "text-base md:text-lg font-medium text-text-ink dark:text-text-light flex-1 pr-4";
      itemName.textContent = item.name;

      const itemPrice = document.createElement("p");
      itemPrice.className =
        "text-base sm:text-lg md:text-xl font-medium text-ember-accent flex-shrink-0";
      itemPrice.textContent = `€${item.priceEuro.toFixed(2)}`;

      itemHeader.appendChild(itemName);
      itemHeader.appendChild(itemPrice);

      const itemDesc = document.createElement("p");
      itemDesc.className =
        "text-sm text-slate-500 dark:text-text-muted-dark leading-relaxed mt-0.5 md:mt-1";
      itemDesc.textContent = item.description;

      itemDiv.appendChild(itemHeader);
      itemDiv.appendChild(itemDesc);
      itemsGrid.appendChild(itemDiv);
    });

    itemsContainer.appendChild(itemsGrid);

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(itemsContainer);

    categoryHeader.addEventListener("click", () => toggleCategory(category.id));

    menuContainer.appendChild(categoryDiv);
  });
}

function toggleCategory(categoryId) {
  const itemsContainer = document.querySelector(`[data-items="${categoryId}"]`);
  const icon = document.querySelector(`[data-icon="${categoryId}"]`);
  if (!itemsContainer || !icon) return;

  const svg = icon.querySelector("svg");
  if (!svg) return;

  if (itemsContainer.classList.contains("hidden")) {
    itemsContainer.classList.remove("hidden");
    itemsContainer.style.maxHeight = "none";
    const height = itemsContainer.scrollHeight;
    itemsContainer.style.maxHeight = "0";
    itemsContainer.style.opacity = "0";
    void itemsContainer.offsetHeight;

    requestAnimationFrame(() => {
      itemsContainer.style.maxHeight = height + "px";
      itemsContainer.style.opacity = "1";
    });

    svg.style.transform = "rotate(180deg)";
    svg.setAttribute("data-icon-state", "expanded");
  } else {
    itemsContainer.style.maxHeight = "0";
    itemsContainer.style.opacity = "0";
    svg.style.transform = "rotate(0deg)";
    svg.setAttribute("data-icon-state", "collapsed");

    setTimeout(() => {
      itemsContainer.classList.add("hidden");
      itemsContainer.style.maxHeight = "";
    }, 300);
  }
}

function filterMenuData(query) {
  const { categories, menuItems } = originalMenuData;
  let filteredItems = menuItems;

  if (query && query.trim() !== "") {
    const searchTerm = query.toLowerCase().trim();
    filteredItems = filteredItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm);
      const descMatch = item.description.toLowerCase().includes(searchTerm);
      return nameMatch || descMatch;
    });
  }

  if (currentFilter === "veg") {
    filteredItems = filteredItems.filter((item) => item.isVegetarian === true);
  }

  return { categories, menuItems: filteredItems };
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;

    if (!query || query.trim() === "") {
      renderMenu(originalMenuData, false);
    } else {
      const filteredData = filterMenuData(query);
      renderMenu(filteredData, true);
    }
  });
}

function setupVegetarianFilter() {
  const filterAll = document.getElementById("filter-all");
  const filterVeg = document.getElementById("filter-veg");
  const searchInput = document.getElementById("search-input");
  if (!filterAll || !filterVeg) return;

  function updateFilterButtons() {
    const active =
      "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 " +
      "bg-white dark:bg-neutral-900 text-stone-900 dark:text-white " +
      "shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

    const inactive =
      "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 " +
      "text-stone-600 dark:text-neutral-300 " +
      "hover:text-stone-900 dark:hover:text-white " +
      "hover:bg-stone-50 dark:hover:bg-neutral-900/60";

    if (currentFilter === "all") {
      filterAll.className = active;
      filterVeg.className = inactive;
    } else {
      filterAll.className = inactive;
      filterVeg.className = active;
    }
  }

  filterAll.addEventListener("click", () => {
    currentFilter = "all";
    updateFilterButtons();

    const query = searchInput ? searchInput.value : "";
    if (!query || query.trim() === "") renderMenu(originalMenuData, false);
    else renderMenu(filterMenuData(query), true);
  });

  filterVeg.addEventListener("click", () => {
    currentFilter = "veg";
    updateFilterButtons();

    const query = searchInput ? searchInput.value : "";
    if (!query || query.trim() === "") renderMenu(originalMenuData, false);
    else renderMenu(filterMenuData(query), true);
  });

  updateFilterButtons();
}
