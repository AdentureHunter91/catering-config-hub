import type { MenuPackage, MenuCellDish, MenuCell, MenuWeek, MenuDietPlan } from "@/types/menuPackage";

const dishPool: MenuCellDish[] = [
  { id: 1, name: "Owsianka z owocami", kcal: 320, protein: 12, fat: 8, carbs: 52, cost: 3.2, allergenIcons: ["🥛", "🌾"] },
  { id: 2, name: "Jajecznica na maśle", kcal: 380, protein: 22, fat: 28, carbs: 4, cost: 4.1, allergenIcons: ["🥚", "🥛"] },
  { id: 3, name: "Jabłko", kcal: 52, protein: 0.3, fat: 0.2, carbs: 14, cost: 1.0, allergenIcons: [] },
  { id: 4, name: "Marchewka (plasterki)", kcal: 41, protein: 0.9, fat: 0.2, carbs: 10, cost: 0.8, allergenIcons: [] },
  { id: 5, name: "Zupa pomidorowa", kcal: 180, protein: 5, fat: 6, carbs: 28, cost: 3.5, allergenIcons: ["🌾"] },
  { id: 6, name: "Krem z brokułów", kcal: 160, protein: 6, fat: 5, carbs: 22, cost: 4.0, allergenIcons: ["🥛"] },
  { id: 7, name: "Kurczak z ryżem", kcal: 520, protein: 38, fat: 14, carbs: 62, cost: 8.5, allergenIcons: [] },
  { id: 8, name: "Ryba z kaszą", kcal: 480, protein: 32, fat: 16, carbs: 54, cost: 9.2, allergenIcons: ["🐟"] },
  { id: 9, name: "Surówka z kapusty", kcal: 45, protein: 1.5, fat: 2, carbs: 6, cost: 1.5, allergenIcons: [] },
  { id: 10, name: "Kompot owocowy", kcal: 80, protein: 0, fat: 0, carbs: 20, cost: 1.2, allergenIcons: [] },
  { id: 11, name: "Budyń waniliowy", kcal: 150, protein: 4, fat: 5, carbs: 22, cost: 2.0, allergenIcons: ["🥛"] },
  { id: 12, name: "Makaron z sosem", kcal: 450, protein: 15, fat: 12, carbs: 72, cost: 6.0, allergenIcons: ["🌾"] },
  { id: 13, name: "Zupa dyniowa", kcal: 140, protein: 3, fat: 4, carbs: 24, cost: 3.8, allergenIcons: [] },
  { id: 14, name: "Pierogi ruskie", kcal: 420, protein: 14, fat: 16, carbs: 56, cost: 7.0, allergenIcons: ["🌾", "🥛"] },
  { id: 15, name: "Kanapka z serem", kcal: 280, protein: 12, fat: 14, carbs: 28, cost: 3.0, allergenIcons: ["🌾", "🥛"] },
];

const DAYS = 7;
const mealSlotIds = ["breakfast", "breakfast2", "lunch_soup", "lunch_main", "lunch_side", "snack", "dinner", "night"];

function randomDish(): MenuCellDish {
  return dishPool[Math.floor(Math.random() * dishPool.length)];
}

function generateWeek(weekIndex: number, inherited: boolean): MenuWeek {
  const cells: MenuCell[] = [];
  for (let d = 0; d < DAYS; d++) {
    for (const slotId of mealSlotIds) {
      cells.push({
        dayIndex: d,
        mealSlotId: slotId,
        dish: randomDish(),
        alternatives: [],
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
