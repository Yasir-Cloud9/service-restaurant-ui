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

// Read menu data on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.menuData) {
    console.log('Menu data loaded:', window.menuData);
    console.log('Categories:', window.menuData.categories);
    console.log('Menu items:', window.menuData.menuItems);
    
    // Render the menu
    renderMenu();
  } else {
    console.error('Menu data not found. Make sure menu-mock-data.js is loaded before app.js.');
  }
});

/**
 * Renders the menu from mock data
 */
function renderMenu() {
  const menuContainer = document.getElementById('menu-container');
  if (!menuContainer) {
    console.error('Menu container not found');
    return;
  }

  const { categories, menuItems } = window.menuData;

  // Sort categories by displayOrder
  const sortedCategories = [...categories]
    .filter(cat => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Clear container
  menuContainer.innerHTML = '';

  // Create a category section for each category
  sortedCategories.forEach(category => {
    // Get items for this category, sorted by displayOrder
    const categoryItems = menuItems
      .filter(item => item.categoryId === category.id && item.isAvailable)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Create category container
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'mb-4 border border-gray-200 rounded-lg overflow-hidden';

    // Create category header (clickable)
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors p-3 md:p-4 flex justify-between items-center';
    categoryHeader.setAttribute('data-category-id', category.id);
    
    const headerContent = document.createElement('div');
    const categoryName = document.createElement('h2');
    categoryName.className = 'text-lg md:text-xl font-bold text-gray-800';
    categoryName.textContent = category.name;
    
    headerContent.appendChild(categoryName);
    
    if (category.description) {
      const categoryDesc = document.createElement('p');
      categoryDesc.className = 'text-sm md:text-base text-gray-600 mt-1';
      categoryDesc.textContent = category.description;
      headerContent.appendChild(categoryDesc);
    }

    // Add expand/collapse icon
    const icon = document.createElement('span');
    icon.className = 'text-gray-600 text-xl';
    icon.textContent = '▶';
    icon.setAttribute('data-icon', category.id);

    categoryHeader.appendChild(headerContent);
    categoryHeader.appendChild(icon);

    // Create items container (initially hidden/collapsed)
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container hidden';
    itemsContainer.setAttribute('data-items', category.id);

    // Create menu items
    categoryItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'p-3 md:p-4 border-t border-gray-200';

      // Item name
      const itemName = document.createElement('h3');
      itemName.className = 'text-base md:text-lg font-semibold text-gray-900 mb-1';
      itemName.textContent = item.name;

      // Item description
      const itemDesc = document.createElement('p');
      itemDesc.className = 'text-sm md:text-base text-gray-600 mb-2';
      itemDesc.textContent = item.description;

      // Item price
      const itemPrice = document.createElement('p');
      itemPrice.className = 'text-base md:text-lg font-bold text-gray-900';
      itemPrice.textContent = `€${item.priceEuro.toFixed(2)}`;

      itemDiv.appendChild(itemName);
      itemDiv.appendChild(itemDesc);
      itemDiv.appendChild(itemPrice);
      itemsContainer.appendChild(itemDiv);
    });

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
 * Toggles the visibility of a category's items
 */
function toggleCategory(categoryId) {
  const itemsContainer = document.querySelector(`[data-items="${categoryId}"]`);
  const icon = document.querySelector(`[data-icon="${categoryId}"]`);

  if (!itemsContainer || !icon) return;

  // Toggle visibility
  if (itemsContainer.classList.contains('hidden')) {
    itemsContainer.classList.remove('hidden');
    icon.textContent = '▼';
  } else {
    itemsContainer.classList.add('hidden');
    icon.textContent = '▶';
  }
}

