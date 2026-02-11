export type RecipeCategory = "soup" | "main_course" | "sauce" | "side_dish" | "dessert" | "salad" | "appetizer";
export type RecipeStatus = "draft" | "active" | "archived";
export type RecipeType = "base" | "nested";

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  soup: "Zupa",
  main_course: "Danie główne",
  sauce: "Sos",
  side_dish: "Dodatek",
  dessert: "Deser",
  salad: "Sałatka",
  appetizer: "Przystawka",
};

export const RECIPE_STATUS_LABELS: Record<RecipeStatus, string> = {
  draft: "Szkic",
  active: "Aktywna",
  archived: "Archiwizowana",
};

export const RECIPE_STATUS_COLORS: Record<RecipeStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-muted text-muted-foreground",
};

export interface RecipeIngredient {
  id: string;
  sortOrder: number;
  type: "product" | "recipe";
  referenceId: number;
  name: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  techLoss: number;
  grossWeight: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  cost: number;
}

export interface Recipe {
  id: number;
  name: string;
  category: RecipeCategory;
  status: RecipeStatus;
  type: RecipeType;
  portionWeight: number;
  version: string;
  kcalPerPortion: number;
  proteinPerPortion: number;
  fatPerPortion: number;
  carbsPerPortion: number;
  fiberPerPortion: number;
  costPerPortion: number;
  ingredientCount: number;
  allergens: string[];
  cookingMethod: string;
  cookingTemp: number | null;
  cookingTime: number | null;
  lossCoefficient: number;
  notes: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}
