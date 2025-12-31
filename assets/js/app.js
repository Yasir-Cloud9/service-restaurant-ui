/**
 * app.js
 * 
 * This file contains all Phase 1 UI logic:
 * - Renders the menu from mock data
 * - Handles collapsible categories
 * - Handles live search
 * - Handles switching between customer and admin views
 */

console.log('app.js is running');

// Store original menu data for filtering
let originalMenuData = null;

// Read menu data on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.menuData) {
    console.log('Menu data loaded:', window.menuData);
    console.log('Categories:', window.menuData.categories);
    console.log('Menu items:', window.menuData.menuItems);
    
    // Store original data
    originalMenuData = window.menuData;
    
    // Render the menu with full data
    renderMenu(originalMenuData);
    
    // Set up search functionality
    setupSearch();
    
    // Set up dark mode toggle
    setupDarkMode();
  } else {
    console.error('Menu data not found. Make sure menu-mock-data.js is loaded before app.js.');
  }
});

/**
 * Renders the menu based on provided menu data
 * @param {Object} menuData - The menu data object containing categories and menuItems
 * @param {boolean} isSearchMode - If true, shows only items without category headers
 * 
 * Filtering behavior: 
 * - In normal mode: Categories with zero matching items are hidden entirely.
 * - In search mode: Only matching items are shown, without category headers.
 */
