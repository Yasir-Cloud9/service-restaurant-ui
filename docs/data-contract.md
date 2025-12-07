# Data Contract – Restaurant Menu Web App

Tech context:
- **Frontend:** Static HTML + Tailwind CSS (CDN) + vanilla JavaScript  
- **Backend (later):** Spring Boot + SQLite

This document defines the shared data contract between frontend and backend.

---

## 1. Entities Overview

### Category
Represents a logical group of menu items shown under a heading on the website.  
Examples: **“Salads”**, **“Wraps”**, **“Drinks”**.  
Each category has a name, an optional description, and controls how items are grouped and ordered on the menu.

### MenuItem
Represents a single dish or product that can be shown and (later) ordered.  
Examples:
- **“Mediterranean Feta Salad”** – Mixed greens with feta, olives, cucumber, and lemon herb dressing.
- **“Grilled Chicken Wrap”** – Grilled chicken, lettuce, tomato, garlic mayo in a toasted wrap.

Each menu item belongs to exactly one category and has a name, description, and price in euros.

### AdminUser
Represents a user who can log into the admin panel to manage categories and items.  
Examples:
- The restaurant owner
- A manager or staff member who edits the menu

AdminUser is used only for authentication and admin actions; it is **not** shown in the public menu.

---

## 2. Fields per Entity

### 2.1 Category

| Field name   | Type    | Required? | Description                                                       |
|--------------|---------|-----------|-------------------------------------------------------------------|
| id           | number  | yes       | Unique identifier for the category (e.g. auto-increment in DB).   |
| name         | string  | yes       | Public name of the category (e.g. `"Salads"`, `"Wraps"`).         |
| description  | string  | no        | Optional short text shown under the category name.                |
| displayOrder | number  | yes       | Number used for sorting categories (lower = shown earlier).       |
| isActive     | boolean | yes       | If `false`, this category is hidden in the public menu.           |

---

### 2.2 MenuItem

| Field name   | Type    | Required? | Description                                                                |
|--------------|---------|-----------|----------------------------------------------------------------------------|
| id           | number  | yes       | Unique identifier for the menu item.                                       |
| categoryId   | number  | yes       | The `id` of the `Category` this item belongs to.                           |
| name         | string  | yes       | Name of the item (e.g. `"Mediterranean Feta Salad"`).                      |
| description  | string  | yes       | Short description of the item for the menu.                                |
| priceEuro    | number  | yes       | Price in euros (e.g. `8.50`).                                              |
| isAvailable  | boolean | yes       | If `false`, item is hidden or marked unavailable on the menu.              |
| isVegetarian | boolean | no        | Optional flag indicating if the item is vegetarian.                        |
| isVegan      | boolean | no        | Optional flag indicating if the item is vegan.                             |
| isSpicy      | boolean | no        | Optional flag indicating if the item is spicy.                             |
| displayOrder | number  | yes       | Number used to sort items within a category (lower = shown earlier).       |

---

### 2.3 AdminUser

| Field name    | Type    | Required? | Description                                                              |
|---------------|---------|-----------|--------------------------------------------------------------------------|
| id            | number  | yes       | Unique identifier for the admin user.                                    |
| email         | string  | yes       | Login email address (must be unique).                                    |
| passwordHash  | string  | yes       | Hashed password (never plain text).                                      |
| role          | string  | yes       | Role name (e.g. `"OWNER"`, `"ADMIN"`).                                   |
| isActive      | boolean | yes       | If `false`, the user cannot log in.                                      |
| createdAt     | string  | yes       | ISO timestamp when the user was created (e.g. `"2025-12-07T18:30:00Z"`). |
| updatedAt     | string  | yes       | ISO timestamp when the user was last updated.                            |
| lastLoginAt   | string  | no        | ISO timestamp of the last successful login (optional).                   |

> Note: For timestamps, the shared contract uses **ISO 8601 strings**.  
> SQLite can store them as `TEXT`, Java as `Instant`/`LocalDateTime`, JS as strings.

---

## 3. Relationships

- **Category → MenuItem**
  - **One Category has many MenuItems.**
  - Implemented by `MenuItem.categoryId` referencing `Category.id`.

- **MenuItem → Category**
  - **One MenuItem belongs to exactly one Category.**
  - Every `MenuItem` must have a valid `categoryId`.

- **AdminUser**
  - **AdminUser is separate** from menu data.
  - Used only for:
    - Authentication (login/logout)
    - Admin actions (create/edit/delete categories and menu items)
  - There is **no direct foreign key** from `Category` or `MenuItem` to `AdminUser` in this basic contract.

---

## 4. Sample Menu Data

Example data structure that follows the above fields.  
(This is valid JSON that both frontend and backend can use as a reference.)

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Salads",
      "description": "Fresh, light and made to order.",
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Wraps",
      "description": "Toasted wraps, perfect for lunch on the go.",
      "displayOrder": 2,
      "isActive": true
    }
  ],
  "menuItems": [
    {
      "id": 101,
      "categoryId": 1,
      "name": "Mediterranean Feta Salad",
      "description": "Mixed leaves with feta, cherry tomatoes, cucumber, olives and lemon herb dressing.",
      "priceEuro": 8.50,
      "isAvailable": true,
      "isVegetarian": true,
      "isVegan": false,
      "isSpicy": false,
      "displayOrder": 1
    },
    {
      "id": 102,
      "categoryId": 1,
      "name": "Grilled Chicken Caesar Salad",
      "description": "Crisp romaine, grilled chicken, parmesan, croutons and classic Caesar dressing.",
      "priceEuro": 9.20,
      "isAvailable": true,
      "isVegetarian": false,
      "isVegan": false,
      "isSpicy": false,
      "displayOrder": 2
    },
    {
      "id": 103,
      "categoryId": 1,
      "name": "Roasted Veg & Quinoa Salad",
      "description": "Warm quinoa with roasted seasonal vegetables, pumpkin seeds and balsamic glaze.",
      "priceEuro": 8.90,
      "isAvailable": true,
      "isVegetarian": true,
      "isVegan": true,
      "isSpicy": false,
      "displayOrder": 3
    },
    {
      "id": 201,
      "categoryId": 2,
      "name": "Grilled Chicken Wrap",
      "description": "Grilled chicken, lettuce, tomato and garlic mayo in a toasted tortilla.",
      "priceEuro": 7.95,
      "isAvailable": true,
      "isVegetarian": false,
      "isVegan": false,
      "isSpicy": false,
      "displayOrder": 1
    },
    {
      "id": 202,
      "categoryId": 2,
      "name": "Falafel & Hummus Wrap",
      "description": "Crispy falafel, hummus, mixed leaves and pickled red onion.",
      "priceEuro": 7.50,
      "isAvailable": true,
      "isVegetarian": true,
      "isVegan": true,
      "isSpicy": false,
      "displayOrder": 2
    },
    {
      "id": 203,
      "categoryId": 2,
      "name": "Spicy Halloumi Wrap",
      "description": "Grilled halloumi, spicy chili sauce, slaw and cucumber.",
      "priceEuro": 8.10,
      "isAvailable": true,
      "isVegetarian": true,
      "isVegan": false,
      "isSpicy": true,
      "displayOrder": 3
    }
  ],
  "adminUsers": [
    {
      "id": 1,
      "email": "owner@example.com",
      "passwordHash": "$2a$10$hashed-password-goes-here",
      "role": "OWNER",
      "isActive": true,
      "createdAt": "2025-12-07T18:30:00Z",
      "updatedAt": "2025-12-07T18:30:00Z",
      "lastLoginAt": "2025-12-07T18:45:00Z"
    }
  ]
}
