import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DietLayout from "@/components/DietLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Save, ArrowLeft, Plus, Trash2, ChevronDown, FileText, AlertTriangle,
  Check, HelpCircle, X as XIcon, Clock, Wrench, Search, FlaskConical, Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOCK_DISHES } from "@/data/mockDishes";
import { MOCK_RECIPES } from "@/data/mockRecipes";
import { getProducts, Product } from "@/api/products";
import {
  Dish,
  DishCategory,
  DishStatus,
  DishCompositionItem,
  CompositionRole,
  DietaryExclusion,
  PortionTemplate,
  AllergenEntry,
  DISH_CATEGORY_LABELS,
  DISH_STATUS_LABELS,
  DISH_STATUS_COLORS,
  COMPOSITION_ROLE_LABELS,
} from "@/types/dish";

const ALLERGEN_ICONS: Record<string, string> = {
  Gluten: "🌾", Laktoza: "🥛", Jaja: "🥚", Ryby: "🐟",
  Orzechy: "🥜", Seler: "🥬", Soja: "🫘", Musztarda: "🟡",
  Skorupiaki: "🦐", Sezam: "⚪",
};

const DISH_PRODUCTION_METHODS = [
  "Gotowanie", "Pieczenie", "Smażenie", "Grillowanie", "Duszenie",
  "Sous vide", "Blanszowanie", "Wędzenie", "Marynowanie", "Fermentacja",
  "Bez obróbki termicznej",
  "Pakowanie", "Porcjowanie", "Chłodzenie", "Montaż dania", "Dekoracja",
] as const;

interface DishProductionStage {
  id: string;
  method: string;
  processTime: number;
  workTime: number;
  fromRecipe: boolean;
  recipeName?: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  auto: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  manual: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
  missing: <XIcon className="h-3.5 w-3.5 text-destructive" />,
};

const STATUS_LABEL: Record<string, string> = {
  auto: "Auto", manual: "Ręczny", missing: "Brak",
};

const MODE_LABEL: Record<string, string> = {
  base: "Bazowy", auto_scale: "Auto-skaluj", manual: "Ręczna receptura",
};

