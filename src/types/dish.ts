export type DishCategory = "soup" | "main_hot" | "main_cold" | "side_dish" | "dessert" | "drink" | "snack";
export type DishStatus = "draft" | "active" | "archived";

export const DISH_CATEGORY_LABELS: Record<DishCategory, string> = {
  soup: "Zupa",
  main_hot: "Danie główne gorące",
  main_cold: "Danie główne zimne",
  side_dish: "Dodatek",
  dessert: "Deser",
  drink: "Napój",
  snack: "Przekąska",
};

export const DISH_STATUS_LABELS: Record<DishStatus, string> = {
  draft: "Szkic",
  active: "Aktywne",
  archived: "Archiwizowane",
};

export const DISH_STATUS_COLORS: Record<DishStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-muted text-muted-foreground",
};

export type CompositionRole = "main" | "side" | "sauce";

export const COMPOSITION_ROLE_LABELS: Record<CompositionRole, string> = {
  main: "Główna",
  side: "Dodatek",
  sauce: "Sos",
};

export interface DishCompositionItem {
  id: string;
  type: "recipe" | "product";
  referenceId: number;
  name: string;
  portionGrams: number;
  role: CompositionRole;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  cost: number;
}

export interface DietaryExclusion {
  id: string;
  name: string;
  enabled: boolean;
  substitutions: DietarySubstitution[];
}

export interface DietarySubstitution {
  id: string;
  originalIngredient: string;
  replacement: string;
  status: "auto" | "manual" | "missing";
}

export interface PortionTemplate {
  id: string;
  name: string;
  grams: number;
  coefficient: number;
  mode: "base" | "auto_scale" | "manual";
}

export interface AllergenEntry {
  name: string;
  icon: string;
  status: "contains" | "may_contain" | "free";
}

export interface DishVariant {
  id: string;
  name: string;
}

export interface Dish {
  id: number;
  name: string;
  category: DishCategory;
  status: DishStatus;
  description: string;
  standardPortion: number;
  composition: DishCompositionItem[];
  variants: DishVariant[];
  exclusions: DietaryExclusion[];
  portionTemplates: PortionTemplate[];
  productionVersionActive: boolean;
  allergens: AllergenEntry[];
  kcalTotal: number;
  proteinTotal: number;
  fatTotal: number;
  carbsTotal: number;
  costTotal: number;
  version: string;
  createdAt: string;
  updatedAt: string;
}
