import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_RECIPES } from "@/data/mockRecipes";
import {
  Recipe,
  RecipeCategory,
  RecipeStatus,
  RecipeType,
  RECIPE_CATEGORY_LABELS,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_COLORS,
} from "@/types/recipe";

const ALLERGEN_ICONS: Record<string, string> = {
  Gluten: "🌾",
  Laktoza: "🥛",
  Jaja: "🥚",
  Ryby: "🐟",
  Orzechy: "🥜",
  Seler: "🥬",
  Soja: "🫘",
  Musztarda: "🟡",
  Skorupiaki: "🦐",
  Sezam: "⚪",
};

export default function RecipesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [allergenFilter, setAllergenFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allAllergens = useMemo(() => {
    const set = new Set<string>();
    MOCK_RECIPES.forEach((r) => r.allergens.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return MOCK_RECIPES.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (allergenFilter !== "all" && !r.allergens.includes(allergenFilter)) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter, typeFilter, allergenFilter]);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Receptury</h1>
        <Button onClick={() => navigate("/dietetyka/receptury/nowa")}>
          <Plus className="h-4 w-4 mr-2" />
          Nowa receptura
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj receptury…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {Object.entries(RECIPE_CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {Object.entries(RECIPE_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="base">Bazowa</SelectItem>
            <SelectItem value="nested">Zagnieżdżona</SelectItem>
          </SelectContent>
        </Select>

        <Select value={allergenFilter} onValueChange={setAllergenFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alergeny" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {allAllergens.map((a) => (
              <SelectItem key={a} value={a}>
                {ALLERGEN_ICONS[a] || "⚠️"} {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          <span>Zaznaczono: {selected.size}</span>
          <Button variant="outline" size="sm">
            <Archive className="h-3.5 w-3.5 mr-1" />
            Archiwizuj zaznaczone
          </Button>
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Nazwa receptury</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead className="text-right">Porcja</TableHead>
              <TableHead className="text-right">Kcal</TableHead>
              <TableHead className="text-right">Białko</TableHead>
              <TableHead className="text-right">Koszt</TableHead>
              <TableHead className="text-center">Składniki</TableHead>
              <TableHead>Alergeny</TableHead>
              <TableHead className="text-center">Wersja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                  Brak receptur spełniających kryteria
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleOne(r.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-primary hover:underline font-medium text-left"
                      onClick={() => navigate(`/dietetyka/receptury/${r.id}`)}
                    >
                      {r.type === "nested" && <span className="text-muted-foreground mr-1">→</span>}
                      {r.name}
                    </button>
                  </TableCell>
                  <TableCell>{RECIPE_CATEGORY_LABELS[r.category]}</TableCell>
                  <TableCell className="text-right">{r.portionWeight}g</TableCell>
                  <TableCell className="text-right">{r.kcalPerPortion}</TableCell>
                  <TableCell className="text-right">{r.proteinPerPortion}g</TableCell>
                  <TableCell className="text-right">{r.costPerPortion.toFixed(2)} zł</TableCell>
                  <TableCell className="text-center">{r.ingredientCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {r.allergens.map((a) => (
                        <span key={a} title={a} className="text-base">{ALLERGEN_ICONS[a] || "⚠️"}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">{r.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", RECIPE_STATUS_COLORS[r.status])}>
                      {RECIPE_STATUS_LABELS[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dietetyka/receptury/${r.id}`)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Kopiuj
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="h-4 w-4 mr-2" /> Archiwizuj
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Wyświetlono {filtered.length} z {MOCK_RECIPES.length} receptur
      </div>
    </DietLayout>
  );
}
