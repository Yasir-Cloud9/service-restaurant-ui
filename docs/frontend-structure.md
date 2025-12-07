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