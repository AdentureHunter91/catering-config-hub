import type { MenuCellDish } from "@/types/menuPackage";

export interface DayNutritionSummary {
  kcal: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  sugars: number;
  salt: number;
  fiber: number;
  cost: number;
}

export function computeDayNutrition(dishes: (MenuCellDish | null | undefined)[]): DayNutritionSummary {
  return dishes.reduce<DayNutritionSummary>(
    (acc, d) => {
      if (!d) return acc;
      return {
        kcal: acc.kcal + d.kcal,
        protein: acc.protein + d.protein,
        fat: acc.fat + d.fat,
        saturatedFat: acc.saturatedFat + d.saturatedFat,
        carbs: acc.carbs + d.carbs,
        sugars: acc.sugars + d.sugars,
        salt: acc.salt + d.salt,
        fiber: acc.fiber + d.fiber,
        cost: acc.cost + d.cost,
      };
    },
    { kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbs: 0, sugars: 0, salt: 0, fiber: 0, cost: 0 },
  );
}

export function NutritionSummaryCell({ summary, showCost = true }: { summary: DayNutritionSummary; showCost?: boolean }) {
  return (
    <div className="text-[10px] leading-relaxed space-y-0.5 font-mono">
      <div><span className="text-muted-foreground">Energia:</span> <span className="font-medium">{Math.round(summary.kcal)} kcal</span></div>
      <div><span className="text-muted-foreground">Białko:</span> <span className="font-medium">{summary.protein.toFixed(1)} g</span></div>
      <div><span className="text-muted-foreground">Tłuszcz:</span> <span className="font-medium">{summary.fat.toFixed(1)} g</span></div>
      <div><span className="text-muted-foreground">w tym kw. nasycone:</span> <span className="font-medium">{summary.saturatedFat.toFixed(1)} g</span></div>
      <div><span className="text-muted-foreground">Węglowodany:</span> <span className="font-medium">{summary.carbs.toFixed(1)} g</span></div>
      <div><span className="text-muted-foreground">w tym cukry:</span> <span className="font-medium">{summary.sugars.toFixed(1)} g</span></div>
      <div><span className="text-muted-foreground">Sól:</span> <span className="font-medium">{summary.salt.toFixed(2)} g</span></div>
      <div><span className="text-muted-foreground">Błonnik:</span> <span className="font-medium">{summary.fiber.toFixed(1)} g</span></div>
      {showCost && (
        <div className="pt-0.5 border-t border-dashed">
          <span className="text-muted-foreground">Koszt:</span> <span className="font-medium text-primary">{summary.cost.toFixed(2)} PLN</span>
        </div>
      )}
    </div>
  );
}
