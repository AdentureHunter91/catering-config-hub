import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Input } from "@/components/ui/input";
import { getMealTypes, MealType } from "@/api/mealTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Save, ArrowLeft, Plus, Trash2, ChevronDown, FileText,
  Link2, Pencil, ArrowUp, ArrowDown, Info, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOCK_DIET_PLANS } from "@/data/mockDietPlans";
import {
  DietPlan, DietPlanStatus, MealSlot, NutritionGoal, DietExclusion, DietSubstitution, DietClientAssignment,
  DIET_PLAN_STATUS_LABELS, DIET_PLAN_STATUS_COLORS,
} from "@/types/dietPlan";

const EU_ALLERGENS = [
  "Gluten", "Skorupiaki", "Jaja", "Ryby", "Orzeszki ziemne", "Soja",
  "Mleko/Laktoza", "Orzechy", "Seler", "Gorczyca", "Sezam",
  "Dwutlenek siarki", "Łubin", "Mięczaki",
];

export default function DietPlanEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "nowy";
  const existing = !isNew ? MOCK_DIET_PLANS.find((d) => d.id === Number(id)) : undefined;

  const [name, setName] = useState(existing?.name || "");
  const [code, setCode] = useState(existing?.code || "");
  const [status, setStatus] = useState<DietPlanStatus>(existing?.status || "draft");
  const [description, setDescription] = useState(existing?.description || "");
  const [recommendations, setRecommendations] = useState(existing?.recommendations || "");
  const [dietType, setDietType] = useState<"base" | "derived">(existing?.type || "base");
  const [baseDietId, setBaseDietId] = useState<string>(existing?.baseDietId?.toString() || "none");
  const [mealSlots, setMealSlots] = useState<MealSlot[]>(existing?.mealSlots || []);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal[]>(existing?.nutritionGoals || []);
  const [exclusions, setExclusions] = useState<DietExclusion[]>(existing?.exclusions || []);
  const [substitutions, setSubstitutions] = useState<DietSubstitution[]>(existing?.substitutions || []);
  const [clients, setClients] = useState<DietClientAssignment[]>(existing?.clients || []);

  const [openMeals, setOpenMeals] = useState(true);
  const [openGoals, setOpenGoals] = useState(true);
  const [openExclusions, setOpenExclusions] = useState(true);
  const [openSubstitutions, setOpenSubstitutions] = useState(true);
  const [openClients, setOpenClients] = useState(false);
  const [mealStructureUnlocked, setMealStructureUnlocked] = useState(false);
  const [availableMealTypes, setAvailableMealTypes] = useState<MealType[]>([]);

  useEffect(() => {
    getMealTypes().then(setAvailableMealTypes).catch(console.error);
  }, []);

  const isDerived = dietType === "derived";
  const baseDiet = isDerived && baseDietId !== "none" ? MOCK_DIET_PLANS.find((d) => d.id === Number(baseDietId)) : undefined;
  const availableBases = MOCK_DIET_PLANS.filter((d) => d.type === "base" && d.id !== existing?.id);

  const toggleGoalSource = (nutrient: string) => {
    setNutritionGoals((prev) =>
      prev.map((g) =>
        g.nutrient === nutrient
          ? { ...g, source: g.source === "inherited" ? "overridden" : "inherited" }
          : g
      )
    );
  };

  const toggleExclusion = (exId: string) => {
    setExclusions((prev) => prev.map((e) => e.id === exId ? { ...e, active: !e.active } : e));
  };

  const handleSave = (activate: boolean) => {
    if (!name.trim()) { toast.error("Podaj nazwę diety"); return; }
    toast.success(activate ? "Dieta zapisana i aktywowana (mock)" : "Dieta zapisana jako szkic (mock)");
  };

  if (!isNew && !existing) {
    return (
      <DietLayout pageKey="diet.meals_approval">
        <div className="text-center py-12 text-muted-foreground">Nie znaleziono diety o ID: {id}</div>
      </DietLayout>
    );
  }

  return (
    <DietLayout pageKey="diet.meals_approval">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dietetyka/plany-diet")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{isNew ? "Nowa dieta" : `${existing?.icon} ${existing?.name}`}</h1>
          {existing && <Badge variant="outline" className="text-xs font-mono">{existing.code}</Badge>}
          {existing && <Badge className={cn("text-xs", DIET_PLAN_STATUS_COLORS[existing.status])}>{DIET_PLAN_STATUS_LABELS[existing.status]}</Badge>}
          {isDerived && baseDiet && (
            <Badge variant="secondary" className="text-xs">← {baseDiet.code}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {isDerived && existing && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/dietetyka/plany-diet/${existing.id}/diff`)}>
              Porównaj z bazową
            </Button>
          )}
          <Button variant="outline" onClick={() => handleSave(false)}>
            <FileText className="h-4 w-4 mr-2" /> Szkic
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Save className="h-4 w-4 mr-2" /> Zapisz i aktywuj
          </Button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="space-y-5">
        {/* BASIC INFO + RELATION */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Dane podstawowe + Relacja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Nazwa diety</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Dieta Bezglutenowa" />
              </div>
              <div>
                <Label>Kod</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="np. GF_DAIRY_FREE" className="font-mono" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DietPlanStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIET_PLAN_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* RELATION */}
            <div className="p-3 bg-muted/30 rounded space-y-3">
              <Label className="text-sm font-medium">Relacja do diety bazowej</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={dietType === "base"} onChange={() => setDietType("base")} className="accent-primary" />
                  <span className="text-sm">Dieta bazowa (niezależna)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={dietType === "derived"} onChange={() => setDietType("derived")} className="accent-primary" />
                  <span className="text-sm">Dieta pochodna od:</span>
                </label>
              </div>
              {isDerived && (
                <>
                  <Select value={baseDietId} onValueChange={setBaseDietId}>
                    <SelectTrigger className="w-64"><SelectValue placeholder="Wybierz dietę bazową" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— wybierz —</SelectItem>
                      {availableBases.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.icon} {b.name} ({b.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Dieta pochodna dziedziczy core (dania główne, zupy) z diety bazowej. Możesz modyfikować dodatki, wykluczenia i zamienniki.</span>
                  </div>
                </>
              )}
            </div>

            <div>
              <Label>Opis / Grupa docelowa</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Opis diety…" />
            </div>
            <div>
              <Label>Zalecenia</Label>
              <Textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} rows={2} placeholder="Zalecenia dotyczące diety…" />
            </div>
          </CardContent>
        </Card>

        {/* MEAL STRUCTURE */}
        <Collapsible open={openMeals} onOpenChange={setOpenMeals}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Struktura posiłków</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openMeals && "rotate-180")} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {isDerived && !mealStructureUnlocked && (
                  <div className="flex items-center gap-3 mb-3 p-3 bg-muted/50 rounded border text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-muted-foreground">Struktura posiłków odziedziczona z {baseDiet?.name || "diety bazowej"}.</span>
                    <Button variant="outline" size="sm" onClick={() => setMealStructureUnlocked(true)}>Odblokuj</Button>
                  </div>
                )}
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posiłek</TableHead>
                        <TableHead className="w-24">% kcal</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Liczba dań</TableHead>
                        {(!isDerived || mealStructureUnlocked) && <TableHead className="w-20" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealSlots.map((slot, idx) => {
                        const editable = !isDerived || mealStructureUnlocked;
                        return (
                        <TableRow key={slot.id} className={cn(isDerived && !mealStructureUnlocked && "opacity-60")}>
                          <TableCell>
                            {editable ? (
                              <Select value={slot.name} onValueChange={(v) => setMealSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, name: v } : s))}>
                                <SelectTrigger className="h-7 text-sm"><SelectValue placeholder="Wybierz posiłek" /></SelectTrigger>
                                <SelectContent>
                                  {availableMealTypes.map((mt) => <SelectItem key={mt.id} value={mt.name}>{mt.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-medium text-sm">{slot.name}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editable ? (
                              <Input type="number" value={slot.kcalPct} className="h-7 text-sm text-right w-full" onChange={(e) => setMealSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, kcalPct: Number(e.target.value) } : s))} />
                            ) : (
                              <span className="text-sm">{slot.kcalPct}%</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editable ? (
                              <Input value={slot.type} className="h-7 text-sm" onChange={(e) => setMealSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, type: e.target.value } : s))} />
                            ) : (
                              <span className="text-sm">{slot.type}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editable ? (
                              <Input value={slot.itemCount} className="h-7 text-sm" onChange={(e) => setMealSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, itemCount: e.target.value } : s))} />
                            ) : (
                              <span className="text-sm">{slot.itemCount}</span>
                            )}
                          </TableCell>
                          {editable && (
                            <TableCell>
                              <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0}
                                  onClick={() => {
                                    const n = [...mealSlots];
                                    [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]];
                                    setMealSlots(n);
                                  }}>
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === mealSlots.length - 1}
                                  onClick={() => {
                                    const n = [...mealSlots];
                                    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                                    setMealSlots(n);
                                  }}>
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {/* % kcal total indicator */}
                  {(!isDerived || mealStructureUnlocked) && (
                    <div className="flex items-center justify-end gap-2 px-3 py-1.5 border-t text-xs">
                      <span className="text-muted-foreground">Suma % kcal:</span>
                      <span className={cn("font-bold tabular-nums", mealSlots.reduce((s, m) => s + m.kcalPct, 0) === 100 ? "text-emerald-600" : "text-destructive")}>
                        {mealSlots.reduce((s, m) => s + m.kcalPct, 0)}%
                      </span>
                    </div>
                  )}
                </div>
                {(!isDerived || mealStructureUnlocked) && mealSlots.length < 8 && (
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj posiłek
                  </Button>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* NUTRITION GOALS */}
        <Collapsible open={openGoals} onOpenChange={setOpenGoals}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Cele odżywcze</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openGoals && "rotate-180")} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Składnik</TableHead>
                        <TableHead className="w-28 text-right">Min</TableHead>
                        <TableHead className="w-28 text-right">Max</TableHead>
                        <TableHead className="w-32">% kcal</TableHead>
                        {isDerived && <TableHead className="w-32">Źródło</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nutritionGoals.map((g) => {
                        const isSub = g.nutrient.startsWith("  ");
                        return (
                        <TableRow key={g.nutrient} className={cn(isSub && "bg-muted/20")}>
                          <TableCell className={cn("text-sm", isSub ? "pl-8 text-muted-foreground" : "font-medium")}>{g.nutrient.trim()} ({g.unit})</TableCell>
                          <TableCell>
                            <Input
                              type="number" value={g.min ?? ""} className="h-7 text-sm text-right w-full"
                              disabled={isDerived && g.source === "inherited"}
                              onChange={(e) => setNutritionGoals((prev) => prev.map((n) => n.nutrient === g.nutrient ? { ...n, min: e.target.value ? Number(e.target.value) : null } : n))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number" value={g.max ?? ""} className="h-7 text-sm text-right w-full"
                              disabled={isDerived && g.source === "inherited"}
                              onChange={(e) => setNutritionGoals((prev) => prev.map((n) => n.nutrient === g.nutrient ? { ...n, max: e.target.value ? Number(e.target.value) : null } : n))}
                            />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{g.pctKcal}</TableCell>
                          {isDerived && (
                            <TableCell>
                              <button className="flex items-center gap-1 text-xs" onClick={() => toggleGoalSource(g.nutrient)}>
                                {g.source === "inherited" ? (
                                  <><Link2 className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Odziedziczone</span><Pencil className="h-3 w-3 text-muted-foreground ml-1" /></>
                                ) : (
                                  <><Pencil className="h-3 w-3 text-primary" /><span className="text-primary font-medium">Nadpisane</span></>
                                )}
                              </button>
                            </TableCell>
                          )}
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* EXCLUSIONS */}
        <Collapsible open={openExclusions} onOpenChange={setOpenExclusions}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Reguły wyłączeń</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openExclusions && "rotate-180")} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Allergen exclusions */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Wyłączenia alergenów (14 alergenów EU)</Label>
                  <div className="flex flex-wrap gap-2">
                    {EU_ALLERGENS.map((al) => {
                      const ex = exclusions.find((e) => e.name === al && e.category === "allergen");
                      const isFromBase = ex?.fromBase;
                      return (
                        <Button
                          key={al} size="sm" className="text-xs"
                          variant={ex?.active ? "default" : "outline"}
                          disabled={!!isFromBase}
                          onClick={() => {
                            if (ex) { toggleExclusion(ex.id); }
                            else {
                              setExclusions((prev) => [...prev, { id: `ex-${Date.now()}`, category: "allergen", name: al, active: true, reason: "", fromBase: false }]);
                            }
                          }}
                        >
                          {ex?.active ? "✅" : "☐"} {al}
                          {isFromBase && <span className="ml-1 text-[10px] opacity-60">(bazowa)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Ingredient exclusions */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Wyłączenia składników</Label>
                  <div className="flex flex-wrap gap-2">
                    {exclusions.filter((e) => e.category === "ingredient").map((e) => (
                      <Badge key={e.id} variant={e.active ? "default" : "outline"} className="gap-1 text-xs cursor-pointer" onClick={() => toggleExclusion(e.id)}>
                        {e.active ? "✅" : "☐"} {e.name}
                        {e.fromBase && <span className="text-[10px] opacity-60">(bazowa)</span>}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs text-primary"><Plus className="h-3 w-3 mr-1" /> Dodaj</Button>
                  </div>
                </div>

                {/* Dish category exclusions */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Wyłączenia kategorii dań</Label>
                  <div className="space-y-1.5">
                    {exclusions.filter((e) => e.category === "dish_category").map((e) => (
                      <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={e.active} disabled={e.fromBase} onCheckedChange={() => toggleExclusion(e.id)} />
                        <span className={cn(e.fromBase && "text-muted-foreground")}>{e.name}</span>
                        {e.fromBase && <span className="text-[10px] text-muted-foreground">(z diety bazowej)</span>}
                        {e.reason && <span className="text-[10px] text-muted-foreground ml-2">— {e.reason}</span>}
                      </label>
                    ))}
                    {[
                      "Bez potraw smażonych",
                      "Bez potraw ostro przyprawionych",
                    ].filter((n) => !exclusions.some((e) => e.name === n)).map((n) => (
                      <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={false} onCheckedChange={() => {
                          setExclusions((prev) => [...prev, { id: `ex-${Date.now()}`, category: "dish_category", name: n, active: true, reason: "", fromBase: false }]);
                        }} />
                        <span className="text-muted-foreground">{n}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SUBSTITUTIONS (for derived) */}
        <Collapsible open={openSubstitutions} onOpenChange={setOpenSubstitutions}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Zamienniki {isDerived && `(różnice vs ${baseDiet?.code || "bazowa"})`}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{substitutions.length} pozycji</Badge>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openSubstitutions && "rotate-180")} />
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {substitutions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Brak zamienników</p>
                ) : (
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Element menu</TableHead>
                          <TableHead className="text-xs">Oryginalny (z bazowej)</TableHead>
                          <TableHead className="text-xs">→ Zamiennik</TableHead>
                          <TableHead className="text-xs">Typ zmiany</TableHead>
                          <TableHead className="text-xs">Dotyczy</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {substitutions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="text-sm">{sub.menuElement}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{sub.original}</TableCell>
                            <TableCell className="text-sm font-medium">{sub.replacement}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{sub.changeType}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{sub.appliesTo.join(", ")}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                onClick={() => setSubstitutions((prev) => prev.filter((s) => s.id !== sub.id))}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-2"><Plus className="h-3.5 w-3.5 mr-1" /> Dodaj zamiennik</Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* CLIENT ASSIGNMENT */}
        <Collapsible open={openClients} onOpenChange={setOpenClients}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Przypisanie do klientów</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{clients.filter((c) => c.assigned).length} aktywnych</Badge>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openClients && "rotate-180")} />
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Brak przypisań klientów</p>
                ) : (
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">✓</TableHead>
                          <TableHead>Klient</TableHead>
                          <TableHead>Data od</TableHead>
                          <TableHead>Data do</TableHead>
                          <TableHead>Notatki</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((c) => (
                          <TableRow key={c.clientId}>
                            <TableCell>
                              <Checkbox checked={c.assigned} onCheckedChange={() =>
                                setClients((prev) => prev.map((cl) => cl.clientId === c.clientId ? { ...cl, assigned: !cl.assigned } : cl))
                              } />
                            </TableCell>
                            <TableCell className="text-sm font-medium">{c.clientName}</TableCell>
                            <TableCell className="text-sm">{c.dateFrom || "—"}</TableCell>
                            <TableCell className="text-sm">{c.dateTo || "—"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{c.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Ta dieta jest aktywna u {clients.filter((c) => c.assigned).length} klientów
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </DietLayout>
  );
}
