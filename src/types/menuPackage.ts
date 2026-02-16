export type MenuPackageStatus = "draft" | "active" | "approved" | "archived";

export const MENU_PACKAGE_STATUS_LABELS: Record<MenuPackageStatus, string> = {
  draft: "Szkic",
  active: "Aktywny",
  approved: "Zatwierdzony",
  archived: "Archiwizowany",
};

export const MENU_PACKAGE_STATUS_COLORS: Record<MenuPackageStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  approved: "bg-blue-100 text-blue-800",
  archived: "bg-muted text-muted-foreground",
};

export type CycleType = "7" | "10" | "14" | "30" | "custom";

export const CYCLE_LABELS: Record<CycleType, string> = {
  "7": "7-dniowy",
  "10": "10-dniowy",
  "14": "14-dniowy",
  "30": "Miesięczny",
  custom: "Niestandardowy",
};

export interface MenuCellCompositionItem {
  name: string;
  type: "recipe" | "product";
  portionLabel: string;
  allergenCodes: string[];
}

export interface MenuCellDish {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  sugars: number;
  salt: number;
  fiber: number;
  cost: number;
  allergenIcons: string[];
  variant?: string;
  portionGrams: number;
  composition?: MenuCellCompositionItem[];
}

export interface MenuCell {
  dayIndex: number;
  mealSlotId: string;
  dishes: MenuCellDish[];
  inherited: boolean;
  overridden: boolean;
}

export interface MenuWeek {
  weekIndex: number;
  cells: MenuCell[];
}

export interface MenuDietPlan {
  dietId: number;
  dietName: string;
  dietCode: string;
  dietType: "base" | "derived";
  baseDietCode: string | null;
  weeks: MenuWeek[];
}

export interface MenuPackage {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  periodFrom: string;
  periodTo: string;
  cycle: CycleType;
  customCycleDays?: number;
  status: MenuPackageStatus;
  avgDailyCost: number;
  dietPlans: MenuDietPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface MealSlotDef {
  id: string;
  name: string;
  shortName: string;
  sortOrder: number;
  subSlots?: { id: string; name: string }[];
}

export const DEFAULT_MEAL_SLOTS: MealSlotDef[] = [
  { id: "breakfast", name: "Śniadanie", shortName: "ŚN", sortOrder: 1 },
  { id: "breakfast2", name: "II Śniadanie", shortName: "IIŚ", sortOrder: 2 },
  {
    id: "lunch", name: "Obiad", shortName: "OB", sortOrder: 3,
    subSlots: [
      { id: "lunch_soup", name: "Zupa" },
      { id: "lunch_main", name: "Drugie" },
      { id: "lunch_side", name: "Dodatek" },
    ],
  },
  { id: "snack", name: "Podwieczorek", shortName: "PDW", sortOrder: 4 },
  { id: "dinner", name: "Kolacja", shortName: "KL", sortOrder: 5 },
  { id: "night", name: "Posiłek nocny", shortName: "PN", sortOrder: 6 },
];

export interface NutritionBar {
  label: string;
  current: number;
  target: number;
  unit: string;
}
