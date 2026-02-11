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
import { Search, Plus, MoreHorizontal, Pencil, Copy, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_DISHES } from "@/data/mockDishes";
import {
  DISH_CATEGORY_LABELS,
  DISH_STATUS_LABELS,
  DISH_STATUS_COLORS,
} from "@/types/dish";

const ALLERGEN_ICONS: Record<string, string> = {
  Gluten: "🌾", Laktoza: "🥛", Jaja: "🥚", Ryby: "🐟",
  Orzechy: "🥜", Seler: "🥬", Soja: "🫘", Musztarda: "🟡",
  Skorupiaki: "🦐", Sezam: "⚪",
};

export default function DishesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [allergenFilter, setAllergenFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allAllergens = useMemo(() => {
    const set = new Set<string>();
    MOCK_DISHES.forEach((d) => d.allergens.forEach((a) => set.add(a.name)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return MOCK_DISHES.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (allergenFilter !== "all" && !d.allergens.some((a) => a.name === allergenFilter)) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter, allergenFilter]);

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dania</h1>
        <Button onClick={() => navigate("/dietetyka/dania/nowe")}>
          <Plus className="h-4 w-4 mr-2" /> Nowe danie
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj dania…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {Object.entries(DISH_CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {Object.entries(DISH_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={allergenFilter} onValueChange={setAllergenFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Alergeny" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {allAllergens.map((a) => (
              <SelectItem key={a} value={a}>{ALLERGEN_ICONS[a] || "⚠️"} {a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          <span>Zaznaczono: {selected.size}</span>
          <Button variant="outline" size="sm"><Archive className="h-3.5 w-3.5 mr-1" /> Archiwizuj</Button>
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Nazwa dania</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead className="text-right">Porcja</TableHead>
              <TableHead className="text-right">Kcal</TableHead>
              <TableHead className="text-right">Białko</TableHead>
              <TableHead className="text-right">Koszt</TableHead>
              <TableHead>Warianty</TableHead>
              <TableHead>Receptury i produkty</TableHead>
              <TableHead>Alergeny</TableHead>
              <TableHead className="text-center">Wersja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  Brak dań spełniających kryteria
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(d.id)} onCheckedChange={() => toggleOne(d.id)} />
                  </TableCell>
                  <TableCell>
                    <button className="text-primary hover:underline font-medium text-left" onClick={() => navigate(`/dietetyka/dania/${d.id}`)}>
                      {d.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{DISH_CATEGORY_LABELS[d.category]}</TableCell>
                  <TableCell className="text-right">{d.standardPortion}g</TableCell>
                  <TableCell className="text-right">{d.kcalTotal}</TableCell>
                  <TableCell className="text-right">{d.proteinTotal}g</TableCell>
                  <TableCell className="text-right">{d.costTotal.toFixed(2)} zł</TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground cursor-default">{d.variants.length} war.</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <ul className="text-xs space-y-0.5">
                            {d.variants.map((v) => <li key={v.id}>• {v.name}</li>)}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground cursor-default">{d.composition.length} poz.</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <ul className="text-xs space-y-0.5">
                            {d.composition.map((c) => (
                              <li key={c.id}>• {c.name} ({c.portionGrams}g, {COMPOSITION_ROLE_SHORT[c.role]})</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {d.allergens.filter((a) => a.status !== "free").map((a) => (
                        <TooltipProvider key={a.name} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={cn("text-base", a.status === "may_contain" && "opacity-50")}>{a.icon}</span>
                            </TooltipTrigger>
                            <TooltipContent><span className="text-xs">{a.name} ({a.status === "contains" ? "zawiera" : "może zawierać"})</span></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">{d.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", DISH_STATUS_COLORS[d.status])}>{DISH_STATUS_LABELS[d.status]}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dietetyka/dania/${d.id}`)}><Pencil className="h-4 w-4 mr-2" /> Edytuj</DropdownMenuItem>
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
      <div className="mt-3 text-xs text-muted-foreground">Wyświetlono {filtered.length} z {MOCK_DISHES.length} dań</div>
    </DietLayout>
  );
}

const COMPOSITION_ROLE_SHORT: Record<string, string> = { main: "Gł.", side: "Dod.", sauce: "Sos" };
