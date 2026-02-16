import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { computeDayNutrition, NutritionSummaryCell } from "@/components/NutritionSummaryRow";
import DietLayout from "@/components/DietLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Save, CheckCircle, Copy, Settings2, Link2, RotateCcw, Eye, List, Tag, Plus, X,
} from "lucide-react";
import { mockMenuPackages } from "@/data/mockMenuPackages";
import { DEFAULT_MEAL_SLOTS, PREDEFINED_TAGS, type MenuCellDish, type MenuPackageTag } from "@/types/menuPackage";
import { cn } from "@/lib/utils";
import MenuCellContent from "@/components/MenuCellContent";
import MenuCellEditorDialog from "@/components/MenuCellEditorDialog";

function getDayNames(cycleDays: number): string[] {
  if (cycleDays <= 7) return ["Pon", "Wto", "Śro", "Czw", "Pią", "Sob", "Nie"].slice(0, cycleDays);
  return Array.from({ length: cycleDays }, (_, i) => `Dz. ${i + 1}`);
}

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

export default function MenuEditor() {
  const { id } = useParams();
  const pkg = mockMenuPackages.find((p) => p.id === Number(id)) ?? mockMenuPackages[0];
  const cycleDays = Number(pkg.cycle) || 7;
  const DAY_NAMES = getDayNames(cycleDays);

  const [selectedDietIdx, setSelectedDietIdx] = useState(0);
  const [weekIdx, setWeekIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSlot, setEditorSlot] = useState<{ day: number; slotId: string } | null>(null);
  const [nutritionView, setNutritionView] = useState<"day" | "week">("day");
  const [detailLevel, setDetailLevel] = useState<"general" | "detailed">("general");
  const [transposed, setTransposed] = useState(false);

  // Tags
  const [allTags, setAllTags] = useState<MenuPackageTag[]>(PREDEFINED_TAGS);
  const [pkgTags, setPkgTags] = useState<string[]>(pkg.tags);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");

  const diet = pkg.dietPlans[selectedDietIdx];
  const week = diet?.weeks[weekIdx];

  const getCell = (dayIdx: number, slotId: string) =>
    week?.cells.find((c) => c.dayIndex === dayIdx && c.mealSlotId === slotId) ?? null;

  const getDishes = (dayIdx: number, slotId: string): MenuCellDish[] =>
    getCell(dayIdx, slotId)?.dishes ?? [];

  // Nutrition calculations
  const nutritionData = useMemo(() => {
    if (!week) return { kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0 };
    const days = nutritionView === "day" ? [selectedDay] : Array.from({ length: 7 }, (_, i) => i);
    let kcal = 0, protein = 0, fat = 0, carbs = 0, cost = 0;
    for (const d of days) {
      for (const cell of week.cells.filter((c) => c.dayIndex === d)) {
        for (const dish of cell.dishes) {
          kcal += dish.kcal;
          protein += dish.protein;
          fat += dish.fat;
          carbs += dish.carbs;
          cost += dish.cost;
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

  const openEditor = (day: number, slotId: string) => {
    setEditorSlot({ day, slotId });
    setEditorOpen(true);
  };

  const handleEditorSave = (_dishes: MenuCellDish[]) => {
    // In real app: update cell dishes in state
  };

  const addNewTag = () => {
    if (!newTagLabel.trim()) return;
    const newId = newTagLabel.toLowerCase().replace(/\s+/g, "_");
    const tag: MenuPackageTag = { id: newId, label: newTagLabel.trim(), color: "bg-slate-100 text-slate-800 border-slate-300" };
    setAllTags((prev) => [...prev, tag]);
    setPkgTags((prev) => [...prev, newId]);
    setNewTagLabel("");
  };

  const totalWeeks = diet?.weeks.length ?? 1;
  const isDetailed = detailLevel === "detailed";

  const visibleDays = viewMode === "week" ? DAY_NAMES.map((n, i) => ({ name: n, idx: i })) : [{ name: DAY_NAMES[selectedDay], idx: selectedDay }];

  // Collect all dishes for a day across all slots (for nutrition summary)
  const getAllDishesForDay = (dayIdx: number): MenuCellDish[] =>
    flatSlots.flatMap((s) => getDishes(dayIdx, s.id));

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{pkg.name}</h1>
            <p className="text-sm text-muted-foreground">{pkg.clientName} • {pkg.periodFrom} — {pkg.periodTo}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {pkgTags.map((tagId) => {
                const t = allTags.find((t) => t.id === tagId);
                return t ? (
                  <Badge key={tagId} variant="outline" className={cn("text-[10px] border", t.color)}>
                    {t.label}
                    <button className="ml-1 hover:text-destructive" onClick={() => setPkgTags((prev) => prev.filter((id) => id !== tagId))}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ) : null;
              })}
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" onClick={() => setTagDialogOpen(true)}>
                <Plus className="h-3 w-3" /> Tag
              </Button>
            </div>
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

          <div className="flex items-center border rounded-md">
            <Button variant={detailLevel === "general" ? "default" : "ghost"} size="sm" className="rounded-r-none h-8" onClick={() => setDetailLevel("general")}>
              <Eye className="h-4 w-4 mr-1" /> Ogólny
            </Button>
            <Button variant={detailLevel === "detailed" ? "default" : "ghost"} size="sm" className="rounded-l-none h-8" onClick={() => setDetailLevel("detailed")}>
              <List className="h-4 w-4 mr-1" /> Szczegółowy
            </Button>
          </div>

          <Button variant={transposed ? "default" : "outline"} size="sm" onClick={() => setTransposed((t) => !t)}>
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
                  <table className="w-full text-xs table-fixed">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left w-12 font-medium text-muted-foreground" />
                        {flatSlots.map((slot) => (
                          <th key={slot.id} className="p-2 text-center font-medium text-muted-foreground">
                            <div>{slot.parent && <span className="text-[10px] block text-muted-foreground/60">{slot.parent}</span>}{slot.label}</div>
                          </th>
                        ))}
                        <th className="p-2 text-center font-medium text-muted-foreground border-l-2">Σ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDays.map(({ name: dayName, idx: dayIdx }) => {
                        const summary = computeDayNutrition(getAllDishesForDay(dayIdx));
                        return (
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
                                  onClick={() => openEditor(dayIdx, slot.id)}
                                >
                                  <MenuCellContent
                                    dishes={cell?.dishes ?? []}
                                    detailed={isDetailed}
                                    isInherited={isInherited}
                                    isOverridden={cell?.overridden}
                                  />
                                </td>
                              );
                            })}
                            <td className="p-1.5 border-l-2 bg-muted/30">
                              <NutritionSummaryCell summary={summary} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
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
                                onClick={() => openEditor(dayIdx, slot.id)}
                              >
                                <MenuCellContent
                                  dishes={cell?.dishes ?? []}
                                  detailed={isDetailed}
                                  isInherited={isInherited}
                                  isOverridden={cell?.overridden}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-muted/40">
                        <td className="p-2 font-semibold text-muted-foreground text-[10px]">Σ Podsumowanie</td>
                        {visibleDays.map(({ idx: dayIdx }) => {
                          const summary = computeDayNutrition(getAllDishesForDay(dayIdx));
                          return (
                            <td key={`sum-${dayIdx}`} className="p-1.5 border-l">
                              <NutritionSummaryCell summary={summary} />
                            </td>
                          );
                        })}
                      </tr>
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

      {/* Cell editor dialog */}
      {editorSlot && (
        <MenuCellEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          dayLabel={DAY_NAMES[editorSlot.day]}
          slotLabel={flatSlots.find((s) => s.id === editorSlot.slotId)?.label ?? ""}
          initialDishes={getDishes(editorSlot.day, editorSlot.slotId)}
          onSave={handleEditorSave}
        />
      )}

      {/* Tag management dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Zarządzaj tagami</DialogTitle>
            <DialogDescription>Dodaj lub usuń tagi jadłospisu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const active = pkgTags.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={cn("cursor-pointer text-xs transition-all border", active ? tag.color + " border-2" : "hover:bg-muted")}
                    onClick={() => setPkgTags((prev) => active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id])}
                  >
                    {tag.label} {active && "✓"}
                  </Badge>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nowy tag..."
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNewTag()}
                className="h-8 text-sm"
              />
              <Button size="sm" className="h-8" onClick={addNewTag} disabled={!newTagLabel.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setTagDialogOpen(false)}>Gotowe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
