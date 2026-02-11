import { Dish } from "@/types/dish";

export const MOCK_DISHES: Dish[] = [
  {
    id: 1,
    name: "Zupa ogórkowa",
    category: "soup",
    status: "active",
    description: "Tradycyjna zupa ogórkowa na bulionie drobiowym z koperkiem.",
    standardPortion: 350,
    composition: [
      { id: "c1", type: "recipe", referenceId: 10, name: "Zupa ogórkowa (receptura)", portionGrams: 300, role: "main", kcal: 185, protein: 8, fat: 6, carbs: 22, cost: 2.80 },
      { id: "c2", type: "product", referenceId: 106, name: "Koperek świeży", portionGrams: 5, role: "side", kcal: 2, protein: 0.2, fat: 0, carbs: 0.3, cost: 0.10 },
    ],
    variants: [
      { id: "v1", name: "Zupa ogórkowa" },
      { id: "v2", name: "Zupa ogórkowa bez glutenu" },
      { id: "v3", name: "Zupa ogórkowa bez laktozy" },
    ],
    exclusions: [
      {
        id: "e1", name: "Bezglutenowe", enabled: true,
        substitutions: [
          { id: "s1", originalIngredient: "Makaron pszenny", replacement: "Makaron bezglutenowy", status: "auto" },
        ],
      },
      {
        id: "e2", name: "Bez mleczarstwa", enabled: true,
        substitutions: [
          { id: "s2", originalIngredient: "Śmietana 18%", replacement: "Śmietanka kokosowa", status: "manual" },
        ],
      },
      { id: "e3", name: "Bez orzechów", enabled: false, substitutions: [] },
    ],
    portionTemplates: [
      { id: "p1", name: "Standard dorosły", grams: 350, coefficient: 1.0, mode: "base" },
      { id: "p2", name: "Pediatryczny", grams: 200, coefficient: 0.57, mode: "auto_scale" },
      { id: "p3", name: "Wysokokaloryczny", grams: 450, coefficient: 1.29, mode: "auto_scale" },
    ],
    productionVersionActive: false,
    allergens: [
      { name: "Seler", icon: "🥬", status: "contains" },
      { name: "Gluten", icon: "🌾", status: "may_contain" },
      { name: "Laktoza", icon: "🥛", status: "contains" },
    ],
    kcalTotal: 187, proteinTotal: 8.2, fatTotal: 6, carbsTotal: 22.3, costTotal: 2.90,
    version: "v1.2", createdAt: "2025-01-10", updatedAt: "2025-08-15",
  },
  {
    id: 2,
    name: "Pierś z kurczaka z ryżem i sosem",
    category: "main_hot",
    status: "active",
    description: "Grillowana pierś z kurczaka, ryż basmati, sos pieczarkowy.",
    standardPortion: 400,
    composition: [
      { id: "c3", type: "recipe", referenceId: 2, name: "Pierś z kurczaka z ryżem i sosem pieczarkowym", portionGrams: 350, role: "main", kcal: 452, protein: 35, fat: 18, carbs: 42, cost: 6.22 },
      { id: "c4", type: "recipe", referenceId: 5, name: "Sos pieczarkowy", portionGrams: 50, role: "sauce", kcal: 45, protein: 2, fat: 3, carbs: 4, cost: 0.80 },
    ],
    variants: [
      { id: "v4", name: "Pierś z kurczaka z ryżem i sosem" },
      { id: "v5", name: "Pierś z kurczaka z ryżem (bez sosu, bezglutenowe)" },
    ],
    exclusions: [
      {
        id: "e4", name: "Bezglutenowe", enabled: true,
        substitutions: [
          { id: "s3", originalIngredient: "Mąka pszenna (sos)", replacement: "Mąka kukurydziana", status: "auto" },
        ],
      },
      {
        id: "e5", name: "Bez mleczarstwa", enabled: true,
        substitutions: [
          { id: "s4", originalIngredient: "Masło", replacement: "Olej rzepakowy", status: "auto" },
          { id: "s5", originalIngredient: "Mleko 2%", replacement: "Mleko owsiane", status: "manual" },
        ],
      },
    ],
    portionTemplates: [
      { id: "p4", name: "Standard dorosły", grams: 400, coefficient: 1.0, mode: "base" },
      { id: "p5", name: "Pediatryczny", grams: 250, coefficient: 0.63, mode: "auto_scale" },
      { id: "p6", name: "Wysokokaloryczny", grams: 550, coefficient: 1.38, mode: "auto_scale" },
      { id: "p7", name: "Dieta miękka", grams: 400, coefficient: 1.0, mode: "manual" },
    ],
    productionVersionActive: true,
    allergens: [
      { name: "Gluten", icon: "🌾", status: "contains" },
      { name: "Laktoza", icon: "🥛", status: "contains" },
    ],
    kcalTotal: 497, proteinTotal: 37, fatTotal: 21, carbsTotal: 46, costTotal: 7.02,
    version: "v1.3", createdAt: "2025-02-01", updatedAt: "2025-09-10",
  },
  {
    id: 3,
    name: "Kotlet schabowy z ziemniakami i surówką",
    category: "main_hot",
    status: "active",
    description: "Klasyczny kotlet schabowy w panierce, ziemniaki z koperkiem, surówka z kapusty.",
    standardPortion: 450,
    composition: [
      { id: "c5", type: "recipe", referenceId: 3, name: "Kotlet schabowy z ziemniakami i surówką", portionGrams: 350, role: "main", kcal: 520, protein: 32, fat: 28, carbs: 38, cost: 6.50 },
      { id: "c6", type: "recipe", referenceId: 8, name: "Surówka z kapusty", portionGrams: 100, role: "side", kcal: 42, protein: 1.5, fat: 0.2, carbs: 8.5, cost: 0.55 },
    ],
    variants: [
      { id: "v6", name: "Kotlet schabowy z ziemniakami i surówką" },
      { id: "v7", name: "Kotlet schabowy bezglutenowy" },
    ],
    exclusions: [
      {
        id: "e6", name: "Bezglutenowe", enabled: true,
        substitutions: [
          { id: "s6", originalIngredient: "Bułka tarta", replacement: "Bułka tarta bezglutenowa", status: "auto" },
          { id: "s7", originalIngredient: "Mąka pszenna", replacement: "Mąka ryżowa", status: "auto" },
        ],
      },
    ],
    portionTemplates: [
      { id: "p8", name: "Standard dorosły", grams: 450, coefficient: 1.0, mode: "base" },
      { id: "p9", name: "Pediatryczny", grams: 280, coefficient: 0.62, mode: "auto_scale" },
    ],
    productionVersionActive: false,
    allergens: [
      { name: "Gluten", icon: "🌾", status: "contains" },
      { name: "Jaja", icon: "🥚", status: "contains" },
    ],
    kcalTotal: 562, proteinTotal: 33.5, fatTotal: 28.2, carbsTotal: 46.5, costTotal: 7.05,
    version: "v2.0", createdAt: "2024-11-20", updatedAt: "2025-08-01",
  },
  {
    id: 4,
    name: "Sałatka grecka",
    category: "main_cold",
    status: "active",
    description: "Sałatka z pomidorów, ogórka, fety, oliwek z dressingiem z oliwy.",
    standardPortion: 250,
    composition: [
      { id: "c7", type: "recipe", referenceId: 6, name: "Sałatka grecka", portionGrams: 250, role: "main", kcal: 210, protein: 8, fat: 16, carbs: 10, cost: 4.50 },
    ],
    variants: [
      { id: "v8", name: "Sałatka grecka" },
      { id: "v9", name: "Sałatka grecka wegańska (bez fety)" },
    ],
    exclusions: [
      {
        id: "e7", name: "Bez mleczarstwa", enabled: true,
        substitutions: [
          { id: "s8", originalIngredient: "Feta", replacement: "Tofu wędzone", status: "manual" },
        ],
      },
    ],
    portionTemplates: [
      { id: "p10", name: "Standard dorosły", grams: 250, coefficient: 1.0, mode: "base" },
      { id: "p11", name: "Pediatryczny", grams: 150, coefficient: 0.6, mode: "auto_scale" },
    ],
    productionVersionActive: false,
    allergens: [
      { name: "Laktoza", icon: "🥛", status: "contains" },
    ],
    kcalTotal: 210, proteinTotal: 8, fatTotal: 16, carbsTotal: 10, costTotal: 4.50,
    version: "v1.1", createdAt: "2025-04-05", updatedAt: "2025-06-20",
  },
  {
    id: 5,
    name: "Kompot z jabłek",
    category: "drink",
    status: "draft",
    description: "Lekko słodzony kompot z jabłek.",
    standardPortion: 200,
    composition: [
      { id: "c8", type: "recipe", referenceId: 7, name: "Kompot z jabłek", portionGrams: 200, role: "main", kcal: 85, protein: 0.3, fat: 0, carbs: 22, cost: 0.90 },
    ],
    variants: [
      { id: "v10", name: "Kompot z jabłek" },
    ],
    exclusions: [],
    portionTemplates: [
      { id: "p12", name: "Standard", grams: 200, coefficient: 1.0, mode: "base" },
    ],
    productionVersionActive: false,
    allergens: [],
    kcalTotal: 85, proteinTotal: 0.3, fatTotal: 0, carbsTotal: 22, costTotal: 0.90,
    version: "v0.2", createdAt: "2025-08-15", updatedAt: "2025-08-15",
  },
  {
    id: 6,
    name: "Budyń waniliowy",
    category: "dessert",
    status: "draft",
    description: "Kremowy budyń waniliowy z mlekiem.",
    standardPortion: 150,
    composition: [
      { id: "c9", type: "product", referenceId: 140, name: "Mleko 2%", portionGrams: 120, role: "main", kcal: 60, protein: 4, fat: 2.4, carbs: 6, cost: 0.36 },
      { id: "c10", type: "product", referenceId: 141, name: "Budyń w proszku waniliowy", portionGrams: 20, role: "side", kcal: 75, protein: 0.3, fat: 0.1, carbs: 18, cost: 0.15 },
      { id: "c11", type: "product", referenceId: 127, name: "Cukier", portionGrams: 10, role: "side", kcal: 40, protein: 0, fat: 0, carbs: 10, cost: 0.03 },
    ],
    variants: [
      { id: "v11", name: "Budyń waniliowy" },
      { id: "v12", name: "Budyń waniliowy bez laktozy" },
    ],
    exclusions: [
      {
        id: "e8", name: "Bez mleczarstwa", enabled: true,
        substitutions: [
          { id: "s9", originalIngredient: "Mleko 2%", replacement: "Mleko owsiane", status: "auto" },
        ],
      },
    ],
    portionTemplates: [
      { id: "p13", name: "Standard", grams: 150, coefficient: 1.0, mode: "base" },
      { id: "p14", name: "Pediatryczny", grams: 100, coefficient: 0.67, mode: "auto_scale" },
    ],
    productionVersionActive: false,
    allergens: [
      { name: "Laktoza", icon: "🥛", status: "contains" },
      { name: "Gluten", icon: "🌾", status: "may_contain" },
    ],
    kcalTotal: 175, proteinTotal: 4.3, fatTotal: 2.5, carbsTotal: 34, costTotal: 0.54,
    version: "v0.1", createdAt: "2025-09-01", updatedAt: "2025-09-01",
  },
];
