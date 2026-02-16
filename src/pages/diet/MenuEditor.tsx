import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft, ChevronRight, Save, CheckCircle, Copy, Settings2, Link2, Search, RotateCcw, Eye, List,
} from "lucide-react";
import { mockMenuPackages } from "@/data/mockMenuPackages";
import { DEFAULT_MEAL_SLOTS, type MenuCellDish } from "@/types/menuPackage";
import { cn } from "@/lib/utils";
import MenuCellContent from "@/components/MenuCellContent";

const DAY_NAMES = ["Pon", "Wto", "Śro", "Czw", "Pią", "Sob", "Nie"];

function getFlatSlots() {
  const flat: { id: string; label: string; parent?: string }[] = [];
  for (const slot of DEFAULT_MEAL_SLOTS) {
    if (slot.subSlots) {
      for (const sub of slot.subSlots) {
        flat.push({ id: sub.id, label: sub.name, parent: slot.name });
      }
    } else {
      flat.push({ id: slot.id, label: slot.shortName });
    }
  }
  return flat;
}

const flatSlots = getFlatSlots();

const dishCatalog: MenuCellDish[] = [
  { id: 1, name: "Owsianka z owocami", kcal: 320, protein: 12, fat: 8, carbs: 52, cost: 3.2, allergenIcons: ["🥛", "🌾"],
    composition: [
      { name: "Owsianka na mleku", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU", "MLK"] },
      { name: "Mix owoców sezonowych", type: "recipe", portionLabel: "80g", allergenCodes: [] },
    ] },
  { id: 2, name: "Jajecznica na maśle", kcal: 380, protein: 22, fat: 28, carbs: 4, cost: 4.1, allergenIcons: ["🥚", "🥛"],
    composition: [
      { name: "Jajecznica klasyczna", type: "recipe", portionLabel: "180g", allergenCodes: ["JAJ", "MLK"] },
      { name: "Pieczywo pszenne", type: "product", portionLabel: "60g", allergenCodes: ["GLU"] },
    ] },
  { id: 5, name: "Zupa pomidorowa", kcal: 180, protein: 5, fat: 6, carbs: 28, cost: 3.5, allergenIcons: ["🌾"],
    composition: [
      { name: "Zupa pomidorowa z makaronem", type: "recipe", portionLabel: "350ml", allergenCodes: ["GLU"] },
    ] },
  { id: 6, name: "Krem z brokułów", kcal: 160, protein: 6, fat: 5, carbs: 22, cost: 4.0, allergenIcons: ["🥛"],
    composition: [
      { name: "Krem brokułowy", type: "recipe", portionLabel: "300ml", allergenCodes: ["MLK"] },
    ] },
  { id: 7, name: "Kurczak z ryżem", kcal: 520, protein: 38, fat: 14, carbs: 62, cost: 8.5, allergenIcons: [],
    composition: [
      { name: "Udo drobiowe gotowane", type: "recipe", portionLabel: "140g", allergenCodes: [] },
      { name: "Ryż biały", type: "recipe", portionLabel: "200g", allergenCodes: [] },
      { name: "Sok owocowy", type: "product", portionLabel: "100ml", allergenCodes: [] },
      { name: "Sos pieczeniowy", type: "recipe", portionLabel: "50ml", allergenCodes: ["GLU"] },
    ] },
  { id: 8, name: "Ryba z kaszą", kcal: 480, protein: 32, fat: 16, carbs: 54, cost: 9.2, allergenIcons: ["🐟"],
    composition: [
      { name: "Filet z dorsza pieczony", type: "recipe", portionLabel: "150g", allergenCodes: ["RYB"] },
      { name: "Kasza gryczana", type: "recipe", portionLabel: "180g", allergenCodes: [] },
    ] },
  { id: 9, name: "Surówka z kapusty", kcal: 45, protein: 1.5, fat: 2, carbs: 6, cost: 1.5, allergenIcons: [],
    composition: [
      { name: "Surówka z kapusty białej", type: "recipe", portionLabel: "120g", allergenCodes: [] },
    ] },
  { id: 12, name: "Makaron z sosem", kcal: 450, protein: 15, fat: 12, carbs: 72, cost: 6.0, allergenIcons: ["🌾"],
    composition: [
      { name: "Makaron penne", type: "recipe", portionLabel: "200g", allergenCodes: ["GLU"] },
      { name: "Sos bolognese", type: "recipe", portionLabel: "150g", allergenCodes: [] },
    ] },
  { id: 13, name: "Zupa dyniowa", kcal: 140, protein: 3, fat: 4, carbs: 24, cost: 3.8, allergenIcons: [],
    composition: [
      { name: "Krem z dyni", type: "recipe", portionLabel: "300ml", allergenCodes: [] },
    ] },
  { id: 14, name: "Pierogi ruskie", kcal: 420, protein: 14, fat: 16, carbs: 56, cost: 7.0, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pierogi ruskie", type: "recipe", portionLabel: "250g", allergenCodes: ["GLU", "MLK"] },
      { name: "Śmietana 18%", type: "product", portionLabel: "30ml", allergenCodes: ["MLK"] },
    ] },
  { id: 15, name: "Kanapka z serem", kcal: 280, protein: 12, fat: 14, carbs: 28, cost: 3.0, allergenIcons: ["🌾", "🥛"],
    composition: [
      { name: "Pieczywo żytnie", type: "product", portionLabel: "80g", allergenCodes: ["GLU"] },
      { name: "Ser żółty gouda", type: "product", portionLabel: "40g", allergenCodes: ["MLK"] },
    ] },
  { id: 16, name: "Sałatka grecka", kcal: 220, protein: 8, fat: 16, carbs: 12, cost: 5.5, allergenIcons: ["🥛"],
    composition: [
      { name: "Sałatka grecka", type: "recipe", portionLabel: "200g", allergenCodes: ["MLK"] },
    ] },
  { id: 17, name: "Kotlet schabowy", kcal: 580, protein: 30, fat: 32, carbs: 40, cost: 10.0, allergenIcons: ["🌾", "🥚"],
    composition: [
      { name: "Kotlet schabowy panierowany", type: "recipe", portionLabel: "180g", allergenCodes: ["GLU", "JAJ"] },
      { name: "Ziemniaki gotowane", type: "recipe", portionLabel: "200g", allergenCodes: [] },
      { name: "Surówka z buraka", type: "recipe", portionLabel: "100g", allergenCodes: [] },
    ] },
];

