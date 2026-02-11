export type DietPlanType = "base" | "derived";
export type DietPlanStatus = "active" | "draft" | "archived";

export const DIET_PLAN_STATUS_LABELS: Record<DietPlanStatus, string> = {
  active: "Aktywna",
  draft: "Szkic",
  archived: "Archiwizowana",
};

export const DIET_PLAN_STATUS_COLORS: Record<DietPlanStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-muted text-muted-foreground",
};

export interface MealSlot {
  id: string;
  name: string;
  timeFrom: string;
  timeTo: string;
  defaultPortionGrams: string;
  type: string;
  itemCount: string;
  sortOrder: number;
  inherited: boolean;
  overridden: boolean;
}

export interface NutritionGoal {
  nutrient: string;
  unit: string;
  min: number | null;
  max: number | null;
  pctKcal: string;
  source: "inherited" | "overridden";
}

export interface DietExclusion {
  id: string;
  category: "allergen" | "ingredient" | "dish_category";
  name: string;
  active: boolean;
  reason: string;
  fromBase: boolean;
}

export interface DietSubstitution {
  id: string;
  menuElement: string;
  original: string;
  replacement: string;
  changeType: string;
  appliesTo: string[];
}

export interface DietClientAssignment {
  clientId: number;
  clientName: string;
  assigned: boolean;
  dateFrom: string;
  dateTo: string;
  notes: string;
}

export interface PropagationTarget {
  dietId: number;
  dietName: string;
  dietCode: string;
  status: "compatible" | "check" | "override";
  statusNote: string;
  selected: boolean;
}

export interface DietPlan {
  id: number;
  name: string;
  code: string;
  type: DietPlanType;
  baseDietId: number | null;
  baseDietName: string | null;
  baseDietCode: string | null;
  icon: string;
  status: DietPlanStatus;
  kcalTarget: number;
  exclusionsSummary: string;
  clientCount: number;
  mealSlots: MealSlot[];
  nutritionGoals: NutritionGoal[];
  exclusions: DietExclusion[];
  substitutions: DietSubstitution[];
  clients: DietClientAssignment[];
  description: string;
  derivedDietIds: number[];
  createdAt: string;
  updatedAt: string;
}
