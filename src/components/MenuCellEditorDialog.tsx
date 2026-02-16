import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Search, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuCellDish, MenuCellCompositionItem } from "@/types/menuPackage";

/* ── dish catalog (shared) ── */
export const dishCatalog: MenuCellDish[] = [
  { id: 1, name: "Owsianka z owocami", kcal: 320, protein: 12, fat: 8, saturatedFat: 2.5, carbs: 52, sugars: 18, salt: 0.3, fiber: 4.2, cost: 3.2, portionGrams: 295, allergenIcons: ["🥛", "🌾"],
    composition: [
      { name: "Owsianka na mleku", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU", "MLK"] },
      { name: "Mix owoców sezonowych", type: "recipe", portionLabel: "80g", allergenCodes: [] },
    ] },
  { id: 2, name: "Jajecznica na maśle", kcal: 380, protein: 22, fat: 28, saturatedFat: 12, carbs: 4, sugars: 1, salt: 1.2, fiber: 0.5, cost: 4.1, portionGrams: 250, allergenIcons: ["🥚", "🥛"],
    composition: [
      { name: "Jajecznica klasyczna", type: "recipe", portionLabel: "180g", allergenCodes: ["JAJ", "MLK"] },
      { name: "Pieczywo pszenne", type: "product", portionLabel: "60g", allergenCodes: ["GLU"] },
    ] },
  { id: 5, name: "Zupa pomidorowa", kcal: 180, protein: 5, fat: 6, saturatedFat: 2, carbs: 28, sugars: 8, salt: 1.5, fiber: 2, cost: 3.5, portionGrams: 365, allergenIcons: ["🌾"],
    composition: [
      { name: "Zupa pomidorowa z makaronem", type: "recipe", portionLabel: "350ml", allergenCodes: ["GLU"] },
    ] },
  { id: 6, name: "Krem z brokułów", kcal: 160, protein: 6, fat: 5, saturatedFat: 1.5, carbs: 22, sugars: 3, salt: 1.0, fiber: 3.5, cost: 4.0, portionGrams: 320, allergenIcons: ["🥛"],
    composition: [
      { name: "Krem brokułowy", type: "recipe", portionLabel: "300ml", allergenCodes: ["MLK"] },
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
    ] },
  { id: 9, name: "Surówka z kapusty", kcal: 45, protein: 1.5, fat: 2, saturatedFat: 0.3, carbs: 6, sugars: 3, salt: 0.5, fiber: 2, cost: 1.5, portionGrams: 120, allergenIcons: [],
    composition: [
      { name: "Surówka z kapusty białej", type: "recipe", portionLabel: "120g", allergenCodes: [] },
    ] },
  { id: 12, name: "Makaron z sosem", kcal: 450, protein: 15, fat: 12, saturatedFat: 4, carbs: 72, sugars: 6, salt: 2.0, fiber: 3, cost: 6.0, portionGrams: 350, allergenIcons: ["🌾"],
    composition: [
      { name: "Makaron penne", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU"] },
      { name: "Sos bolognese", type: "recipe", portionLabel: "150g", allergenCodes: [] },
    ] },
  { id: 13, name: "Zupa dyniowa", kcal: 140, protein: 3, fat: 4, saturatedFat: 1, carbs: 24, sugars: 8, salt: 0.8, fiber: 3, cost: 3.8, portionGrams: 310, allergenIcons: [],
    composition: [
      { name: "Krem z dyni", type: "recipe", portionLabel: "300ml", allergenCodes: [] },
    ] },
  { id: 14, name: "Pierogi ruskie", kcal: 420, protein: 14, fat: 16, saturatedFat: 7, carbs: 56, sugars: 3, salt: 1.6, fiber: 2, cost: 7.0, portionGrams: 310, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pierogi ruskie", type: "recipe", portionLabel: "250g", allergenCodes: ["GLU", "MLK"] },
      { name: "Śmietana 18%", type: "product", portionLabel: "30ml", allergenCodes: ["MLK"] },
    ] },
  { id: 15, name: "Kanapka z serem", kcal: 280, protein: 12, fat: 14, saturatedFat: 8, carbs: 28, sugars: 2, salt: 1.5, fiber: 2.5, cost: 3.0, portionGrams: 150, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pieczywo żytnie", type: "product", portionLabel: "80g", allergenCodes: ["GLU"] },
      { name: "Ser żółty gouda", type: "product", portionLabel: "40g", allergenCodes: ["MLK"] },
    ] },
  { id: 16, name: "Sałatka grecka", kcal: 220, protein: 8, fat: 16, saturatedFat: 6, carbs: 12, sugars: 4, salt: 1.8, fiber: 2, cost: 5.5, portionGrams: 200, allergenIcons: ["🥛"],
    composition: [
      { name: "Sałatka grecka", type: "recipe", portionLabel: "200g", allergenCodes: ["MLK"] },
    ] },
  { id: 17, name: "Kotlet schabowy", kcal: 580, protein: 30, fat: 32, saturatedFat: 10, carbs: 40, sugars: 2, salt: 2.2, fiber: 3, cost: 10.0, portionGrams: 480, allergenIcons: ["🌾", "🥚"],
    composition: [
      { name: "Kotlet schabowy panierowany", type: "recipe", portionLabel: "180g", allergenCodes: ["GLU", "JAJ"] },
      { name: "Ziemniaki gotowane", type: "recipe", portionLabel: "200g", allergenCodes: [] },
      { name: "Surówka z buraka", type: "recipe", portionLabel: "100g", allergenCodes: [] },
    ] },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotLabel: string;
  dayLabel: string;
  initialDishes: MenuCellDish[];
  onSave: (dishes: MenuCellDish[]) => void;
}

