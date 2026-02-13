import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOCK_RECIPES } from "@/data/mockRecipes";
import {
  Recipe,
  RecipeIngredient,
  RecipeCategory,
  RecipeStatus,
  RECIPE_CATEGORY_LABELS,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_COLORS,
} from "@/types/recipe";

const ALLERGEN_ICONS: Record<string, string> = {
  Gluten: "🌾", Laktoza: "🥛", Jaja: "🥚", Ryby: "🐟",
  Orzechy: "🥜", Seler: "🥬", Soja: "🫘", Musztarda: "🟡",
  Skorupiaki: "🦐", Sezam: "⚪",
};

const COOKING_METHODS = [
  // Obróbka wstępna
  { group: "Obróbka wstępna", items: ["Obieranie", "Krojenie", "Szatkowanie", "Mielenie", "Ucieranie", "Siekanie", "Mycie", "Namaczanie"] },
  // Obróbka termiczna
  { group: "Obróbka termiczna", items: ["Gotowanie", "Pieczenie", "Smażenie", "Grillowanie", "Duszenie", "Sous vide", "Blanszowanie", "Wędzenie", "Podgrzewanie"] },
  // Inne procesy
  { group: "Inne procesy", items: ["Marynowanie", "Fermentacja", "Chłodzenie", "Mrożenie", "Mieszanie", "Emulgowanie", "Przecieranie", "Filtrowanie", "Bez obróbki"] },
];

const ALL_METHODS = COOKING_METHODS.flatMap(g => g.items);

type StageInput = { type: "ingredient"; id: string } | { type: "stage"; id: string };

interface CookingParam {
  id: string;
  method: string;
  temp: number | null;
  processTime: number;
  workTime: number;
  lossPercent: number;
  inputs: StageInput[];
}

