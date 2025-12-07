# Page Map and Flows – Phase 1 (Static Frontend)

Tech context (Phase 1):
- **Frontend:** Static HTML + Tailwind CSS (CDN) + vanilla JavaScript
- **Data:** In-memory mock JS object only
- **Backend:** None yet (planned: Spring Boot + SQLite in later phase)

This document maps the main pages/sections and how they use the entities defined in `docs/data-contract.md`.

---

## 1. Pages and Sections (Phase 1)

### 1.1 Customer Menu View (Public)

**Purpose**

- Show the restaurant menu to customers in a clear, mobile-friendly layout.
- Allow users to:
  - See menu categories (e.g. **“Salads”**, **“Wraps”**).
  - Expand/collapse categories.
  - View item names, descriptions, and prices.
  - Use a **live search** to filter dishes by text (e.g. “chicken”).

**Key UI Components**

1. **Header / Branding (optional)**
   - Simple site header with restaurant name/logo.
   - Not tied to any specific entity.

2. **Search Bar**
   - Single text input at the top of the menu section.
   - Behavior:
     - As the user types, menu items are filtered in real time.
     - Filter by `MenuItem.name` and `MenuItem.description`.
     - Matching is case-insensitive and substring-based (e.g. typing `chicken` matches “Grilled Chicken Wrap”).
   - Can be implemented as:
     - `<input type="text" placeholder="Search dishes (e.g. chicken)..." />`

3. **Category List (Collapsible)**
   - Vertical list of categories.
   - Each category is a **collapsible section**:
     - **Category header row**:
       - Shows `Category.name`.
       - May optionally show `Category.description`.
       - Includes an expand/collapse icon or indicator (e.g. “+ / −” or arrow).
     - **Category body (content area)**:
       - Contains the list of `MenuItem`s belonging to that category.
       - Hidden when collapsed.
   - Ordering:
     - Categories rendered sorted by `Category.displayOrder` ascending.
     - Only categories where `Category.isActive === true` are displayed.

4. **Menu Item Cards/Rows (inside each Category)**
   - Each visible item is shown as a card or row.
   - Basic layout:
     - **Name**: bold or slightly larger text (`MenuItem.name`).
     - **Description**: smaller text directly under the name (`MenuItem.description`).
     - **Price**: formatted with euro symbol (e.g. `€8.50` from `MenuItem.priceEuro`).
   - Optional tags (if used in UI later):
     - Vegetarian / vegan / spicy badges based on:
       - `MenuItem.isVegetarian`
       - `MenuItem.isVegan`
       - `MenuItem.isSpicy`
   - Filtering rules:
     - Items are shown only if:
       - `MenuItem.isAvailable === true`
       - The item’s `categoryId` matches the current category.
       - The item matches the current search query (if any).
   - Ordering:
     - Items inside a category sorted by `MenuItem.displayOrder` ascending.

5. **Empty/Error States**
   - If search query hides all items:
     - Show a small message: “No dishes found for ‘chicken’. Try another search.”
   - If a category has no visible items (after filtering or due to availability):
     - Either hide the category body or show a small note like “No items available in this category”.

**Entity / Field Dependencies**

- **Category**
  - `id` – Used to group items and for JS data mapping.
  - `name` – Shown as category header text.
  - `description` – Optional text under category name.
  - `displayOrder` – Used to sort categories.
  - `isActive` – Used to include/exclude categories in the public view.

- **MenuItem**
  - `id` – Used for JS keys / DOM data attributes.
  - `categoryId` – Used to group items under the correct category.
  - `name` – Displayed as item title; used in search.
  - `description` – Displayed under the name; used in search.
  - `priceEuro` – Displayed as the price (formatted with `€`).
  - `isAvailable` – Controls whether the item is shown.
  - `isVegetarian`, `isVegan`, `isSpicy` – Optional visual tags/badges (if you choose to show them).
  - `displayOrder` – Used to sort items within each category.

- **AdminUser**
  - **Not used** in the public Customer Menu View in Phase 1.

---

### 1.2 Admin View (Mock – Phase 1)

**Purpose**

- Provide a **simple internal view** to inspect menu data during Phase 1.
- No real login yet; this is only a visual, “developer/admin-only” page.
- Used to verify that:
  - Data loaded from the mock JS object matches the contract.
  - All items and categories are visible and correctly linked.

**Key UI Components**

1. **Admin Header / Toggle**
   - A simple way to access the admin view, for example:
     - A link/button from the main page (e.g. “Admin View (Mock)”).
     - Or a separate HTML page (`/admin.html`).
   - No authentication in Phase 1; it’s just a different route or section.

2. **Admin Menu Items Table**
   - Single table listing **all** menu items (no collapsible categories).
   - Columns (minimum):
     - Category Name
     - Item Name
     - Description
     - Price (€)
   - Recommended extra columns:
     - `isAvailable` (e.g. “Yes/No”)
     - `isVegetarian`, `isVegan`, `isSpicy` (e.g. “✓” or empty)
     - `displayOrder` (to debug ordering)
   - Sorting:
     - You may sort by category name, then by item `displayOrder`.
   - Data:
     - Derived from the **same JS data structure** used in the Customer Menu View.

