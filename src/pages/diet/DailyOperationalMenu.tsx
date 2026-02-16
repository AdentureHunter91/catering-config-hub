import { useState } from "react";
import { useParams } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Printer, Download, RefreshCw, CheckCircle, AlertTriangle, Eye, List, RotateCcw } from "lucide-react";
import { mockMenuPackages } from "@/data/mockMenuPackages";
import { DEFAULT_MEAL_SLOTS } from "@/types/menuPackage";
import { cn } from "@/lib/utils";
import MenuCellContent from "@/components/MenuCellContent";

const DAY_NAMES_FULL = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

function getColumnSlots() {
  const cols: { id: string; label: string; parentLabel?: string }[] = [];
  for (const slot of DEFAULT_MEAL_SLOTS) {
    if (slot.subSlots) {
      for (const sub of slot.subSlots) {
        cols.push({ id: sub.id, label: sub.name, parentLabel: slot.name });
      }
    } else {
      cols.push({ id: slot.id, label: slot.name });
    }
  }
  return cols;
}

const columnSlots = getColumnSlots();

const portionCounts: Record<string, number> = {
  STANDARD: 45,
  GF: 8,
  DIABETIC: 12,
  RENAL: 4,
};

export default function DailyOperationalMenu() {
  const { id } = useParams();
  const pkg = mockMenuPackages.find((p) => p.id === Number(id)) ?? mockMenuPackages[0];
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedClient] = useState(pkg.clientName);
  const [lastSync] = useState("12.02.2026 07:30");
  const [detailLevel, setDetailLevel] = useState<"general" | "detailed">("general");
  const [transposed, setTransposed] = useState(false);

  const baseDiet = pkg.dietPlans.find((d) => d.dietType === "base");

  const getCell = (dietIdx: number, slotId: string) => {
    const diet = pkg.dietPlans[dietIdx];
    return diet?.weeks[0]?.cells.find((c) => c.dayIndex === selectedDay && c.mealSlotId === slotId) ?? null;
  };

  const isDifferentFromBase = (dietIdx: number, slotId: string) => {
    if (!baseDiet || pkg.dietPlans[dietIdx].dietType === "base") return false;
    const baseCell = baseDiet.weeks[0]?.cells.find((c) => c.dayIndex === selectedDay && c.mealSlotId === slotId);
    const cell = getCell(dietIdx, slotId);
    return baseCell?.dish?.id !== cell?.dish?.id;
  };

  const totalPortions = Object.values(portionCounts).reduce((a, b) => a + b, 0);
  const totalCost = pkg.dietPlans.reduce((sum, diet) => {
    const portions = portionCounts[diet.dietCode] ?? 0;
    const dayCost = diet.weeks[0]?.cells
      .filter((c) => c.dayIndex === selectedDay)
      .reduce((s, c) => s + (c.dish?.cost ?? 0), 0) ?? 0;
    return sum + dayCost * (portions / 8);
  }, 0);

  const isDetailed = detailLevel === "detailed";

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Jadłospis dzienny operacyjny</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Drukuj</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Eksport</Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <Select value={selectedClient} disabled>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={selectedClient}>{selectedClient}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))} disabled={selectedDay === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[140px] text-center">
              {DAY_NAMES_FULL[selectedDay]}, 12.02.2026
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))} disabled={selectedDay >= 6}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Źródło zamówień: Panel Klienta ✅ (sync: {lastSync})</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs"><RefreshCw className="h-3 w-3 mr-1" /> Odśwież</Button>
          </div>

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
        </div>

        {/* Main grid */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <TooltipProvider>
              {!transposed ? (
                /* Normal: rows=diets, cols=slots */
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-2 text-left w-32 font-medium text-muted-foreground">Dieta</th>
                      {columnSlots.map((col) => (
                        <th key={col.id} className="p-2 text-center font-medium text-muted-foreground">
                          {col.parentLabel && <span className="text-[10px] block text-muted-foreground/60">{col.parentLabel}</span>}
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.dietPlans.map((diet, dietIdx) => {
                      const portions = portionCounts[diet.dietCode] ?? 0;
                      return (
                        <tr key={diet.dietId} className="border-b hover:bg-muted/20">
                          <td className="p-2">
                            <div className="font-medium text-sm">{diet.dietCode}</div>
                            <div className="text-[10px] text-muted-foreground">{diet.dietName}</div>
                            <Badge variant="outline" className="text-[10px] mt-0.5">{portions > 0 ? `${portions} porcji` : "? porcji"}</Badge>
                          </td>
                          {columnSlots.map((col) => {
                            const cell = getCell(dietIdx, col.id);
                            const diffFromBase = isDifferentFromBase(dietIdx, col.id);
                            return (
                              <td
                                key={col.id}
                                className={cn(
                                  "p-1.5 border-l cursor-pointer transition-colors hover:bg-primary/5",
                                  diffFromBase && "bg-blue-50 dark:bg-blue-950/20",
                                )}
                              >
                                <MenuCellContent
                                  dish={cell?.dish ?? null}
                                  detailed={isDetailed}
                                  diffFromBase={diffFromBase}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                /* Transposed: rows=slots, cols=diets */
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-2 text-left w-24 font-medium text-muted-foreground">Posiłek</th>
                      {pkg.dietPlans.map((diet) => {
                        const portions = portionCounts[diet.dietCode] ?? 0;
                        return (
                          <th key={diet.dietId} className="p-2 text-center font-medium text-muted-foreground">
                            <div>{diet.dietCode}</div>
                            <div className="text-[10px] text-muted-foreground/60">{diet.dietName}</div>
                            <Badge variant="outline" className="text-[10px] mt-0.5">{portions > 0 ? `${portions} porcji` : "? porcji"}</Badge>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {columnSlots.map((col) => (
                      <tr key={col.id} className="border-b hover:bg-muted/20">
                        <td className="p-2 font-medium text-muted-foreground">
                          {col.parentLabel && <span className="text-[10px] block text-muted-foreground/60">{col.parentLabel}</span>}
                          {col.label}
                        </td>
                        {pkg.dietPlans.map((diet, dietIdx) => {
                          const cell = getCell(dietIdx, col.id);
                          const diffFromBase = isDifferentFromBase(dietIdx, col.id);
                          return (
                            <td
                              key={diet.dietId}
                              className={cn(
                                "p-1.5 border-l cursor-pointer transition-colors hover:bg-primary/5",
                                diffFromBase && "bg-blue-50 dark:bg-blue-950/20",
                              )}
                            >
                              <MenuCellContent
                                dish={cell?.dish ?? null}
                                detailed={isDetailed}
                                diffFromBase={diffFromBase}
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

        {/* Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-2">Podsumowanie dnia</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Łączna liczba porcji:</span>
                <span className="ml-2 font-mono font-medium">{totalPortions}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Liczba diet:</span>
                <span className="ml-2 font-mono font-medium">{pkg.dietPlans.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Koszt dnia (est.):</span>
                <span className="ml-2 font-mono font-medium">{totalCost.toFixed(2)} PLN</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-muted-foreground">2 pozycje z alertem alergenowym</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DietLayout>
  );
}