// Mock allergens per product referenceId
const PRODUCT_ALLERGENS: Record<number, string[]> = {
  101: [], 102: [], 103: [], 104: ["Seler"], 105: ["Gluten"], 106: [],
  107: [], 108: [], 109: [], 110: ["Jaja"], 111: ["Gluten"], 112: [],
  113: [], 114: ["Seler"], 115: ["Laktoza"], 116: [], 117: ["Laktoza"],
  118: ["Gluten"], 119: ["Laktoza"], 120: [], 121: [], 122: ["Laktoza"],
  123: [], 124: [], 125: [], 126: [], 127: [], 128: [], 129: [], 130: [],
  131: [], 132: [],
};

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "nowa";
  const existing = !isNew ? MOCK_RECIPES.find((r) => r.id === Number(id)) : undefined;

  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState<RecipeCategory>(existing?.category || "main_course");
  const [status, setStatus] = useState<RecipeStatus>(existing?.status || "draft");
  const [portionWeight, setPortionWeight] = useState(existing?.portionWeight || 350);
  const initParams: CookingParam[] = existing ? [{
    id: "p1",
    method: existing.cookingMethod,
    temp: existing.cookingTemp,
    processTime: existing.cookingTime || 0,
    workTime: Math.round((existing.cookingTime || 0) * 0.15),
    lossPercent: existing.lossCoefficient,
    inputs: existing.ingredients.length > 0 ? [{ type: "ingredient" as const, id: existing.ingredients[0].id }] : [],
  }] : [];
  const [cookingParams, setCookingParams] = useState<CookingParam[]>(initParams);
  const [notes, setNotes] = useState(existing?.notes || "");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(existing?.ingredients || []);
  const [activeTab, setActiveTab] = useState("official");

  // === LIVE CALCULATIONS ===
  const totals = useMemo(() => {
    return ingredients.reduce(
      (acc, ing) => ({
        kcal: acc.kcal + ing.kcal,
        protein: acc.protein + ing.protein,
        fat: acc.fat + ing.fat,
        carbs: acc.carbs + ing.carbs,
        cost: acc.cost + ing.cost,
        grossWeight: acc.grossWeight + ing.grossWeight,
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0, grossWeight: 0 }
    );
  }, [ingredients]);

  const macroTotal = totals.protein * 4 + totals.fat * 9 + totals.carbs * 4;
  const macroPct = {
    protein: macroTotal > 0 ? ((totals.protein * 4) / macroTotal) * 100 : 0,
    fat: macroTotal > 0 ? ((totals.fat * 9) / macroTotal) * 100 : 0,
    carbs: macroTotal > 0 ? ((totals.carbs * 4) / macroTotal) * 100 : 0,
  };

  const topCostIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => b.cost - a.cost).slice(0, 3);
  }, [ingredients]);

  const allergens = useMemo(() => {
    const set = new Set<string>();
    // In real app this would come from product allergens
    if (existing?.allergens) existing.allergens.forEach((a) => set.add(a));
    return Array.from(set);
  }, [existing]);

  // === INGREDIENT ACTIONS ===
  const moveIngredient = useCallback((index: number, direction: -1 | 1) => {
    setIngredients((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((ing, i) => ({ ...ing, sortOrder: i + 1 }));
    });
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  const updateIngredientField = useCallback(
    (id: string, field: keyof RecipeIngredient, value: number) => {
      setIngredients((prev) =>
        prev.map((ing) => {
          if (ing.id !== id) return ing;
          const updated = { ...ing, [field]: value };
          if (field === "quantity" || field === "wastePercent") {
            updated.grossWeight = updated.quantity * (1 + updated.wastePercent / 100);
          }
          return updated;
        })
      );
    },
    []
  );

  const addIngredient = useCallback(() => {
    const newIng: RecipeIngredient = {
      id: `new-${Date.now()}`,
      sortOrder: ingredients.length + 1,
      type: "product",
      referenceId: 0,
      name: "",
      quantity: 0,
      unit: "g",
      wastePercent: 0,
      techLoss: 0,
      grossWeight: 0,
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      cost: 0,
    };
    setIngredients((prev) => [...prev, newIng]);
  }, [ingredients.length]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Podaj nazwę receptury");
      return;
    }
    toast.success("Receptura zapisana (mock)");
  };

  if (!isNew && !existing) {
    return (
      <DietLayout pageKey="diet.meals_approval">
        <div className="text-center py-12 text-muted-foreground">
          Nie znaleziono receptury o ID: {id}
        </div>
      </DietLayout>
    );
  }

  return (
    <DietLayout pageKey="diet.meals_approval">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dietetyka/receptury")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">
            {isNew ? "Nowa receptura" : `Edycja: ${existing?.name}`}
          </h1>
          {existing && (
            <Badge variant="outline" className="text-xs">{existing.version}</Badge>
          )}
          {existing && (
            <Badge className={cn("text-xs", RECIPE_STATUS_COLORS[existing.status])}>
              {RECIPE_STATUS_LABELS[existing.status]}
            </Badge>
          )}
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Zapisz
        </Button>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label>Nazwa receptury</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Rosół z makaronem" />
            </div>
            <div>
              <Label>Kategoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as RecipeCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RECIPE_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Porcja (g)</Label>
              <Input type="number" value={portionWeight} onChange={(e) => setPortionWeight(Number(e.target.value))} />
            </div>
          </div>

          {/* TABS: OFFICIAL / PRODUCTION */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="official">Oficjalna</TabsTrigger>
              <TabsTrigger value="production">
                Produkcyjna
                {activeTab === "production" && (
                  <Badge variant="outline" className="ml-2 text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                    <AlertTriangle className="h-3 w-3 mr-0.5" /> Kuchnia
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="official" className="mt-3">
              <IngredientsTable
                ingredients={ingredients}
                onMove={moveIngredient}
                onRemove={removeIngredient}
                onUpdate={updateIngredientField}
                onAdd={addIngredient}
                totals={totals}
                showGross={false}
              />
            </TabsContent>

            <TabsContent value="production" className="mt-3">
              <IngredientsTable
                ingredients={ingredients}
                onMove={moveIngredient}
                onRemove={removeIngredient}
                onUpdate={updateIngredientField}
                onAdd={addIngredient}
                totals={totals}
                showGross={true}
              />
            </TabsContent>
          </Tabs>

          {/* COOKING PARAMS */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Parametry przygotowania</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setCookingParams(prev => [...prev, {
                  id: `cp-${Date.now()}`, method: "", temp: null, processTime: 0, workTime: 0, lossPercent: 0, inputs: [],
                }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj etap
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cookingParams.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">Brak etapów — kliknij „Dodaj etap"</p>
              )}
              {cookingParams.map((cp, i) => {
                // Build available "previous stage outputs"
                const previousStages = cookingParams.slice(0, i);
                return (
                <div key={cp.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Etap {i + 1}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0}
                        onClick={() => setCookingParams(prev => { const n = [...prev]; [n[i], n[i-1]] = [n[i-1], n[i]]; return n; })}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === cookingParams.length - 1}
                        onClick={() => setCookingParams(prev => { const n = [...prev]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n; })}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => setCookingParams(prev => prev.filter(p => p.id !== cp.id))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="col-span-2 md:col-span-1">
                      <Label className="text-xs">Metoda</Label>
                      <Select value={cp.method} onValueChange={(v) => setCookingParams(prev => prev.map(p => p.id === cp.id ? { ...p, method: v } : p))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Wybierz…" /></SelectTrigger>
                        <SelectContent>
                          {COOKING_METHODS.map(group => (
                            <React.Fragment key={group.group}>
                              <SelectItem value={`__group_${group.group}`} disabled className="text-xs font-semibold text-muted-foreground pointer-events-none">
                                {group.group}
                              </SelectItem>
                              {group.items.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Temp. (°C)</Label>
                      <Input type="number" className="h-8 text-xs" value={cp.temp ?? ""} onChange={(e) => setCookingParams(prev => prev.map(p => p.id === cp.id ? { ...p, temp: e.target.value ? Number(e.target.value) : null } : p))} />
                    </div>
                    <div>
                      <Label className="text-xs">Czas procesu (min)</Label>
                      <Input type="number" className="h-8 text-xs" value={cp.processTime || ""} onChange={(e) => setCookingParams(prev => prev.map(p => p.id === cp.id ? { ...p, processTime: Number(e.target.value) } : p))} />
                    </div>
                    <div>
                      <Label className="text-xs">Czas pracy (min)</Label>
                      <Input type="number" className="h-8 text-xs" value={cp.workTime || ""} onChange={(e) => setCookingParams(prev => prev.map(p => p.id === cp.id ? { ...p, workTime: Number(e.target.value) } : p))} />
                    </div>
                    <div>
                      <Label className="text-xs">Straty (%)</Label>
                      <Input type="number" className="h-8 text-xs" value={cp.lossPercent || ""} onChange={(e) => setCookingParams(prev => prev.map(p => p.id === cp.id ? { ...p, lossPercent: Number(e.target.value) } : p))} />
                    </div>
                  </div>

                  {/* INPUTS: ingredients or previous stage outputs */}
                  <div>
                    <Label className="text-xs">Dotyczy (składniki / wynikowe z etapów)</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {cp.inputs.map((input, ii) => {
                        const label = input.type === "ingredient"
                          ? ingredients.find(ing => ing.id === input.id)?.name || "(składnik)"
                          : `Wynik etapu ${cookingParams.findIndex(s => s.id === input.id) + 1}`;
                        return (
                          <Badge key={ii} variant="secondary" className="gap-1 text-xs pr-1">
                            {input.type === "stage" && <span className="text-primary">↩</span>}
                            {label}
                            <button className="ml-0.5 hover:text-destructive" onClick={() =>
                              setCookingParams(prev => prev.map(p => p.id === cp.id
                                ? { ...p, inputs: p.inputs.filter((_, idx) => idx !== ii) }
                                : p
                              ))
                            }>×</button>
                          </Badge>
                        );
                      })}
                      {/* Add input dropdown */}
                      <Select value="none" onValueChange={(v) => {
                        if (v === "none") return;
                        const [type, refId] = v.split("::");
                        const newInput: StageInput = { type: type as "ingredient" | "stage", id: refId };
                        // Don't add duplicates
                        if (cp.inputs.some(inp => inp.type === newInput.type && inp.id === newInput.id)) return;
                        setCookingParams(prev => prev.map(p => p.id === cp.id
                          ? { ...p, inputs: [...p.inputs, newInput] }
                          : p
                        ));
                      }}>
                        <SelectTrigger className="h-7 text-xs w-auto min-w-[140px] border-dashed">
                          <SelectValue placeholder="+ Dodaj…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled className="text-xs text-muted-foreground">+ Dodaj element…</SelectItem>
                          {ingredients.length > 0 && (
                            <SelectItem value="__grp_ing" disabled className="text-xs font-semibold text-muted-foreground pointer-events-none">
                              Składniki
                            </SelectItem>
                          )}
                          {ingredients.map(ing => (
                            <SelectItem key={ing.id} value={`ingredient::${ing.id}`} className="text-xs">
                              {ing.name || `Składnik #${ing.sortOrder}`}
                            </SelectItem>
                          ))}
                          {previousStages.length > 0 && (
                            <SelectItem value="__grp_stg" disabled className="text-xs font-semibold text-muted-foreground pointer-events-none">
                              Wynikowe z etapów
                            </SelectItem>
                          )}
                          {previousStages.map((ps, pi) => (
                            <SelectItem key={ps.id} value={`stage::${ps.id}`} className="text-xs">
                              ↩ Wynik etapu {pi + 1}{ps.method ? ` (${ps.method})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                );
              })}
              {cookingParams.length > 0 && (
                <div className="flex gap-4 text-xs text-muted-foreground pt-1 border-t">
                  <span>Łączny czas procesu: <strong>{cookingParams.reduce((s, p) => s + p.processTime, 0)} min</strong></span>
                  <span>Łączny czas pracy: <strong>{cookingParams.reduce((s, p) => s + p.workTime, 0)} min</strong></span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NOTES */}
          <div>
            <Label>Notatki / Instrukcje</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Szczegółowe instrukcje przygotowania…"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* NUTRITION SUMMARY */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Podsumowanie odżywcze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Kcal</span>
                  <span className="font-bold">{totals.kcal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Białko</span>
                  <span className="font-bold">{totals.protein.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Tłuszcz</span>
                  <span className="font-bold">{totals.fat.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Węglowodany</span>
                  <span className="font-bold">{totals.carbs.toFixed(1)}g</span>
                </div>
              </div>

              {/* PIE CHART - CSS based */}
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(
                      hsl(var(--primary)) 0% ${macroPct.protein}%, 
                      hsl(210 60% 55%) ${macroPct.protein}% ${macroPct.protein + macroPct.fat}%, 
                      hsl(45 85% 55%) ${macroPct.protein + macroPct.fat}% 100%
                    )`,
                  }}
                />
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    Białko {macroPct.protein.toFixed(0)}%
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: "hsl(210 60% 55%)" }} />
                    Tłuszcz {macroPct.fat.toFixed(0)}%
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: "hsl(45 85% 55%)" }} />
                    Węglowodany {macroPct.carbs.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* FOOD COST */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">FoodCost</span>
                  <span className="text-lg font-bold">{totals.cost.toFixed(2)} zł</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {portionWeight > 0 && (
                    <span>({(totals.cost / (portionWeight / 1000)).toFixed(2)} zł/kg)</span>
                  )}
                </div>
              </div>

              {/* ALL INGREDIENTS - OFFICIAL vs PRODUCTION COST */}
              {ingredients.length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Składniki — koszt</p>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1"
                      onClick={() => {
                        toast.success("Skopiowano ceny oficjalne na produkcyjne");
                      }}>
                      Kopiuj oficjalną → produkcyjną
                    </Button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 text-xs">
                    <span className="text-[10px] text-muted-foreground font-medium">Składnik</span>
                    <span className="text-[10px] text-muted-foreground font-medium text-right">Oficj.</span>
                    <span className="text-[10px] text-muted-foreground font-medium text-right">Prod.</span>
                    {ingredients.map((ing) => {
                      const prodCost = +(ing.cost * 1.05).toFixed(2); // mock: production cost slightly higher
                      return (
                        <React.Fragment key={ing.id}>
                          <span className="truncate py-0.5">{ing.name || "(brak nazwy)"}</span>
                          <span className="font-medium text-right py-0.5 tabular-nums">{ing.cost.toFixed(2)}</span>
                          <span className="font-medium text-right py-0.5 tabular-nums text-amber-700">{prodCost.toFixed(2)}</span>
                        </React.Fragment>
                      );
                    })}
                    {/* Total row */}
                    <span className="font-bold border-t pt-1 mt-1">RAZEM</span>
                    <span className="font-bold text-right border-t pt-1 mt-1 tabular-nums">{totals.cost.toFixed(2)}</span>
                    <span className="font-bold text-right border-t pt-1 mt-1 tabular-nums text-amber-700">
                      {ingredients.reduce((s, ing) => s + +(ing.cost * 1.05).toFixed(2), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ALLERGENS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Alergeny</CardTitle>
            </CardHeader>
            <CardContent>
              {allergens.length === 0 ? (
                <p className="text-xs text-muted-foreground">Brak alergenów</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allergens.map((a) => (
                    <Badge key={a} variant="outline" className="gap-1 text-xs">
                      <span>{ALLERGEN_ICONS[a] || "⚠️"}</span>
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                Alergeny obliczane automatycznie na podstawie składników
              </p>
            </CardContent>
          </Card>

          {/* STATUS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => setStatus(v as RecipeStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RECIPE_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </DietLayout>
  );
}

// === INGREDIENTS TABLE ===

interface IngredientsTableProps {
  ingredients: RecipeIngredient[];
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof RecipeIngredient, value: number) => void;
  onAdd: () => void;
  totals: { kcal: number; protein: number; fat: number; carbs: number; cost: number; grossWeight: number };
  showGross: boolean;
}

function IngredientsTable({ ingredients, onMove, onRemove, onUpdate, onAdd, totals, showGross }: IngredientsTableProps) {
  const getIngAllergens = (ing: RecipeIngredient): string[] => {
    return PRODUCT_ALLERGENS[ing.referenceId] || [];
  };

  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead className="min-w-[240px]">Składnik</TableHead>
            <TableHead className="w-24 text-right">Ilość</TableHead>
            <TableHead className="w-16">Jedn.</TableHead>
            <TableHead className="w-24 text-right">Straty %</TableHead>
            {showGross && <TableHead className="w-24 text-right">Brutto</TableHead>}
            <TableHead className="w-20 text-right">Kcal</TableHead>
            <TableHead className="w-20 text-right">Białko</TableHead>
            <TableHead className="w-24 text-right">Koszt</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showGross ? 10 : 9} className="text-center text-muted-foreground py-6">
                Brak składników — kliknij „Dodaj składnik"
              </TableCell>
            </TableRow>
          ) : (
            ingredients.map((ing, idx) => {
              const ingAllergens = getIngAllergens(ing);
              return (
                <TableRow
                  key={ing.id}
                  className={cn(
                    ing.type === "recipe" && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {ing.type === "recipe" && <span className="text-primary font-medium">→</span>}
                      <span className="text-xs truncate">{ing.name || "Wyszukaj składnik…"}</span>
                      {ingAllergens.length > 0 && (
                        <div className="flex gap-0.5 shrink-0">
                          {ingAllergens.map(a => (
                            <span key={a} className="text-xs" title={a}>{ALLERGEN_ICONS[a] || "⚠️"}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => onUpdate(ing.id, "quantity", Number(e.target.value))}
                      className="h-7 text-xs text-right w-full"
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ing.unit}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={ing.wastePercent}
                      onChange={(e) => onUpdate(ing.id, "wastePercent", Number(e.target.value))}
                      className="h-7 text-xs text-right w-full"
                    />
                  </TableCell>
                  {showGross && (
                    <TableCell className="text-right text-xs">{ing.grossWeight.toFixed(0)}g</TableCell>
                  )}
                  <TableCell className="text-right text-xs tabular-nums">{ing.kcal}</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">{ing.protein}g</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">{ing.cost.toFixed(2)} zł</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6"
                        disabled={idx === 0}
                        onClick={() => onMove(idx, -1)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6"
                        disabled={idx === ingredients.length - 1}
                        onClick={() => onMove(idx, 1)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onRemove(ing.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}

          {/* TOTALS ROW */}
          {ingredients.length > 0 && (
            <TableRow className="bg-muted/50 font-medium">
              <TableCell />
              <TableCell className="text-xs">RAZEM</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              {showGross && <TableCell className="text-right text-xs">{totals.grossWeight.toFixed(0)}g</TableCell>}
              <TableCell className="text-right text-xs font-bold">{totals.kcal.toFixed(0)}</TableCell>
              <TableCell className="text-right text-xs font-bold">{totals.protein.toFixed(1)}g</TableCell>
              <TableCell className="text-right text-xs font-bold">{totals.cost.toFixed(2)} zł</TableCell>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="p-2 border-t">
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj składnik
        </Button>
      </div>
    </div>
  );
}
