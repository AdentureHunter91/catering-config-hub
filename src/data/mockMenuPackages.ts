import type { MenuPackage, MenuCellDish, MenuCell, MenuWeek, MenuDietPlan } from "@/types/menuPackage";

const dishPool: MenuCellDish[] = [
  { id: 1, name: "Owsianka z owocami", kcal: 320, protein: 12, fat: 8, saturatedFat: 2.5, carbs: 52, sugars: 18, salt: 0.3, fiber: 4.2, cost: 3.2, portionGrams: 295, allergenIcons: ["🥛", "🌾"],
    composition: [
      { name: "Owsianka na mleku", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU", "MLK"] },
      { name: "Mix owoców sezonowych", type: "recipe", portionLabel: "80g", allergenCodes: [] },
      { name: "Miód naturalny", type: "product", portionLabel: "15g", allergenCodes: [] },
    ] },
  { id: 2, name: "Jajecznica na maśle", kcal: 380, protein: 22, fat: 28, saturatedFat: 12, carbs: 4, sugars: 1, salt: 1.2, fiber: 0.5, cost: 4.1, portionGrams: 250, allergenIcons: ["🥚", "🥛"],
    composition: [
      { name: "Jajecznica klasyczna", type: "recipe", portionLabel: "180g", allergenCodes: ["JAJ", "MLK"] },
      { name: "Pieczywo pszenne", type: "product", portionLabel: "60g", allergenCodes: ["GLU"] },
      { name: "Masło extra", type: "product", portionLabel: "10g", allergenCodes: ["MLK"] },
    ] },
  { id: 3, name: "Jabłko", kcal: 52, protein: 0.3, fat: 0.2, saturatedFat: 0, carbs: 14, sugars: 10, salt: 0, fiber: 2.4, cost: 1.0, portionGrams: 150, allergenIcons: [],
    composition: [
      { name: "Jabłko świeże", type: "product", portionLabel: "150g", allergenCodes: [] },
    ] },
  { id: 4, name: "Marchewka (plasterki)", kcal: 41, protein: 0.9, fat: 0.2, saturatedFat: 0, carbs: 10, sugars: 5, salt: 0.1, fiber: 2.8, cost: 0.8, portionGrams: 120, allergenIcons: [],
    composition: [
      { name: "Marchewka gotowana", type: "recipe", portionLabel: "120g", allergenCodes: [] },
    ] },
  { id: 5, name: "Zupa pomidorowa", kcal: 180, protein: 5, fat: 6, saturatedFat: 2, carbs: 28, sugars: 8, salt: 1.5, fiber: 2, cost: 3.5, portionGrams: 365, allergenIcons: ["🌾"],
    composition: [
      { name: "Zupa pomidorowa z makaronem", type: "recipe", portionLabel: "350ml", allergenCodes: ["GLU"] },
      { name: "Śmietana 18%", type: "product", portionLabel: "15ml", allergenCodes: ["MLK"] },
    ] },
  { id: 6, name: "Krem z brokułów", kcal: 160, protein: 6, fat: 5, saturatedFat: 1.5, carbs: 22, sugars: 3, salt: 1.0, fiber: 3.5, cost: 4.0, portionGrams: 320, allergenIcons: ["🥛"],
    composition: [
      { name: "Krem brokułowy", type: "recipe", portionLabel: "300ml", allergenCodes: ["MLK"] },
      { name: "Grzanki pszenne", type: "product", portionLabel: "20g", allergenCodes: ["GLU"] },
    ] },
  { id: 7, name: "Kurczak z ryżem", kcal: 520, protein: 38, fat: 14, saturatedFat: 3.5, carbs: 62, sugars: 2, salt: 1.8, fiber: 1.5, cost: 8.5, portionGrams: 490, allergenIcons: [],
    composition: [
      { name: "Udo drobiowe gotowane", type: "recipe", portionLabel: "140g", allergenCodes: [] },
      { name: "Ryż biały", type: "recipe", portionLabel: "200g", allergenCodes: [] },
      { name: "Sok owocowy", type: "product", portionLabel: "100ml", allergenCodes: [] },
      { name: "Sos pieczeniowy", type: "recipe", portionLabel: "50ml", allergenCodes: ["GLU"] },
    ] },
  { id: 8, name: "Ryba z kaszą", kcal: 480, protein: 32, fat: 16, saturatedFat: 3, carbs: 54, sugars: 1, salt: 1.4, fiber: 3, cost: 9.2, portionGrams: 340, allergenIcons: ["🐟"],
    composition: [
      { name: "Filet z dorsza pieczony", type: "recipe", portionLabel: "150g", allergenCodes: ["RYB"] },
      { name: "Kasza gryczana", type: "recipe", portionLabel: "180g", allergenCodes: [] },
      { name: "Masło klarowane", type: "product", portionLabel: "10g", allergenCodes: ["MLK"] },
    ] },
  { id: 9, name: "Surówka z kapusty", kcal: 45, protein: 1.5, fat: 2, saturatedFat: 0.3, carbs: 6, sugars: 3, salt: 0.5, fiber: 2, cost: 1.5, portionGrams: 120, allergenIcons: [],
    composition: [
      { name: "Surówka z kapusty białej", type: "recipe", portionLabel: "120g", allergenCodes: [] },
    ] },
  { id: 10, name: "Kompot owocowy", kcal: 80, protein: 0, fat: 0, saturatedFat: 0, carbs: 20, sugars: 18, salt: 0, fiber: 0.5, cost: 1.2, portionGrams: 200, allergenIcons: [],
    composition: [
      { name: "Kompot wieloowocowy", type: "recipe", portionLabel: "200ml", allergenCodes: [] },
    ] },
  { id: 11, name: "Budyń waniliowy", kcal: 150, protein: 4, fat: 5, saturatedFat: 3, carbs: 22, sugars: 16, salt: 0.2, fiber: 0, cost: 2.0, portionGrams: 180, allergenIcons: ["🥛"],
    composition: [
      { name: "Budyń waniliowy na mleku", type: "recipe", portionLabel: "180g", allergenCodes: ["MLK"] },
    ] },
  { id: 12, name: "Makaron z sosem", kcal: 450, protein: 15, fat: 12, saturatedFat: 4, carbs: 72, sugars: 6, salt: 2.0, fiber: 3, cost: 6.0, portionGrams: 350, allergenIcons: ["🌾"],
    composition: [
      { name: "Makaron penne", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU"] },
      { name: "Sos bolognese", type: "recipe", portionLabel: "150g", allergenCodes: ["SLR"] },
    ] },
  { id: 13, name: "Zupa dyniowa", kcal: 140, protein: 3, fat: 4, saturatedFat: 1, carbs: 24, sugars: 8, salt: 0.8, fiber: 3, cost: 3.8, portionGrams: 310, allergenIcons: [],
    composition: [
      { name: "Krem z dyni", type: "recipe", portionLabel: "300ml", allergenCodes: [] },
      { name: "Pestki dyni", type: "product", portionLabel: "10g", allergenCodes: [] },
    ] },
  { id: 14, name: "Pierogi ruskie", kcal: 420, protein: 14, fat: 16, saturatedFat: 7, carbs: 56, sugars: 3, salt: 1.6, fiber: 2, cost: 7.0, portionGrams: 310, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pierogi ruskie (ciasto + farsz)", type: "recipe", portionLabel: "250g", allergenCodes: ["GLU", "MLK"] },
      { name: "Cebula smażona", type: "recipe", portionLabel: "30g", allergenCodes: [] },
      { name: "Śmietana 18%", type: "product", portionLabel: "30ml", allergenCodes: ["MLK"] },
    ] },
  { id: 15, name: "Kanapka z serem", kcal: 280, protein: 12, fat: 14, saturatedFat: 8, carbs: 28, sugars: 2, salt: 1.5, fiber: 2.5, cost: 3.0, portionGrams: 150, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pieczywo żytnie", type: "product", portionLabel: "80g", allergenCodes: ["GLU"] },
      { name: "Ser żółty gouda", type: "product", portionLabel: "40g", allergenCodes: ["MLK"] },
      { name: "Masło extra", type: "product", portionLabel: "10g", allergenCodes: ["MLK"] },
      { name: "Sałata zielona", type: "product", portionLabel: "20g", allergenCodes: [] },
    ] },
];

