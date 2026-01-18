# Frontend Structure

The frontend is a **static multi-page website** built with:

- **HTML (3 pages)**
- **Tailwind CSS via CDN**
- **Small custom CSS overrides**
- **Vanilla JavaScript**
- **Menu data loaded from Google Sheets (published endpoint)**

There is **no build step** (no bundler, no Tailwind compilation).  
The focus is **simplicity, speed, and easy deployment**.

---

## 1. Folder & File Structure

Current project structure:

```text
project-root/
├─ assets/
│  ├─ css/
│  │  └─ custom.css           ← small overrides on top of Tailwind
│  │
│  ├─ images/
│  │  ├─ authentic_food.jpg
│  │  ├─ flame.jpg
│  │  ├─ fresh_ingreds.jpg
│  │  ├─ homepage_background2.jpg
│  │  └─ main_image.jpg
│  │
│  └─ js/
│     ├─ config.js            ← shared config/constants
│     ├─ site.js              ← site-wide logic (theme, shared UI)
│     ├─ menu.js              ← menu page logic only
│     └─ menu-mock-data.js    ← optional local mock data (dev only)
│
├─ contact/
│  └─ index.html              ← Contact page
│
├─ docs/
│  ├─ data-contract.md
│  ├─ page-map-and-flows.md
│  └─ frontend-structure.md   ← this file
│
├─ menu/
│  └─ index.html              ← Menu page (QR points here)
│
├─ index.html                 ← Home page (landing)
└─ README.md
