/**
 * menu-mock-data.js
 * 
 * This file contains mock menu data for categories and items.
 * The data structure follows the contract defined in docs/data-contract.md.
 * 
 * This file exposes a global object (e.g., window.menuData) that will be
 * consumed by app.js to render the menu interface.
 */

window.menuData = {
  categories: [
    {
      id: 1,
      name: "Salads",
      description: "Fresh, light and made to order",
      displayOrder: 1,
      isActive: true
    },
    {
      id: 2,
      name: "Wraps",
      description: "Toasted wraps, perfect for lunch on the go",
      displayOrder: 2,
      isActive: true
    }
  ],
  menuItems: [
    {
      id: 101,
      categoryId: 1,
      name: "Mediterranean Feta Salad",
      description: "Mixed leaves with feta, cherry tomatoes, cucumber, olives and lemon herb dressing",
      priceEuro: 8.50,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isSpicy: false,
      displayOrder: 1
    },
    {
      id: 102,
      categoryId: 1,
      name: "Grilled Chicken Caesar Salad",
      description: "Crisp romaine, grilled chicken, parmesan, croutons and classic Caesar dressing",
      priceEuro: 9.20,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isSpicy: false,
      displayOrder: 2
    },
    {
      id: 103,
      categoryId: 1,
      name: "Roasted Veg & Quinoa Salad",
      description: "Warm quinoa with roasted seasonal vegetables, pumpkin seeds and balsamic glaze",
      priceEuro: 8.90,
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isSpicy: false,
      displayOrder: 3
    },
    {
      id: 201,
      categoryId: 2,
      name: "Grilled Chicken Wrap",
      description: "Grilled chicken, lettuce, tomato and garlic mayo in a toasted tortilla",
      priceEuro: 7.95,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isSpicy: false,
      displayOrder: 1
    },
    {
      id: 202,
      categoryId: 2,
      name: "Falafel & Hummus Wrap",
      description: "Crispy falafel, hummus, mixed leaves and pickled red onion",
      priceEuro: 7.50,
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isSpicy: false,
      displayOrder: 2
    },
    {
      id: 203,
      categoryId: 2,
      name: "Spicy Halloumi Wrap",
      description: "Grilled halloumi, spicy chili sauce, slaw and cucumber",
      priceEuro: 8.10,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isSpicy: true,
      displayOrder: 3
    }
  ]
};