function renderMenu(menuData, isSearchMode = false) {
  const menuContainer = document.getElementById('menu-container');
  if (!menuContainer) {
    console.error('Menu container not found');
    return;
  }

  const { categories, menuItems } = menuData;

  // Clear container
  menuContainer.innerHTML = '';

  // In search mode, show only items without category headers
  if (isSearchMode) {
    const filteredItems = menuItems
      .filter(item => item.isAvailable)
      .sort((a, b) => {
        // Sort by category displayOrder first, then by item displayOrder
        const categoryA = categories.find(cat => cat.id === a.categoryId);
        const categoryB = categories.find(cat => cat.id === b.categoryId);
        if (categoryA && categoryB) {
          if (categoryA.displayOrder !== categoryB.displayOrder) {
            return categoryA.displayOrder - categoryB.displayOrder;
          }
        }
        return a.displayOrder - b.displayOrder;
      });

    // Create a container for search results
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'space-y-3 md:space-y-4';

    filteredItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      // Add border-t for all items except the last one
      const isLastItem = index === filteredItems.length - 1;
      const borderClass = isLastItem ? '' : 'border-b border-stone-200 dark:border-gray-700';
      itemDiv.className = `p-4 md:p-5 bg-parchment-card dark:bg-charcoal-card border border-stone-200 dark:border-gray-700 rounded-xl shadow-sm ${borderClass} hover:scale-[1.01] transition-all duration-200 mb-3 md:mb-4`;

      // Item header with name and price (price in top-right)
      const itemHeader = document.createElement('div');
      itemHeader.className = 'flex justify-between items-start mb-2';

      // Item name
      const itemName = document.createElement('h3');
      itemName.className = 'text-base md:text-lg font-medium text-text-ink dark:text-text-main flex-1 pr-4';
      itemName.textContent = item.name;

      // Item price (top-right, ember-accent, medium weight)
      const itemPrice = document.createElement('p');
      itemPrice.className = 'text-lg md:text-xl font-medium text-ember-accent dark:text-ember-accent flex-shrink-0';
      itemPrice.textContent = `€${item.priceEuro.toFixed(2)}`;

      itemHeader.appendChild(itemName);
      itemHeader.appendChild(itemPrice);

      // Item description
      const itemDesc = document.createElement('p');
      itemDesc.className = 'text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1';
      itemDesc.textContent = item.description;

      itemDiv.appendChild(itemHeader);
      itemDiv.appendChild(itemDesc);
      resultsContainer.appendChild(itemDiv);
    });

    menuContainer.appendChild(resultsContainer);
    return;
  }

  // Normal mode: show categories with collapsible headers
  // Sort categories by displayOrder
  const sortedCategories = [...categories]
    .filter(cat => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Create a category section for each category
  sortedCategories.forEach(category => {
    // Get items for this category, sorted by displayOrder
    const categoryItems = menuItems
      .filter(item => item.categoryId === category.id && item.isAvailable)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Skip categories with no items (filtering behavior: hide empty categories)
    if (categoryItems.length === 0) {
      return;
    }

    // Create category container
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'bg-parchment-card dark:bg-charcoal-card border border-stone-300 dark:border-gray-700 rounded-lg overflow-hidden mb-4';

    // Create category header (clickable) - styled like a physical menu folder
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'bg-parchment-card dark:bg-charcoal-card border-b border-stone-200 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 p-4 md:p-5 flex justify-between items-center';
    categoryHeader.setAttribute('data-category-id', category.id);
    
    const headerContent = document.createElement('div');
    headerContent.className = 'flex-1';
    
    const categoryName = document.createElement('h2');
    categoryName.className = 'text-2xl md:text-3xl font-normal text-text-ink dark:text-text-main tracking-widest font-clarendon';
    categoryName.textContent = category.name;
    categoryName.style.letterSpacing = "0.05em";
    
    
    headerContent.appendChild(categoryName);
    
    if (category.description) {
      const categoryDesc = document.createElement('p');
      categoryDesc.className = 'text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1';
      categoryDesc.textContent = category.description;
      headerContent.appendChild(categoryDesc);
    }

    // Add expand/collapse icon (custom SVG arrow with ember-accent color)
    // Arrow starts pointing down (collapsed state), rotates 180deg when open
    const icon = document.createElement('div');
    icon.className = 'ml-4 flex-shrink-0';
    icon.setAttribute('data-icon', category.id);
    icon.innerHTML = `
      <svg class="w-5 h-5 text-ember-accent dark:text-ember-accent transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-icon-state="collapsed" style="transform: rotate(0deg);">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    `;

    categoryHeader.appendChild(headerContent);
    categoryHeader.appendChild(icon);

    // Create items container (initially hidden/collapsed) with smooth transition
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container hidden overflow-hidden transition-all duration-300 ease-out';
    itemsContainer.setAttribute('data-items', category.id);
    // Set initial collapsed state for smooth transition
    itemsContainer.style.maxHeight = '0';
    itemsContainer.style.opacity = '0';

    // Create items container (single column)
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'p-4 md:p-5';

    // Create menu items
    categoryItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      // Add border-t for all items except the first one (creates dividers between items)
      const isFirstItem = index === 0;
      const borderClass = isFirstItem ? '' : 'border-t border-stone-200 dark:border-gray-700';
      itemDiv.className = `p-4 md:p-5 bg-parchment-card dark:bg-charcoal-card ${borderClass} hover:scale-[1.01] transition-all duration-200`;

      // Item header with name and price (price in top-right)
      const itemHeader = document.createElement('div');
      itemHeader.className = 'flex justify-between items-start mb-2';

      // Item name (modern sans-serif, medium weight, normal casing)
      const itemName = document.createElement('h3');
      itemName.className = 'text-base md:text-lg font-medium text-text-ink dark:text-text-main flex-1 pr-4';
      itemName.textContent = item.name;

      // Item price (modern sans-serif, medium weight, accent color)
      const itemPrice = document.createElement('p');
      itemPrice.className = 'text-lg md:text-xl font-medium text-ember-accent dark:text-ember-accent flex-shrink-0';
      itemPrice.textContent = `€${item.priceEuro.toFixed(2)}`;

      itemHeader.appendChild(itemName);
      itemHeader.appendChild(itemPrice);

      // Item description (modern sans-serif, smaller, softer color)
      const itemDesc = document.createElement('p');
      itemDesc.className = 'text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1';
      itemDesc.textContent = item.description;

      itemDiv.appendChild(itemHeader);
      itemDiv.appendChild(itemDesc);
      itemsGrid.appendChild(itemDiv);
    });

    itemsContainer.appendChild(itemsGrid);

    // Assemble category section
    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(itemsContainer);

    // Add click handler for expand/collapse
    categoryHeader.addEventListener('click', function() {
      toggleCategory(category.id);
    });

    menuContainer.appendChild(categoryDiv);
  });
}

