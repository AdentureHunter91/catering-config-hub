import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, Plus, MoreHorizontal, Pencil, Copy, Archive, TreePine, TableIcon, Zap,
  ChevronRight, Check, AlertTriangle, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MOCK_DIET_PLANS } from "@/data/mockDietPlans";
import {
  DietPlanStatus,
  DIET_PLAN_STATUS_LABELS,
  DIET_PLAN_STATUS_COLORS,
  PropagationTarget,
} from "@/types/dietPlan";

export default function DietPlansList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [propagationOpen, setPropagationOpen] = useState(false);
  const [propagationTargets, setPropagationTargets] = useState<PropagationTarget[]>([]);

  const filtered = useMemo(() => {
    return MOCK_DIET_PLANS.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      return true;
    });
  }, [search, statusFilter, typeFilter]);

  const baseDiets = filtered.filter((d) => d.type === "base");
  const derivedByBase = useMemo(() => {
    const map = new Map<number, typeof filtered>();
    filtered.filter((d) => d.type === "derived" && d.baseDietId).forEach((d) => {
      const arr = map.get(d.baseDietId!) || [];
      arr.push(d);
      map.set(d.baseDietId!, arr);
    });
    return map;
  }, [filtered]);

  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id)));
  const toggleOne = (id: number) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const openPropagation = () => {
    const targets: PropagationTarget[] = [
      { dietId: 2, dietName: "Bezglutenowa", dietCode: "GF", status: "compatible", statusNote: "Zgodna (krem OK)", selected: true },
      { dietId: 3, dietName: "Cukrzycowa", dietCode: "DIABETIC", status: "compatible", statusNote: "Zgodna", selected: true },
      { dietId: 4, dietName: "Renalna", dietCode: "RENAL", status: "check", statusNote: "Sprawdź sód", selected: true },
      { dietId: 5, dietName: "Bez mleczarstwa", dietCode: "DF", status: "compatible", statusNote: "Zgodna", selected: true },
      { dietId: 6, dietName: "Wegetariańska", dietCode: "VEG", status: "override", statusNote: "Override (ma inną)", selected: false },
      { dietId: 8, dietName: "Pediatryczna", dietCode: "PED", status: "compatible", statusNote: "Zgodna (60% porcji)", selected: true },
    ];
    setPropagationTargets(targets);
    setPropagationOpen(true);
  };

  const togglePropagationTarget = (dietId: number) => {
    setPropagationTargets((prev) => prev.map((t) => t.dietId === dietId ? { ...t, selected: !t.selected } : t));
  };

  const propagate = () => {
    const count = propagationTargets.filter((t) => t.selected).length;
    toast.success(`Zmiana propagowana do ${count} diet pochodnych (mock)`);
    setPropagationOpen(false);
  };

  const statusIcon = (s: PropagationTarget["status"]) => {
    if (s === "compatible") return <Check className="h-4 w-4 text-emerald-600" />;
    if (s === "check") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <Ban className="h-4 w-4 text-destructive" />;
  };

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Diety (Plany dietetyczne)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openPropagation}>
            <Zap className="h-4 w-4 mr-2" /> Propaguj zmianę
          </Button>
          <Button onClick={() => navigate("/dietetyka/plany-diet/nowy")}>
            <Plus className="h-4 w-4 mr-2" /> Nowa dieta
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj diety…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {Object.entries(DIET_PLAN_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="base">Bazowa</SelectItem>
            <SelectItem value="derived">Pochodna</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md overflow-hidden">
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setViewMode("table")}>
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "tree" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setViewMode("tree")}>
            <TreePine className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          <span>Zaznaczono: {selected.size}</span>
          <Button variant="outline" size="sm"><Archive className="h-3.5 w-3.5 mr-1" /> Archiwizuj</Button>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" ? (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Nazwa diety</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Relacja</TableHead>
                <TableHead className="text-right">Kcal zakres</TableHead>
                <TableHead>Wyłączenia</TableHead>
                <TableHead className="text-center">Klienci</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Brak diet</TableCell></TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(d.id)} onCheckedChange={() => toggleOne(d.id)} />
                    </TableCell>
                    <TableCell>
                      <button className="text-primary hover:underline font-medium text-left flex items-center gap-1.5" onClick={() => navigate(`/dietetyka/plany-diet/${d.id}`)}>
                        <span>{d.icon}</span> {d.name}
                      </button>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs font-mono">{d.code}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={d.type === "base" ? "default" : "secondary"} className="text-xs">
                        {d.type === "base" ? "Bazowa" : "Pochodna"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.type === "derived" && d.baseDietCode ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                onClick={() => navigate(`/dietetyka/plany-diet/${d.baseDietId}`)}
                              >
                                ← {d.baseDietCode}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              Dziedziczy core z: {d.baseDietName}. Różnice: {d.exclusions.length} wyłączeń, {d.substitutions.length} zamienników
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {(() => {
                        const kcalGoal = d.nutritionGoals.find((g) => g.nutrient === "Kcal");
                        if (!kcalGoal) return "—";
                        return `${kcalGoal.min ?? "—"}–${kcalGoal.max ?? "—"}`;
                      })()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.exclusionsSummary}</TableCell>
                    <TableCell className="text-center">{d.clientCount}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", DIET_PLAN_STATUS_COLORS[d.status])}>{DIET_PLAN_STATUS_LABELS[d.status]}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dietetyka/plany-diet/${d.id}`)}><Pencil className="h-4 w-4 mr-2" /> Edytuj</DropdownMenuItem>
                          {d.type === "derived" && d.baseDietId && (
                            <DropdownMenuItem onClick={() => navigate(`/dietetyka/plany-diet/${d.id}/diff`)}>
                              <ChevronRight className="h-4 w-4 mr-2" /> Porównaj z bazową
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Kopiuj</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Archive className="h-4 w-4 mr-2" /> Archiwizuj</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* TREE VIEW */
        <div className="border rounded-lg p-4 space-y-1">
          {baseDiets.map((base) => (
            <div key={base.id}>
              <button
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 font-medium text-sm w-full text-left"
                onClick={() => navigate(`/dietetyka/plany-diet/${base.id}`)}
              >
                <span className="text-lg">{base.icon}</span>
                <span>{base.name}</span>
                <Badge variant="outline" className="text-[10px] font-mono ml-1">{base.code}</Badge>
                <Badge className={cn("text-[10px] ml-auto", DIET_PLAN_STATUS_COLORS[base.status])}>{DIET_PLAN_STATUS_LABELS[base.status]}</Badge>
              </button>
              {(derivedByBase.get(base.id) || []).map((child, idx, arr) => (
                <button
                  key={child.id}
                  className="flex items-center gap-2 py-1.5 px-2 pl-8 rounded hover:bg-muted/50 text-sm w-full text-left"
                  onClick={() => navigate(`/dietetyka/plany-diet/${child.id}`)}
                >
                  <span className="text-muted-foreground text-xs mr-1">{idx === arr.length - 1 ? "└──" : "├──"}</span>
                  <span className="text-lg">{child.icon}</span>
                  <span>{child.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono ml-1">{child.code}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    — {child.exclusions.length} wyklucz., {child.substitutions.length} zamienników
                  </span>
                  <Badge className={cn("text-[10px] ml-auto", DIET_PLAN_STATUS_COLORS[child.status])}>{DIET_PLAN_STATUS_LABELS[child.status]}</Badge>
                </button>
              ))}
            </div>
          ))}
          {baseDiets.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Brak diet bazowych w filtrze</p>}
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">Wyświetlono {filtered.length} z {MOCK_DIET_PLANS.length} diet</div>

      {/* PROPAGATION DIALOG */}
      <Dialog open={propagationOpen} onOpenChange={setPropagationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Propagacja zmiany</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded text-sm">
              <p className="font-medium">Zmieniono w diecie bazowej (STANDARD):</p>
              <p className="text-muted-foreground mt-1">📅 Środa, Obiad: Zupa pomidorowa → Krem z brokułów</p>
            </div>
            <p className="text-sm font-medium">Diety pochodne do zaktualizowania:</p>
            <div className="space-y-1">
              {propagationTargets.map((t) => (
                <label key={t.dietId} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 cursor-pointer">
                  <Checkbox checked={t.selected} onCheckedChange={() => togglePropagationTarget(t.dietId)} />
                  <span className="text-sm flex-1">{t.dietName} ({t.dietCode})</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {statusIcon(t.status)}
                    <span className={cn(
                      t.status === "compatible" && "text-emerald-700",
                      t.status === "check" && "text-amber-700",
                      t.status === "override" && "text-destructive",
                    )}>{t.statusNote}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 p-2 bg-muted/30 rounded">
              <p>✅ Zgodna — zmiana nie koliduje z wyłączeniami</p>
              <p>⚠️ Sprawdź — możliwy konflikt, wymaga weryfikacji</p>
              <p>⛔ Override — dieta ma nadpisanie na tym posiłku, pomiń</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropagationOpen(false)}>Anuluj</Button>
            <Button onClick={propagate}>Propaguj zaznaczone ({propagationTargets.filter((t) => t.selected).length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