3. **Optional Category Summary Table (if you want)**
   - Separate table listing categories:
     - Category ID
     - Name
     - Description
     - displayOrder
     - isActive

**Entity / Field Dependencies**

- **Category**
  - `id` – To look up the category for each item.
  - `name` – For the “Category” column in the items table.
  - `description`, `displayOrder`, `isActive` – Useful in a category summary table.

- **MenuItem**
  - `id` – For internal keys/HTML row IDs.
  - `categoryId` – To join each item with its category.
  - `name` – “Item Name” column.
  - `description` – “Description” column.
  - `priceEuro` – “Price” column, formatted as `€X.XX`.
  - `isAvailable` – “Available?” column.
  - `isVegetarian`, `isVegan`, `isSpicy` – Optional indicator columns.
  - `displayOrder` – Helpful for debugging order in the UI.

- **AdminUser**
  - **Not actually used** in Phase 1 (no real auth).
  - The Admin View is just a separate page/section that pretends to be an admin screen.

---

## 2. User Flows

### 2.1 Customer Flow (Public Menu)

1. **Open Site**
   - User visits the main URL (e.g. `/index.html`).
   - The page loads the mock data object (Categories and MenuItems).
   - JS initializes the UI:
     - Sorts categories by `displayOrder`.
     - Renders categories that have `isActive === true`.

2. **See Categories**
   - User sees category headers such as:
     - “Salads”
     - “Wraps”
   - By default, categories can either:
     - Start **expanded**, or
     - Start **collapsed** (you choose, but be consistent).

3. **Expand a Category**
   - User clicks a category header (e.g. “Salads”).
   - JS toggles the collapsed/expanded state for that category.
   - The category’s item list becomes visible:
     - Items are filtered to those with `categoryId === category.id`.
     - Only items where `isAvailable === true` are shown.
     - Items are sorted by `displayOrder`.

4. **Read Items**
   - For each visible item, user sees:
     - Name (e.g. “Grilled Chicken Caesar Salad”).
     - Description.
     - Price in euros (e.g. `€9.20`).
   - Optional tags (veg/vegan/spicy) may appear next to the name or price.

5. **Use Search**
   - User types a query into the search input at the top (e.g. `chicken`).
   - As they type, the UI:
     - Filters `MenuItem`s across **all categories** based on:
       - `MenuItem.name` contains query (case-insensitive) OR
       - `MenuItem.description` contains query.
     - Only matching items remain visible.
     - Categories with **no matching items** may:
       - Collapse automatically, or
       - Show “No items found in this category” (your choice, but be consistent).
   - Clearing the search:
     - Restores the full list of items (subject to `isAvailable` and `isActive`).

6. **Continue Browsing**
   - User can:
     - Change the search term.
     - Expand/collapse other categories.
     - Scroll and read more dishes.
   - No ordering or cart functionality in Phase 1.

---

### 2.2 Admin Flow (Phase 1 Mock)

1. **Switch to Admin View**
   - From the main menu page, the user (you or staff) clicks an “Admin View (Mock)” link or navigates directly to `/admin.html`.
   - The Admin View loads the **same mock JS data** as the customer view.

2. **View Items Table**
   - A single table is rendered with one row per `MenuItem`.
   - For each row, at minimum, the user sees:
     - Category Name (from `Category.name` via `MenuItem.categoryId`)
     - Item Name (`MenuItem.name`)
     - Description (`MenuItem.description`)
     - Price (`MenuItem.priceEuro` formatted with `€`)
   - Optionally, the row may also show:
     - `isAvailable`, `isVegetarian`, `isVegan`, `isSpicy`
     - `displayOrder`

3. **Inspect Data**
   - The admin can quickly scan:
     - Whether every item is tied to the correct category.
     - Whether descriptions and prices look correct.
     - Whether availability flags are set as expected.
   - No create/edit/delete controls in Phase 1; this is **read-only**.

4. **(Optional) Category Summary**
   - Admin can also see a short table with all categories:
     - ID, Name, Description, displayOrder, isActive.
   - Helps verify which categories are expected to be visible on the customer view.

---

## 3. Phase 1 Data Source

- In **Phase 1**, **all data comes from a mock JavaScript object** defined in the browser (e.g. a `menuData` constant in a `.js` file).
- There is **no backend** call, no API, and no database yet.
- The mock data structure must follow the same shape as the data contract in `docs/data-contract.md`, for example:

  - `menuData.categories` → array of `Category` objects.
  - `menuData.menuItems` → array of `MenuItem` objects.

- Both:
  - The **Customer Menu View**, and
  - The **Admin View (mock)**  
  will read from this **single source of truth**.

This ensures that when the backend (Spring Boot + SQLite) is added later, the API can return data in the same structure and the UI logic will not need major changes.