const DAYS = 7;
const mealSlotIds = ["breakfast", "breakfast2", "lunch_soup", "lunch_main", "lunch_side", "snack", "dinner", "night"];

function randomDish(): MenuCellDish {
  return { ...dishPool[Math.floor(Math.random() * dishPool.length)] };
}

function generateWeek(weekIndex: number, inherited: boolean, daysInCycle: number = 7): MenuWeek {
  const cells: MenuCell[] = [];
  for (let d = 0; d < daysInCycle; d++) {
    for (const slotId of mealSlotIds) {
      cells.push({
        dayIndex: d,
        mealSlotId: slotId,
        dishes: [randomDish()],
        inherited,
        overridden: false,
      });
    }
  }
  return { weekIndex, cells };
}

function makeDietPlan(dietId: number, name: string, code: string, type: "base" | "derived", baseCode: string | null, weeks: number): MenuDietPlan {
  return {
    dietId,
    dietName: name,
    dietCode: code,
    dietType: type,
    baseDietCode: baseCode,
    weeks: Array.from({ length: weeks }, (_, i) => generateWeek(i, type === "derived")),
  };
}

export const mockMenuPackages: MenuPackage[] = [
  {
    id: 1,
    name: "Menu Luty 2026 — Szpital Miejski",
    clientId: 4,
    clientName: "Szpital Miejski w Nidzicy",
    periodFrom: "2026-02-01",
    periodTo: "2026-02-28",
    cycle: "7",
    tags: ["winter", "budget"],
    status: "active",
    avgDailyCost: 48.5,
    dietPlans: [
      makeDietPlan(1, "Dieta Podstawowa", "STANDARD", "base", null, 4),
      makeDietPlan(2, "Dieta Bezglutenowa", "GF", "derived", "STANDARD", 4),
      makeDietPlan(3, "Dieta Cukrzycowa", "DIABETIC", "derived", "STANDARD", 4),
      makeDietPlan(4, "Dieta Renalna", "RENAL", "derived", "STANDARD", 4),
    ],
    createdAt: "2026-01-20",
    updatedAt: "2026-02-10",
  },
  {
    id: 2,
    name: "Menu Luty 2026 — Przedszkole Słoneczko",
    clientId: 5,
    clientName: "Przedszkole Słoneczko",
    periodFrom: "2026-02-03",
    periodTo: "2026-02-28",
    cycle: "14",
    tags: ["winter"],
    status: "draft",
    avgDailyCost: 22.3,
    dietPlans: [
      makeDietPlan(5, "Dieta Przedszkolna", "PED", "base", null, 2),
      makeDietPlan(6, "Dieta Przedszkolna BG", "PED_GF", "derived", "PED", 2),
    ],
    createdAt: "2026-01-25",
    updatedAt: "2026-02-05",
  },
];