export default function MenuEditor() {
  const { id } = useParams();
  const pkg = mockMenuPackages.find((p) => p.id === Number(id)) ?? mockMenuPackages[0];

  const [selectedDietIdx, setSelectedDietIdx] = useState(0);
  const [weekIdx, setWeekIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<{ day: number; slotId: string } | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [nutritionView, setNutritionView] = useState<"day" | "week">("day");
  const [detailLevel, setDetailLevel] = useState<"general" | "detailed">("general");
  const [transposed, setTransposed] = useState(false);

  const diet = pkg.dietPlans[selectedDietIdx];
  const week = diet?.weeks[weekIdx];

  const getCell = (dayIdx: number, slotId: string) =>
    week?.cells.find((c) => c.dayIndex === dayIdx && c.mealSlotId === slotId) ?? null;

  // Nutrition calculations
  const nutritionData = useMemo(() => {
    if (!week) return { kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0 };
    const days = nutritionView === "day" ? [selectedDay] : Array.from({ length: 7 }, (_, i) => i);
    let kcal = 0, protein = 0, fat = 0, carbs = 0, cost = 0;
    for (const d of days) {
      for (const cell of week.cells.filter((c) => c.dayIndex === d)) {
        if (cell.dish) {
          kcal += cell.dish.kcal;
          protein += cell.dish.protein;
          fat += cell.dish.fat;
          carbs += cell.dish.carbs;
          cost += cell.dish.cost;
        }
      }
    }
    const divisor = nutritionView === "week" ? 7 : 1;
    return { kcal: kcal / divisor, protein: protein / divisor, fat: fat / divisor, carbs: carbs / divisor, cost };
  }, [week, selectedDay, nutritionView]);

  const targets = { kcal: 2000, protein: 60, fat: 70, carbs: 270 };

  const getBarColor = (current: number, target: number) => {
    const pct = Math.abs(current - target) / target;
    if (pct <= 0.10) return "bg-emerald-500";
    if (pct <= 0.15) return "bg-amber-500";
    return "bg-red-500";
  };

  const openPicker = (day: number, slotId: string) => {
    setPickerSlot({ day, slotId });
    setPickerSearch("");
    setPickerOpen(true);
  };

  const selectDish = (_dish: MenuCellDish) => {
    setPickerOpen(false);
  };

  const filteredDishes = dishCatalog.filter((d) =>
    d.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const totalWeeks = diet?.weeks.length ?? 1;
  const isDetailed = detailLevel === "detailed";

  const visibleDays = viewMode === "week" ? DAY_NAMES.map((n, i) => ({ name: n, idx: i })) : [{ name: DAY_NAMES[selectedDay], idx: selectedDay }];

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{pkg.name}</h1>
            <p className="text-sm text-muted-foreground">{pkg.clientName} • {pkg.periodFrom} — {pkg.periodTo}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1" /> Zapisz</Button>
            <Button size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Zatwierdź</Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <Select value={String(selectedDietIdx)} onValueChange={(v) => setSelectedDietIdx(Number(v))}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {pkg.dietPlans.map((dp, idx) => (
                <SelectItem key={dp.dietId} value={String(idx)}>
                  {dp.dietName}
                  {dp.dietType === "base" ? " (BAZOWA)" : ` (← ${dp.baseDietCode})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))} disabled={weekIdx === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">Tydz. {weekIdx + 1}/{totalWeeks}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekIdx(Math.min(totalWeeks - 1, weekIdx + 1))} disabled={weekIdx >= totalWeeks - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center border rounded-md">
            <Button variant={viewMode === "week" ? "default" : "ghost"} size="sm" className="rounded-r-none h-8" onClick={() => setViewMode("week")}>Tydzień</Button>
            <Button variant={viewMode === "day" ? "default" : "ghost"} size="sm" className="rounded-l-none h-8" onClick={() => setViewMode("day")}>Dzień</Button>
          </div>

          {viewMode === "day" && (
            <Select value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((d, i) => (
                  <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex-1" />

          {/* Detail level toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={detailLevel === "general" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none h-8"
              onClick={() => setDetailLevel("general")}
            >
              <Eye className="h-4 w-4 mr-1" /> Ogólny
            </Button>
            <Button
              variant={detailLevel === "detailed" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none h-8"
              onClick={() => setDetailLevel("detailed")}
            >
              <List className="h-4 w-4 mr-1" /> Szczegółowy
            </Button>
          </div>

          {/* Transpose */}
          <Button
            variant={transposed ? "default" : "outline"}
            size="sm"
            onClick={() => setTransposed((t) => !t)}
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Transponuj
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-1" /> Kopiuj menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Skopiuj tydzień na inny tydzień</DropdownMenuItem>
              <DropdownMenuItem>Skopiuj na inną dietę</DropdownMenuItem>
              <DropdownMenuItem>Skopiuj z innego pakietu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Settings2 className="h-4 w-4 mr-1" /> Operacje</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Zamień danie we wszystkich dniach</DropdownMenuItem>
              <DropdownMenuItem>Zastosuj wyłączenie na cały tydzień</DropdownMenuItem>
              <DropdownMenuItem>Skaluj porcje</DropdownMenuItem>
              <DropdownMenuItem>Propaguj z diety bazowej</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <TooltipProvider>
                {!transposed ? (
                  /* Normal: rows=days, cols=slots */
                  <table className="w-full text-xs table-fixed">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left w-12 font-medium text-muted-foreground" />
                        {flatSlots.map((slot) => (
                          <th key={slot.id} className="p-2 text-center font-medium text-muted-foreground">
                            <div>{slot.parent && <span className="text-[10px] block text-muted-foreground/60">{slot.parent}</span>}{slot.label}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDays.map(({ name: dayName, idx: dayIdx }) => (
                        <tr key={dayIdx} className="border-b hover:bg-muted/20">
                          <td className="p-2 font-medium text-muted-foreground text-center">{dayName}</td>
                          {flatSlots.map((slot) => {
                            const cell = getCell(dayIdx, slot.id);
                            const isInherited = cell?.inherited && !cell?.overridden;
                            return (
                              <td
                                key={slot.id}
                                className={cn(
                                  "p-1 border-l cursor-pointer transition-colors hover:bg-primary/5",
                                  isInherited && "bg-muted/20",
                                )}
                                onClick={() => openPicker(dayIdx, slot.id)}
                              >
                                <MenuCellContent
                                  dish={cell?.dish ?? null}
                                  detailed={isDetailed}
                                  isInherited={isInherited}
                                  isOverridden={cell?.overridden}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  /* Transposed: rows=slots, cols=days */
                  <table className="w-full text-xs table-fixed">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left w-24 font-medium text-muted-foreground">Posiłek</th>
                        {visibleDays.map(({ name, idx }) => (
                          <th key={idx} className="p-2 text-center font-medium text-muted-foreground">{name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {flatSlots.map((slot) => (
                        <tr key={slot.id} className="border-b hover:bg-muted/20">
                          <td className="p-2 font-medium text-muted-foreground">
                            {slot.parent && <span className="text-[10px] block text-muted-foreground/60">{slot.parent}</span>}
                            {slot.label}
                          </td>
                          {visibleDays.map(({ idx: dayIdx }) => {
                            const cell = getCell(dayIdx, slot.id);
                            const isInherited = cell?.inherited && !cell?.overridden;
                            return (
                              <td
                                key={dayIdx}
                                className={cn(
                                  "p-1 border-l cursor-pointer transition-colors hover:bg-primary/5",
                                  isInherited && "bg-muted/20",
                                )}
                                onClick={() => openPicker(dayIdx, slot.id)}
                              >
                                <MenuCellContent
                                  dish={cell?.dish ?? null}
                                  detailed={isDetailed}
                                  isInherited={isInherited}
                                  isOverridden={cell?.overridden}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Nutrition panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Podsumowanie odżywcze</CardTitle>
                  <div className="flex items-center border rounded-md text-xs">
                    <button className={cn("px-2 py-1 rounded-l-md", nutritionView === "day" && "bg-primary text-primary-foreground")} onClick={() => setNutritionView("day")}>Dzień</button>
                    <button className={cn("px-2 py-1 rounded-r-md", nutritionView === "week" && "bg-primary text-primary-foreground")} onClick={() => setNutritionView("week")}>Tydzień</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Kcal", current: nutritionData.kcal, target: targets.kcal, unit: "kcal" },
                  { label: "Białko", current: nutritionData.protein, target: targets.protein, unit: "g" },
                  { label: "Tłuszcz", current: nutritionData.fat, target: targets.fat, unit: "g" },
                  { label: "Węglowodany", current: nutritionData.carbs, target: targets.carbs, unit: "g" },
                ].map((bar) => {
                  const pct = Math.min((bar.current / bar.target) * 100, 150);
                  return (
                    <Tooltip key={bar.label}>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{bar.label}</span>
                            <span className="text-muted-foreground">
                              {Math.round(bar.current)}/{bar.target} {bar.unit} ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", getBarColor(bar.current, bar.target))} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {bar.label}: {Math.round(bar.current)} (cel: {bar.target} {bar.unit}, {Math.round(pct)}%)
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                <div className="pt-2 border-t text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Koszt {nutritionView === "day" ? "dnia" : "tygodnia"}:</span>
                    <span className="font-mono font-medium">{nutritionData.cost.toFixed(2)} PLN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {diet?.dietType === "derived" && (
              <Card className="border-primary/30">
                <CardContent className="p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">Dieta pochodna od: {diet.baseDietCode}</span>
                  </div>
                  <p className="text-muted-foreground">Komórki z 🔗 są odziedziczone. Kliknij aby nadpisać.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dish picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Wybierz danie</DialogTitle>
            <DialogDescription>
              {pickerSlot && `${DAY_NAMES[pickerSlot.day]}, ${flatSlots.find((s) => s.id === pickerSlot.slotId)?.label ?? ""}`}
            </DialogDescription>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Szukaj dania..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredDishes.map((dish) => (
              <button
                key={dish.id}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left transition-colors"
                onClick={() => selectDish(dish)}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{dish.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {dish.kcal} kcal | B: {dish.protein}g | T: {dish.fat}g | W: {dish.carbs}g
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono">{dish.cost.toFixed(2)} PLN</div>
                  <div className="flex gap-0.5">{dish.allergenIcons.map((a, i) => <span key={i} className="text-xs">{a}</span>)}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
