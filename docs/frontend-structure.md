# Frontend Structure

Phase 1 uses a **single static page** (`index.html`) with **Tailwind via CDN** and **plain JavaScript**. All menu data is loaded from a **mock JS object** (no backend yet).

---

## 1. Folder & File Structure

Recommended project structure:

```text
project-root/
├─ docs/
│  ├─ data-contract.md
│  ├─ page-map-and-flows.md
│  └─ frontend-structure.md   ← this file
│
├─ assets/
│  ├─ css/
│  │  └─ custom.css           ← small custom styles on top of Tailwind
│  │
│  └─ js/
│     ├─ menu-mock-data.js    ← mock data matching data-contract.md
│     └─ app.js               ← all UI logic
│
└─ index.html                 ← single page (customer + admin sections)

index.html

Single HTML page for Phase 1.

Contains:

Customer menu section (public-facing menu with search and collapsible categories).

Admin section (mock admin table showing all items).

The two sections are both present in the DOM; visibility is toggled via JavaScript and Tailwind utility classes (e.g. adding/removing hidden).

assets/css/custom.css

Loaded after Tailwind in index.html.

Contains only light overrides/tweaks (e.g. font family, minor spacing or shadow adjustments).

No layout or large styling systems here; layout and responsiveness are handled by Tailwind utilities in the HTML.

assets/js/menu-mock-data.js

Defines a single global data structure (e.g. window.menuData) that:

Follows the entities and fields defined in docs/data-contract.md.

Contains arrays for categories, menuItems (and optionally adminUsers).

No DOM access or UI logic in this file; it is purely data.

assets/js/app.js

Contains all Phase 1 UI logic:

Reads window.menuData from menu-mock-data.js.

Renders customer menu (categories, items, and prices) into the appropriate container in index.html.

Implements collapsible categories (expand/collapse on click).

Implements live search filtering over item name/description.

Renders the admin table view from the same data.

Switches between customer and admin sections by toggling visibility classes on the relevant DOM elements.

2. Tailwind Setup (Phase 1)

Tailwind CSS is included via CDN directly in index.html:

No build tooling, no PostCSS, no Tailwind config file in Phase 1.

The CDN script is referenced in the <head> of index.html, before custom.css.

Responsive design and layout are implemented using Tailwind utility classes in the HTML:

Layout (e.g. flex, grid, gap-*, justify-between).

Spacing (e.g. p-*, m-*).

Typography (e.g. text-*, font-*).

Breakpoints (e.g. sm:, md:, lg:).

assets/css/custom.css is used only for small tweaks, such as:

Setting the base font stack.

Slightly adjusting card shadows or borders beyond what Tailwind provides easily.

Minor visual refinements that are awkward to express with utilities.

3. JavaScript Strategy

All DOM logic lives in assets/js/app.js:

app.js runs after the DOM is loaded.

It selects the main containers in index.html (customer view, admin view, search input, menu list root, admin table root).

It attaches event listeners for:

Search input changes.

Category header clicks (for collapse/expand).

View-switch buttons (customer vs admin).

assets/js/menu-mock-data.js exposes a single data structure:

Defines one global object (for example window.menuData) with:

categories: array of Category objects.

menuItems: array of MenuItem objects.

Optional adminUsers: array of AdminUser objects (even if not heavily used in Phase 1).

The shape of each object strictly follows the fields and types defined in docs/data-contract.md.

assets/js/app.js reads this data and renders both views dynamically:

On initialization:

Reads window.menuData.

Renders the customer menu:

Groups menuItems by categoryId and uses categories for headers.

Sorts categories and items by their displayOrder fields.

Respects flags such as isActive (for categories) and isAvailable (for items).

Renders the admin view:

Builds a table listing all items with their category name, description, and price.

During interaction:

Updates the DOM based on the current search term and view mode, without reloading the page or calling any backend.