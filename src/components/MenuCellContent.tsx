import { Link2, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MenuCellDish, MenuCellCompositionItem } from "@/types/menuPackage";

interface MenuCellContentProps {
  dish: MenuCellDish | null;
  detailed: boolean;
  isInherited?: boolean;
  isOverridden?: boolean;
  diffFromBase?: boolean;
}

function AllergenCodes({ codes }: { codes: string[] }) {
  if (codes.length === 0) return null;
  return <span className="text-destructive font-semibold">[{codes.join(", ")}]</span>;
}

function CompositionLine({ item }: { item: MenuCellCompositionItem }) {
  const icon = item.type === "recipe" ? "🧪" : "📦";
  return (
    <div className="text-[10px] text-muted-foreground leading-tight flex items-start gap-1">
      <span className="shrink-0">{icon}</span>
      <span>
        {item.name} {item.portionLabel}{" "}
        <AllergenCodes codes={item.allergenCodes} />
      </span>
    </div>
  );
}

export default function MenuCellContent({
  dish,
  detailed,
  isInherited,
  isOverridden,
  diffFromBase,
}: MenuCellContentProps) {
  if (!dish) {
    return (
      <div className="min-h-[48px] flex items-center justify-center text-muted-foreground/40 text-[10px]">
        —
      </div>
    );
  }

  if (!detailed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-0.5 min-h-[48px]">
            <div className="text-[11px] font-medium leading-tight line-clamp-2">
              {diffFromBase && <span className="text-primary">⚡</span>} {dish.name}
            </div>
            <div className="text-[10px] text-muted-foreground">{dish.kcal} kcal</div>
            <div className="flex items-center gap-0.5">
              {dish.allergenIcons.map((icon, i) => (
                <span key={i} className="text-[10px]">{icon}</span>
              ))}
              {isInherited && <Link2 className="h-3 w-3 text-muted-foreground ml-auto" />}
              {isOverridden && <Pencil className="h-3 w-3 text-primary ml-auto" />}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{dish.name}</p>
          <p className="text-xs">Kcal: {dish.kcal} | B: {dish.protein}g | T: {dish.fat}g | W: {dish.carbs}g</p>
          <p className="text-xs">Koszt: {dish.cost.toFixed(2)} PLN</p>
          {isInherited && <p className="text-xs text-muted-foreground mt-1">🔗 Odziedziczone z diety bazowej</p>}
          {diffFromBase && <p className="text-xs text-primary">⚡ Różni się od diety bazowej</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Detailed view
  return (
    <div className="space-y-0.5 min-h-[48px]">
      <div className="text-[11px] font-semibold leading-tight">
        {diffFromBase && <span className="text-primary">⚡</span>} {dish.name}
      </div>
      {dish.composition?.map((item, i) => (
        <CompositionLine key={i} item={item} />
      ))}
      {isInherited && (
        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Link2 className="h-3 w-3" /> Odziedziczone
        </div>
      )}
    </div>
  );
}