export default function DishEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "nowe";
  const existing = !isNew ? MOCK_DISHES.find((d) => d.id === Number(id)) : undefined;

  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState<DishCategory>(existing?.category || "main_hot");
  const [status, setStatus] = useState<DishStatus>(existing?.status || "draft");
  const [description, setDescription] = useState(existing?.description || "");
  const [standardPortion, setStandardPortion] = useState(existing?.standardPortion || 350);
  const [composition, setComposition] = useState<DishCompositionItem[]>(existing?.composition || []);
  const [exclusions, setExclusions] = useState<DietaryExclusion[]>(existing?.exclusions || []);
  const [portionTemplates, setPortionTemplates] = useState<PortionTemplate[]>(
    existing?.portionTemplates || [{ id: "p-base", name: "Standard dorosły", grams: 350, coefficient: 1.0, mode: "base" }]
  );
  const [portionUnit, setPortionUnit] = useState("g");
  const [productionActive, setProductionActive] = useState(existing?.productionVersionActive || false);

  // Allergens auto-computed from composition (recipes/products)
  const allergens = useMemo(() => {
    const allergenMap = new Map<string, string>();
    composition.forEach((item) => {
      // In real app, allergens would come from recipe/product data
      // For now, derive from existing dish data or mock
      const source = MOCK_DISHES.find((d) => d.id === Number(id));
      if (source) {
        source.allergens.forEach((a) => {
          if (a.status !== "free") allergenMap.set(a.name, a.icon);
        });
      }
    });
    return Array.from(allergenMap.entries()).map(([name, icon]) => ({ name, icon }));
  }, [composition, id]);

  // Mock production stages from recipes
  const initStages: DishProductionStage[] = existing ? [
    { id: "rs-1", method: "Gotowanie", processTime: 120, workTime: 10, fromRecipe: true, recipeName: composition[0]?.name || "Receptura" },
    { id: "rs-2", method: "Smażenie", processTime: 8, workTime: 8, fromRecipe: true, recipeName: composition[1]?.name || "Receptura" },
  ] : [];
  const [productionStages, setProductionStages] = useState<DishProductionStage[]>(initStages);
  const [openStages, setOpenStages] = useState(false);

  // Collapsible states
  const [openExclusions, setOpenExclusions] = useState(true);
  const [openPortions, setOpenPortions] = useState(false);
  const [openProduction, setOpenProduction] = useState(false);

  // === LIVE CALCULATIONS ===
  const totals = useMemo(() => {
    return composition.reduce(
      (acc, c) => ({
        kcal: acc.kcal + c.kcal,
        protein: acc.protein + c.protein,
        fat: acc.fat + c.fat,
        carbs: acc.carbs + c.carbs,
        cost: acc.cost + c.cost,
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0 }
    );
  }, [composition]);

  const macroTotal = totals.protein * 4 + totals.fat * 9 + totals.carbs * 4;
  const macroPct = {
    protein: macroTotal > 0 ? ((totals.protein * 4) / macroTotal) * 100 : 0,
    fat: macroTotal > 0 ? ((totals.fat * 9) / macroTotal) * 100 : 0,
    carbs: macroTotal > 0 ? ((totals.carbs * 4) / macroTotal) * 100 : 0,
  };

  const variantCount = exclusions.filter((e) => e.enabled).length + portionTemplates.length;

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const availableRecipes = MOCK_RECIPES;

  const addCompositionEmpty = useCallback(() => {
    setComposition((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`, type: "recipe" as const, referenceId: 0, name: "",
        portionGrams: 0, role: "main" as CompositionRole, kcal: 0, protein: 0, fat: 0, carbs: 0, cost: 0,
      },
    ]);
  }, []);

  const removeComposition = useCallback((id: string) => {
    setComposition((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleExclusion = useCallback((id: string) => {
    setExclusions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  }, []);

  const handleSave = (activate: boolean) => {
    if (!name.trim()) { toast.error("Podaj nazwę dania"); return; }
    toast.success(activate ? "Danie zapisane i aktywowane (mock)" : "Danie zapisane jako szkic (mock)");
  };

  if (!isNew && !existing) {
    return (
      <DietLayout pageKey="diet.meals_approval">
        <div className="text-center py-12 text-muted-foreground">Nie znaleziono dania o ID: {id}</div>
      </DietLayout>
    );
  }

  return (
    <DietLayout pageKey="diet.meals_approval">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dietetyka/dania")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{isNew ? "Nowe danie" : `Edycja: ${existing?.name}`}</h1>
          {existing && <Badge variant="outline" className="text-xs">{existing.version}</Badge>}
          {existing && <Badge className={cn("text-xs", DISH_STATUS_COLORS[existing.status])}>{DISH_STATUS_LABELS[existing.status]}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)}>
            <FileText className="h-4 w-4 mr-2" /> Zapisz jako szkic
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Save className="h-4 w-4 mr-2" /> Zapisz i aktywuj
          </Button>
        </div>
      </div>

      {/* TWO COLUMN: 60/40 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* BASIC INFO */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Dane podstawowe</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label>Nazwa dania</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Zupa ogórkowa" />
                </div>
                <div>
                  <Label>Kategoria</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as DishCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISH_CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Krótki opis dania…" />
              </div>
              <div className="w-52">
                <Label>Porcja standardowa</Label>
                <div className="flex gap-1">
                  <Input type="number" value={standardPortion} onChange={(e) => setStandardPortion(Number(e.target.value))} className="flex-1" />
                  <Select value={portionUnit} onValueChange={setPortionUnit}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COMPOSITION */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kompozycja receptur i produktów</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Receptura / Produkt</TableHead>
                      <TableHead className="w-24 text-right">Porcja (g)</TableHead>
                      <TableHead className="w-28">Rola</TableHead>
                      <TableHead className="w-16 text-right">Kcal</TableHead>
                      <TableHead className="w-20 text-right">Koszt</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {composition.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          Brak składowych — kliknij „Dodaj recepturę"
                        </TableCell>
                      </TableRow>
                    ) : (
                      composition.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            {c.referenceId === 0 ? (
                              <DishCompositionCombobox
                                products={products}
                                recipes={availableRecipes}
                                onSelect={(type, refId, itemName) => {
                                  setComposition((prev) =>
                                    prev.map((item) =>
                                      item.id === c.id ? { ...item, type, referenceId: refId, name: itemName } : item
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {c.type === "recipe" ? "R" : "P"}
                                </Badge>
                                <span className="text-sm">{c.name || "—"}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm">{c.portionGrams}g</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{COMPOSITION_ROLE_LABELS[c.role]}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{c.kcal}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{c.cost.toFixed(2)} zł</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeComposition(c.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {composition.length > 0 && (
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell className="text-xs">RAZEM</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-right text-xs font-bold">{totals.kcal}</TableCell>
                        <TableCell className="text-right text-xs font-bold">{totals.cost.toFixed(2)} zł</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={addCompositionEmpty}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj recepturę / produkt
              </Button>
            </CardContent>
          </Card>

          {/* VARIANT DIMENSION 1: DIETARY EXCLUSIONS */}
          <Collapsible open={openExclusions} onOpenChange={setOpenExclusions}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Wymiar 1: Wyłączenia dietetyczne</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openExclusions && "rotate-180")} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {exclusions.map((ex) => (
                      <Button
                        key={ex.id}
                        variant={ex.enabled ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => toggleExclusion(ex.id)}
                      >
                        {ex.enabled ? "✅" : "☐"} {ex.name}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                      <Plus className="h-3 w-3 mr-1" /> Dodaj własny
                    </Button>
                  </div>

                  {exclusions.filter((e) => e.enabled).map((ex) => (
                    <div key={ex.id} className="mt-3">
                      <p className="text-xs font-medium mb-1">{ex.name} — zamienniki:</p>
                      {ex.substitutions.length === 0 ? (
                        <p className="text-xs text-muted-foreground ml-2">Brak zdefiniowanych zamian</p>
                      ) : (
                        <div className="border rounded overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Składnik oryginalny</TableHead>
                                <TableHead className="text-xs">→ Zamiennik</TableHead>
                                <TableHead className="text-xs w-24">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ex.substitutions.map((sub) => (
                                <TableRow key={sub.id}>
                                  <TableCell className="text-xs">{sub.originalIngredient}</TableCell>
                                  <TableCell className="text-xs font-medium">{sub.replacement}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-xs">
                                      {STATUS_ICON[sub.status]}
                                      <span>{STATUS_LABEL[sub.status]}</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Automatyczne zamienniki mogą wpłynąć na wartości odżywcze — do weryfikacji przy implementacji.</span>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* INFO: PORTION SIZES MOVED TO MEAL PLANS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Wymiar 2: Rozmiary porcji</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Rozmiary porcji definiowane są w jadłospisach — dla każdego posiłku osobno.</p>
            </CardContent>
          </Card>

          {/* VARIANT DIMENSION 3: OFFICIAL vs PRODUCTION */}
          <Collapsible open={openProduction} onOpenChange={setOpenProduction}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Wymiar 3: Oficjalna vs Produkcyjna</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openProduction && "rotate-180")} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch checked={productionActive} onCheckedChange={setProductionActive} />
                    <Label className="text-sm">Wersja produkcyjna aktywna</Label>
                  </div>
                  {productionActive ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-primary/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs text-primary">Oficjalna</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                          {composition.map((c) => (
                            <div key={c.id} className="flex justify-between">
                              <span>{c.name}</span>
                              <span>{c.portionGrams}g</span>
                            </div>
                          ))}
                          <div className="pt-1 border-t font-medium flex justify-between">
                            <span>Kcal</span><span>{totals.kcal}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-amber-300">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs text-amber-700">Produkcyjna</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1 text-muted-foreground">
                          <p>Edycja wersji produkcyjnej — w przygotowaniu.</p>
                          <p className="text-[10px]">Side-by-side z podświetlonymi różnicami.</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Włącz toggle, aby edytować wersję produkcyjną.</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* PRODUCTION STAGES */}
          <Collapsible open={openStages} onOpenChange={setOpenStages}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Etapy produkcji</span>
                    <div className="flex items-center gap-2">
                      {productionStages.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {productionStages.reduce((s, p) => s + p.workTime, 0)} min pracy
                        </Badge>
                      )}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openStages && "rotate-180")} />
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  {productionStages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">Brak etapów — dodaj lub pobierz z receptur</p>
                  )}
                  {productionStages.map((stage, i) => (
                    <div key={stage.id} className={cn("border rounded-md p-3 space-y-2", stage.fromRecipe && "border-l-2 border-l-primary bg-primary/5")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Etap {i + 1}</span>
                          {stage.fromRecipe && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Wrench className="h-2.5 w-2.5" /> z receptury: {stage.recipeName}
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setProductionStages(prev => prev.filter(p => p.id !== stage.id))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Metoda / Czynność</Label>
                          <Select value={stage.method} onValueChange={(v) => setProductionStages(prev => prev.map(p => p.id === stage.id ? { ...p, method: v } : p))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Wybierz…" /></SelectTrigger>
                            <SelectContent>
                              {DISH_PRODUCTION_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Czas procesu (min)</Label>
                          <Input type="number" className="h-8 text-xs" value={stage.processTime || ""} onChange={(e) => setProductionStages(prev => prev.map(p => p.id === stage.id ? { ...p, processTime: Number(e.target.value) } : p))} />
                        </div>
                        <div>
                          <Label className="text-xs">Czas pracy (min)</Label>
                          <Input type="number" className="h-8 text-xs" value={stage.workTime || ""} onChange={(e) => setProductionStages(prev => prev.map(p => p.id === stage.id ? { ...p, workTime: Number(e.target.value) } : p))} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setProductionStages(prev => [...prev, {
                      id: `ds-${Date.now()}`, method: "", processTime: 0, workTime: 0, fromRecipe: false,
                    }])}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj etap
                    </Button>
                  </div>

                  {productionStages.length > 0 && (
                    <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>Łączny czas procesu: <strong>{productionStages.reduce((s, p) => s + p.processTime, 0)} min</strong></span>
                      <span>Łączny czas pracy: <strong>{productionStages.reduce((s, p) => s + p.workTime, 0)} min</strong></span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-2 bg-muted/50 border rounded text-xs text-muted-foreground">
                    <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Etapy z receptur są importowane automatycznie. Dodaj własne etapy (np. Pakowanie, Porcjowanie) specyficzne dla dania.</span>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="space-y-4">
          {/* NUTRITION SUMMARY */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Podsumowanie odżywcze</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Kcal</span>
                  <span className="font-bold">{totals.kcal}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Białko</span>
                  <span className="font-bold">{totals.protein}g</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Tłuszcz</span>
                  <span className="font-bold">{totals.fat}g</span>
                </div>
                 <div className="flex justify-between p-2 bg-muted/50 rounded">
                   <span className="text-muted-foreground">Węglowodany</span>
                   <span className="font-bold">{totals.carbs}g</span>
                 </div>
                 <div className="flex justify-between p-2 bg-muted/50 rounded">
                   <span className="text-muted-foreground">Sól</span>
                   <span className="font-bold">0g</span>
                 </div>
               </div>

              {/* PIE */}
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
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /> Białko {macroPct.protein.toFixed(0)}%</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "hsl(210 60% 55%)" }} /> Tłuszcz {macroPct.fat.toFixed(0)}%</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "hsl(45 85% 55%)" }} /> Węglowodany {macroPct.carbs.toFixed(0)}%</div>
                </div>
              </div>

              {/* COST */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Koszt / porcję</span>
                <span className="text-lg font-bold">{totals.cost.toFixed(2)} zł</span>
              </div>
            </CardContent>
          </Card>

          {/* ALLERGENS */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Alergeny</CardTitle></CardHeader>
            <CardContent>
              {allergens.length === 0 ? (
                <p className="text-xs text-muted-foreground">Brak alergenów w składnikach</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allergens.map((a) => (
                    <Badge key={a.name} variant="secondary" className="text-xs gap-1">
                      <span>{a.icon}</span>{a.name}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                Automatycznie na podstawie receptur i składników.
              </p>
            </CardContent>
          </Card>

          {/* STATUS + SUMMARY */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Status i przegląd</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DishStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISH_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <div className="flex justify-between"><span>Receptury / produkty</span><span className="font-medium">{composition.length}</span></div>
                <div className="flex justify-between"><span>Warianty</span><span className="font-medium">{variantCount}</span></div>
                <div className="flex justify-between"><span>Alergeny</span><span className="font-medium">{allergens.length}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DietLayout>
  );
}

// === DISH COMPOSITION COMBOBOX ===

interface DishCompositionComboboxProps {
  products: Product[];
  recipes: { id: number; name: string; portionWeight: number }[];
  onSelect: (type: "recipe" | "product", id: number, name: string) => void;
}

function DishCompositionCombobox({ products, recipes, onSelect }: DishCompositionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 20);
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 20);
  }, [products, search]);

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes.slice(0, 10);
    const q = search.toLowerCase();
    return recipes.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 10);
  }, [recipes, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 w-full justify-start font-normal text-muted-foreground">
          <Search className="h-3 w-3" />
          Wyszukaj produkt lub recepturę…
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-popover z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Szukaj produktu lub receptury…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nie znaleziono.</CommandEmpty>
            {filteredProducts.length > 0 && (
              <CommandGroup heading="Produkty">
                {filteredProducts.map((p) => (
                  <CommandItem
                    key={`product-${p.id}`}
                    value={`product-${p.id}`}
                    onSelect={() => {
                      onSelect("product", p.id, p.name);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="text-sm">{p.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {filteredRecipes.length > 0 && (
              <CommandGroup heading="Receptury">
                {filteredRecipes.map((r) => (
                  <CommandItem
                    key={`recipe-${r.id}`}
                    value={`recipe-${r.id}`}
                    onSelect={() => {
                      onSelect("recipe", r.id, r.name);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span className="text-sm">{r.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {r.portionWeight}g
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