/**
 * Toggles the visibility of a category's items with smooth animation
 */
function toggleCategory(categoryId) {
  const itemsContainer = document.querySelector(`[data-items="${categoryId}"]`);
  const icon = document.querySelector(`[data-icon="${categoryId}"]`);

  if (!itemsContainer || !icon) return;

  const svg = icon.querySelector('svg');
  if (!svg) return;

  // Toggle visibility with smooth transition
  if (itemsContainer.classList.contains('hidden')) {
    // Remove hidden class first to measure content
    itemsContainer.classList.remove('hidden');
    // Temporarily set max-height to auto to measure
    itemsContainer.style.maxHeight = 'none';
    const height = itemsContainer.scrollHeight;
    // Set to 0 first, then animate to full height
    itemsContainer.style.maxHeight = '0';
    itemsContainer.style.opacity = '0';
    
    // Trigger reflow
    void itemsContainer.offsetHeight;
    
    // Animate to full height
    requestAnimationFrame(() => {
      itemsContainer.style.maxHeight = height + 'px';
      itemsContainer.style.opacity = '1';
    });
    
    // Rotate arrow 180 degrees (pointing up when expanded)
    svg.style.transform = 'rotate(180deg)';
    svg.setAttribute('data-icon-state', 'expanded');
  } else {
    // Collapse: set to 0 before hiding
    itemsContainer.style.maxHeight = '0';
    itemsContainer.style.opacity = '0';
    // Rotate arrow back to 0 degrees (pointing down when collapsed)
    svg.style.transform = 'rotate(0deg)';
    svg.setAttribute('data-icon-state', 'collapsed');
    
    // Hide after transition completes
    setTimeout(() => {
      itemsContainer.classList.add('hidden');
      itemsContainer.style.maxHeight = '';
    }, 300);
  }
}

/**
 * Filters menu items based on search query
 * IMPORTANT: Search only matches menu items (name and description), NOT categories.
 * Categories are only shown if they contain matching items.
 * 
 * Example: Searching "chicken" will find:
 * - "Grilled Chicken Caesar Salad" (matches name)
 * - "Grilled Chicken Wrap" (matches name)
 * And will show both "Salads" and "Wraps" categories containing these items.
 * 
 * @param {string} query - The search query string
 * @returns {Object} Filtered menu data with matching items only
 */
function filterMenuData(query) {
  if (!query || query.trim() === '') {
    // Return original data if search is empty
    return originalMenuData;
  }

  const searchTerm = query.toLowerCase().trim();
  const { categories, menuItems } = originalMenuData;

  // Filter ONLY menu items that match the search query (case-insensitive)
  // Search matches if the query appears in item name OR description
  // Categories are NOT searched - they are only shown if they contain matching items
  const filteredItems = menuItems.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm);
    const descMatch = item.description.toLowerCase().includes(searchTerm);
    return nameMatch || descMatch;
  });

  // Return filtered data structure with only matching items
  // Categories array is unchanged - renderMenu will only show categories with matching items
  return {
    categories: categories,
    menuItems: filteredItems
  };
}

/**
 * Sets up the search input event listener
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) {
    console.error('Search input not found');
    return;
  }

  // Listen for input events (live search as user types)
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value;
    
    if (!query || query.trim() === '') {
      // Show full menu with categories when search is cleared
      renderMenu(originalMenuData, false);
    } else {
      // Show only matching items without categories when searching
      const filteredData = filterMenuData(query);
      renderMenu(filteredData, true);
    }
  });
}

/**
 * Sets up dark mode toggle functionality
 */
function setupDarkMode() {
  const toggleButton = document.getElementById('dark-mode-toggle');
  const htmlElement = document.documentElement;
  
  if (!toggleButton) {
    console.error('Dark mode toggle button not found');
    return;
  }

  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }

  // Toggle dark mode on button click
  toggleButton.addEventListener('click', function() {
    const isDark = htmlElement.classList.contains('dark');
    
    if (isDark) {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