function CompositionRow({ item }: { item: MenuCellCompositionItem }) {
  const icon = item.type === "recipe" ? "🧪" : "📦";
  return (
    <div className="text-xs text-muted-foreground flex items-start gap-1.5 py-0.5">
      <span>{icon}</span>
      <span>{item.name} {item.portionLabel}
        {item.allergenCodes.length > 0 && (
          <span className="text-destructive font-semibold ml-1">[{item.allergenCodes.join(", ")}]</span>
        )}
      </span>
    </div>
  );
}

function NutritionValue({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value} {unit}</span>
    </div>
  );
}

export default function MenuCellEditorDialog({ open, onOpenChange, slotLabel, dayLabel, initialDishes, onSave }: Props) {
  const [selectedDishes, setSelectedDishes] = useState<MenuCellDish[]>(initialDishes);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(initialDishes.length > 0 ? 0 : null);
  const [search, setSearch] = useState("");

  const focusedDish = focusedIdx !== null ? selectedDishes[focusedIdx] ?? null : null;

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return dishCatalog.filter((d) => d.name.toLowerCase().includes(q));
  }, [search]);

  const addDish = (dish: MenuCellDish) => {
    const copy = { ...dish };
    setSelectedDishes((prev) => [...prev, copy]);
    setFocusedIdx(selectedDishes.length);
  };

  const removeDish = (idx: number) => {
    setSelectedDishes((prev) => prev.filter((_, i) => i !== idx));
    setFocusedIdx((prev) => {
      if (prev === null) return null;
      if (prev === idx) return selectedDishes.length > 1 ? Math.max(0, idx - 1) : null;
      if (prev > idx) return prev - 1;
      return prev;
    });
  };

  const updatePortionGrams = (idx: number, grams: number) => {
    setSelectedDishes((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, portionGrams: grams } : d))
    );
  };

  const handleSave = () => {
    onSave(selectedDishes);
    onOpenChange(false);
  };

  // Aggregate totals for all selected dishes
  const totals = useMemo(() => {
    return selectedDishes.reduce(
      (acc, d) => ({
        kcal: acc.kcal + d.kcal,
        protein: acc.protein + d.protein,
        fat: acc.fat + d.fat,
        saturatedFat: acc.saturatedFat + d.saturatedFat,
        carbs: acc.carbs + d.carbs,
        sugars: acc.sugars + d.sugars,
        salt: acc.salt + d.salt,
        fiber: acc.fiber + d.fiber,
        cost: acc.cost + d.cost,
      }),
      { kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbs: 0, sugars: 0, salt: 0, fiber: 0, cost: 0 },
    );
  }, [selectedDishes]);

  const allAllergens = useMemo(() => {
    const set = new Set<string>();
    selectedDishes.forEach((d) => d.allergenIcons.forEach((a) => set.add(a)));
    return [...set];
  }, [selectedDishes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edycja komórki jadłospisu</DialogTitle>
          <DialogDescription>{dayLabel} • {slotLabel}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-[1fr_320px] gap-0 min-h-0 border-t">
          {/* Left: catalog + selected dishes */}
          <div className="flex flex-col min-h-0 border-r">
            {/* Selected dishes */}
            {selectedDishes.length > 0 && (
              <div className="border-b bg-muted/30 p-3 space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground mb-1">Wybrane dania ({selectedDishes.length})</div>
                {selectedDishes.map((dish, idx) => (
                  <div
                    key={`${dish.id}-${idx}`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm",
                      focusedIdx === idx ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted",
                    )}
                    onClick={() => setFocusedIdx(idx)}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{dish.name}</div>
                      <div className="text-xs text-muted-foreground">{dish.kcal} kcal • {dish.portionGrams}g</div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {dish.allergenIcons.map((a, i) => <span key={i} className="text-xs">{a}</span>)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeDish(idx); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Search & catalog */}
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Szukaj dania..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 pb-3">
              <div className="space-y-1">
                {filteredCatalog.map((dish) => (
                  <button
                    key={dish.id}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left transition-colors"
                    onClick={() => addDish(dish)}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{dish.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {dish.kcal} kcal | B: {dish.protein}g | T: {dish.fat}g | W: {dish.carbs}g
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono">{dish.cost.toFixed(2)} PLN</div>
                      <div className="flex gap-0.5">{dish.allergenIcons.map((a, i) => <span key={i} className="text-xs">{a}</span>)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right: detail panel */}
          <div className="flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4">
              {focusedDish ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">{focusedDish.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {focusedDish.allergenIcons.map((a, i) => <span key={i} className="text-sm">{a}</span>)}
                    </div>
                  </div>

                  {/* Portion slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Gramatura</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={focusedDish.portionGrams}
                          onChange={(e) => focusedIdx !== null && updatePortionGrams(focusedIdx, Number(e.target.value) || 0)}
                          className="w-20 h-7 text-xs text-right"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    </div>
                    <Slider
                      value={[focusedDish.portionGrams]}
                      onValueChange={([v]) => focusedIdx !== null && updatePortionGrams(focusedIdx, v)}
                      min={10}
                      max={1000}
                      step={5}
                    />
                  </div>

                  {/* Nutrition */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Wartości odżywcze</div>
                    <NutritionValue label="Energia" value={Math.round(focusedDish.kcal)} unit="kcal" />
                    <NutritionValue label="Białko" value={focusedDish.protein} unit="g" />
                    <NutritionValue label="Tłuszcz" value={focusedDish.fat} unit="g" />
                    <NutritionValue label="w tym kw. nasycone" value={focusedDish.saturatedFat} unit="g" />
                    <NutritionValue label="Węglowodany" value={focusedDish.carbs} unit="g" />
                    <NutritionValue label="w tym cukry" value={focusedDish.sugars} unit="g" />
                    <NutritionValue label="Sól" value={focusedDish.salt} unit="g" />
                    <NutritionValue label="Błonnik" value={focusedDish.fiber} unit="g" />
                    <div className="flex justify-between text-xs pt-1 border-t">
                      <span className="text-muted-foreground">Koszt</span>
                      <span className="font-mono font-medium">{focusedDish.cost.toFixed(2)} PLN</span>
                    </div>
                  </div>

                  {/* Composition */}
                  {focusedDish.composition && focusedDish.composition.length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Skład dania</div>
                      {focusedDish.composition.map((item, i) => (
                        <CompositionRow key={i} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Wybierz danie z listy aby zobaczyć szczegóły
                </div>
              )}
            </ScrollArea>

            {/* Totals footer */}
            {selectedDishes.length > 0 && (
              <div className="border-t bg-muted/30 p-3 space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Podsumowanie komórki</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
                  <span className="text-muted-foreground">Energia:</span><span className="text-right">{Math.round(totals.kcal)} kcal</span>
                  <span className="text-muted-foreground">Białko:</span><span className="text-right">{totals.protein.toFixed(1)}g</span>
                  <span className="text-muted-foreground">Tłuszcz:</span><span className="text-right">{totals.fat.toFixed(1)}g</span>
                  <span className="text-muted-foreground">Koszt:</span><span className="text-right">{totals.cost.toFixed(2)} PLN</span>
                </div>
                {allAllergens.length > 0 && (
                  <div className="text-xs flex items-center gap-1 pt-1">
                    <span className="text-muted-foreground">Alergeny:</span>
                    {allAllergens.map((a, i) => <span key={i}>{a}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
          <Button onClick={handleSave}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
