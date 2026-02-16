import { useState } from "react";
import DietLayout from "@/components/DietLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Flame,
  Snowflake,
  Scissors,
  Cake,
  Coffee,
  Plus,
  Trash2,
  Settings2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckSquare,
  Clock,
  ChefHat,
  Utensils,
  Package,
  Factory,
  Users,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { pl } from "date-fns/locale";

/* ─── Types ─── */
interface KitchenSection {
  id: string;
  name: string;
  icon: string;
  color: string;
  timeWindows: string[];
  responsible?: string;
}

interface Kitchen {
  id: number;
  name: string;
  sections: KitchenSection[];
}

interface ProductionDish {
  id: string;
  name: string;
  mealType: string;
  portions: { diet: string; count: number; portionWeight: number }[];
  totalPortions: number;
  ingredients: {
    name: string;
    grossKg: number;
    groupIcon: string;
    note?: string;
  }[];
  allergens: string[];
  gfNote?: string;
  sectionId: string;
}

/* ─── Predefined section templates ─── */
const SECTION_TEMPLATES: Omit<KitchenSection, "id">[] = [
  {
    name: "Kuchnia ciepła",
    icon: "🔥",
    color: "text-red-500",
    timeWindows: ["05:00-07:00", "09:00-11:30", "15:00-17:00"],
  },
  {
    name: "Kuchnia zimna",
    icon: "❄️",
    color: "text-blue-500",
    timeWindows: ["T-1 wieczór", "05:00-07:00"],
  },
  {
    name: "Obróbka wstępna",
    icon: "🔪",
    color: "text-amber-600",
    timeWindows: ["04:00-06:00"],
  },
  {
    name: "Cukiernia / Desery",
    icon: "🍰",
    color: "text-pink-500",
    timeWindows: ["T-1", "06:00-08:00"],
  },
  {
    name: "Napoje",
    icon: "☕",
    color: "text-orange-500",
    timeWindows: ["05:00-06:00"],
  },
];

const sectionLucideIcon = (icon: string) => {
  switch (icon) {
    case "🔥":
      return <Flame className="h-4 w-4 text-red-500" />;
    case "❄️":
      return <Snowflake className="h-4 w-4 text-blue-500" />;
    case "🔪":
      return <Scissors className="h-4 w-4 text-amber-600" />;
    case "🍰":
      return <Cake className="h-4 w-4 text-pink-500" />;
    case "☕":
      return <Coffee className="h-4 w-4 text-orange-500" />;
    default:
      return <ChefHat className="h-4 w-4" />;
  }
};

/* ─── Mock data ─── */
const mockKitchens: Kitchen[] = [
  {
    id: 1,
    name: "Kuchnia Centralna — Szpital Miejski",
    sections: [
      { id: "s1", name: "Kuchnia ciepła", icon: "🔥", color: "text-red-500", timeWindows: ["05:00-07:00", "09:00-11:30", "15:00-17:00"], responsible: "Jan Kowalski" },
      { id: "s2", name: "Kuchnia zimna", icon: "❄️", color: "text-blue-500", timeWindows: ["T-1 wieczór", "05:00-07:00"], responsible: "Anna Nowak" },
      { id: "s3", name: "Obróbka wstępna", icon: "🔪", color: "text-amber-600", timeWindows: ["04:00-06:00"] },
      { id: "s4", name: "Cukiernia / Desery", icon: "🍰", color: "text-pink-500", timeWindows: ["T-1", "06:00-08:00"] },
      { id: "s5", name: "Napoje", icon: "☕", color: "text-orange-500", timeWindows: ["05:00-06:00"] },
    ],
  },
  {
    id: 2,
    name: "Kuchnia Filialna — Oddział Zachodni",
    sections: [
      { id: "s6", name: "Kuchnia ciepła", icon: "🔥", color: "text-red-500", timeWindows: ["06:00-08:00", "10:00-12:00"] },
      { id: "s7", name: "Kuchnia zimna", icon: "❄️", color: "text-blue-500", timeWindows: ["05:00-07:00"] },
    ],
  },
];

const mockDishes: ProductionDish[] = [
  {
    id: "pd1", name: "Owsianka z jabłkami", mealType: "Śniadanie", sectionId: "s1",
    portions: [{ diet: "Standard", count: 45, portionWeight: 300 }, { diet: "GF", count: 8, portionWeight: 300 }, { diet: "Renal", count: 4, portionWeight: 280 }],
    totalPortions: 57,
    ingredients: [
      { name: "Płatki owsiane", grossKg: 16.8, groupIcon: "📦", note: "suchy, odmierzyć" },
      { name: "Jabłka", grossKg: 4.2, groupIcon: "🥬" },
      { name: "Mleko 2%", grossKg: 12.0, groupIcon: "🧊" },
    ],
    allergens: ["Mleko", "Gluten"],
    gfNote: "Wariant GF: użyj płatków bezglutenowych (osobne naczynie)",
  },
  {
    id: "pd2", name: "Zupa pomidorowa", mealType: "Obiad", sectionId: "s1",
    portions: [{ diet: "Standard", count: 45, portionWeight: 350 }, { diet: "GF", count: 8, portionWeight: 350 }, { diet: "Diabetic", count: 12, portionWeight: 350 }],
    totalPortions: 65,
    ingredients: [
      { name: "Pomidory", grossKg: 8.5, groupIcon: "🥬" },
      { name: "Śmietana 18%", grossKg: 2.3, groupIcon: "🧊" },
      { name: "Makaron", grossKg: 3.2, groupIcon: "📦" },
      { name: "Bulion drobiowy", grossKg: 6.0, groupIcon: "📦" },
    ],
    allergens: ["Gluten", "Mleko"],
  },
  {
    id: "pd3", name: "Kurczak pieczony z ryżem", mealType: "Obiad", sectionId: "s1",
    portions: [{ diet: "Standard", count: 45, portionWeight: 300 }, { diet: "GF", count: 8, portionWeight: 300 }, { diet: "Renal", count: 4, portionWeight: 280 }],
    totalPortions: 57,
    ingredients: [
      { name: "Pierś z kurczaka", grossKg: 18.2, groupIcon: "❄️", note: "SPRAWDŹ ROZMROŻENIE" },
      { name: "Ryż basmati", grossKg: 5.6, groupIcon: "📦", note: "suchy, odmierzyć" },
      { name: "Olej rzepakowy", grossKg: 0.8, groupIcon: "📦" },
    ],
    allergens: [],
    gfNote: "Przygotuj wersję bezglutenową OSOBNO",
  },
  {
    id: "pd4", name: "Surówka z marchewki", mealType: "Obiad", sectionId: "s2",
    portions: [{ diet: "Wszystkie diety", count: 90, portionWeight: 100 }],
    totalPortions: 90,
    ingredients: [
      { name: "Marchew", grossKg: 9.0, groupIcon: "🥬", note: "obrać i zetrzeć" },
      { name: "Jabłka", grossKg: 2.3, groupIcon: "🥬" },
      { name: "Cytryna (sok)", grossKg: 0.5, groupIcon: "🥬" },
    ],
    allergens: [],
  },
  {
    id: "pd5", name: "Kanapki z serem", mealType: "Kolacja", sectionId: "s2",
    portions: [{ diet: "Standard", count: 45, portionWeight: 200 }, { diet: "GF", count: 8, portionWeight: 200 }],
    totalPortions: 53,
    ingredients: [
      { name: "Chleb razowy", grossKg: 6.5, groupIcon: "🍞", note: "pokroić" },
      { name: "Ser żółty", grossKg: 3.2, groupIcon: "🧊", note: "pokroić w plastry" },
      { name: "Masło extra", grossKg: 1.1, groupIcon: "🧊" },
    ],
    allergens: ["Gluten", "Mleko"],
  },
  {
    id: "pd6", name: "Kompot z jabłek", mealType: "Obiad", sectionId: "s5",
    portions: [{ diet: "Wszystkie diety", count: 95, portionWeight: 200 }],
    totalPortions: 95,
    ingredients: [
      { name: "Jabłka", grossKg: 4.8, groupIcon: "🥬" },
      { name: "Cukier", grossKg: 1.2, groupIcon: "📦" },
    ],
    allergens: [],
  },
  {
    id: "pd7", name: "Budyń waniliowy", mealType: "Podwieczorek", sectionId: "s4",
    portions: [{ diet: "Standard", count: 45, portionWeight: 150 }, { diet: "Diabetic", count: 12, portionWeight: 130 }],
    totalPortions: 57,
    ingredients: [
      { name: "Mleko 2%", grossKg: 8.5, groupIcon: "🧊" },
      { name: "Budyń w proszku", grossKg: 0.6, groupIcon: "📦" },
      { name: "Cukier", grossKg: 0.4, groupIcon: "📦" },
    ],
    allergens: ["Mleko"],
  },
];

const clients = [
  "Szpital Miejski im. Narutowicza",
  "ZOZ Nidzica",
  "SPZOZ Sierpc",
];
const menuPackages = [
  "Jadłospis Luty 2026 — Tydz. 1",
  "Jadłospis Luty 2026 — Tydz. 2",
];

/* ─── Component ─── */
export default function ProductionPlanning() {
  const [activeTab, setActiveTab] = useState("plan");
  const [selectedKitchen, setSelectedKitchen] = useState(mockKitchens[0]);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 10));
  const [activeSection, setActiveSection] = useState<string>("all");
  const [separatePlans, setSeparatePlans] = useState(true);

  // Section config
  const [configKitchen, setConfigKitchen] = useState(mockKitchens[0]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState("🔥");
  const [newSectionTime, setNewSectionTime] = useState("");
  const [newSectionResp, setNewSectionResp] = useState("");

  // Generator
  const [showGenerator, setShowGenerator] = useState(false);
  const [genMenu, setGenMenu] = useState(menuPackages[0]);
  const [genSections, setGenSections] = useState<string[]>([]);

  const toggleGenSection = (id: string) => {
    setGenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Filter dishes by section
  const getDishesForSection = (sectionId: string) =>
    sectionId === "all"
      ? mockDishes
      : mockDishes.filter((d) => d.sectionId === sectionId);

  const displayDishes = getDishesForSection(activeSection);

  // Group by meal
  const byMeal = displayDishes.reduce<Record<string, ProductionDish[]>>(
    (acc, d) => {
      (acc[d.mealType] ??= []).push(d);
      return acc;
    },
    {}
  );

  // Ingredient checklist per section
  const getIngredientsForSection = (sectionId: string) => {
    const dishes =
      sectionId === "all"
        ? mockDishes
        : mockDishes.filter((d) => d.sectionId === sectionId);
    const map: Record<
      string,
      { name: string; grossKg: number; groupIcon: string; note?: string }
    > = {};
    dishes.forEach((d) =>
      d.ingredients.forEach((ing) => {
        if (map[ing.name]) {
          map[ing.name].grossKg += ing.grossKg;
        } else {
          map[ing.name] = { ...ing };
        }
      })
    );
    return Object.values(map).sort((a, b) => b.grossKg - a.grossKg);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    const newSec: KitchenSection = {
      id: `s_new_${Date.now()}`,
      name: newSectionName,
      icon: newSectionIcon,
      color: "",
      timeWindows: newSectionTime
        ? newSectionTime.split(",").map((s) => s.trim())
        : [],
      responsible: newSectionResp || undefined,
    };
    setConfigKitchen((k) => ({
      ...k,
      sections: [...k.sections, newSec],
    }));
    setNewSectionName("");
    setNewSectionTime("");
    setNewSectionResp("");
    setShowAddSection(false);
  };

  const handleDeleteSection = (id: string) => {
    setConfigKitchen((k) => ({
      ...k,
      sections: k.sections.filter((s) => s.id !== id),
    }));
  };

  const mealOrder = [
    "Śniadanie",
    "II Śniadanie",
    "Obiad",
    "Podwieczorek",
    "Kolacja",
    "Posiłek nocny",
  ];
  const sortedMeals = Object.keys(byMeal).sort(
    (a, b) => (mealOrder.indexOf(a) ?? 99) - (mealOrder.indexOf(b) ?? 99)
  );

  const currentSection =
    activeSection === "all"
      ? null
      : selectedKitchen.sections.find((s) => s.id === activeSection);

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6" />
            Plany produkcji
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerator(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Generuj plan
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plan" className="gap-1">
              <ChefHat className="h-4 w-4" />
              Plan dzienny
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1">
              <Settings2 className="h-4 w-4" />
              Sekcje kuchenne
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Daily production plan ── */}
          <TabsContent value="plan" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                value={String(selectedKitchen.id)}
                onValueChange={(v) => {
                  const k = mockKitchens.find((k) => k.id === Number(v));
                  if (k) {
                    setSelectedKitchen(k);
                    setActiveSection("all");
                  }
                }}
              >
                <SelectTrigger className="w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockKitchens.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate((d) => addDays(d, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium min-w-[180px] text-center">
                  {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: pl })}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Summary bar */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="py-3">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span>
                    Klient: <strong>{selectedClient}</strong>
                  </span>
                  <span>
                    Zamówienia:{" "}
                    <strong>
                      {mockDishes.reduce((s, d) => s + d.totalPortions, 0)}{" "}
                      porcji łącznie
                    </strong>
                  </span>
                  <span>
                    Sekcje: <strong>{selectedKitchen.sections.length}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Section tabs */}
            <Tabs
              value={activeSection}
              onValueChange={setActiveSection}
            >
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="gap-1.5">
                  <Utensils className="h-4 w-4" />
                  Wszystkie
                </TabsTrigger>
                {selectedKitchen.sections.map((sec) => (
                  <TabsTrigger
                    key={sec.id}
                    value={sec.id}
                    className="gap-1.5"
                  >
                    {sectionLucideIcon(sec.icon)}
                    {sec.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Section header */}
              {currentSection && (
                <div className="flex items-center gap-4 text-sm mt-3">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Okna czasowe:{" "}
                    <strong className="text-foreground">
                      {currentSection.timeWindows.join(" / ")}
                    </strong>
                  </span>
                  {currentSection.responsible && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Odpowiedzialny:{" "}
                      <strong className="text-foreground">
                        {currentSection.responsible}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* Dishes by meal */}
              <div className="space-y-4 mt-4">
                {sortedMeals.map((meal) => {
                  const dishes = byMeal[meal];
                  const section = currentSection;
                  const timeLabel = section
                    ? ` (przygotowanie ${section.timeWindows[meal === "Śniadanie" ? 0 : meal === "Obiad" ? 1 : 0] || section.timeWindows[0]})`
                    : "";

                  return (
                    <div key={meal}>
                      <h3 className="font-semibold text-base flex items-center gap-2 mb-2 border-b pb-1">
                        <span className="text-lg">
                          {meal === "Śniadanie"
                            ? "🍳"
                            : meal === "Obiad"
                              ? "🥣"
                              : meal === "Kolacja"
                                ? "🥪"
                                : meal === "Podwieczorek"
                                  ? "🍰"
                                  : "🍽️"}
                        </span>
                        {meal}
                        <span className="text-xs font-normal text-muted-foreground">
                          {timeLabel}
                        </span>
                      </h3>

                      <div className="space-y-3 ml-2">
                        {dishes.map((dish) => {
                          const dishSection =
                            selectedKitchen.sections.find(
                              (s) => s.id === dish.sectionId
                            );
                          return (
                            <Card key={dish.id} className="border-l-2 border-l-muted-foreground/20">
                              <CardContent className="py-3 space-y-2">
                                {/* Dish header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <span className="font-semibold text-sm flex items-center gap-2">
                                      {dish.name}
                                      {activeSection === "all" &&
                                        dishSection && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs gap-1"
                                          >
                                            {sectionLucideIcon(
                                              dishSection.icon
                                            )}
                                            {dishSection.name}
                                          </Badge>
                                        )}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Porcje:{" "}
                                      {dish.portions
                                        .map(
                                          (p) =>
                                            `${p.count}× ${p.diet}${p.portionWeight ? ` (${p.portionWeight}g)` : ""}`
                                        )
                                        .join(" + ")}{" "}
                                      = <strong>{dish.totalPortions} porcji</strong>
                                    </p>
                                  </div>
                                  {dish.allergens.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                      <span className="text-xs text-amber-600 font-medium">
                                        ALERGEN:{" "}
                                        {dish.allergens.join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Ingredients */}
                                <div className="text-xs text-muted-foreground">
                                  Brutto:{" "}
                                  {dish.ingredients
                                    .map(
                                      (i) =>
                                        `${i.name} ${i.grossKg.toFixed(1)}kg`
                                    )
                                    .join(" | ")}
                                </div>

                                {/* GF note */}
                                {dish.gfNote && (
                                  <div className="text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                                    {dish.gfNote}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ingredient checklist */}
              <div className="mt-6">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <CheckSquare className="h-4 w-4" />
                  Lista przygotowania składników
                  {currentSection && (
                    <Badge variant="outline" className="gap-1">
                      {sectionLucideIcon(currentSection.icon)}
                      {currentSection.name}
                    </Badge>
                  )}
                </h3>

                {activeSection === "all" ? (
                  // Grouped by section
                  selectedKitchen.sections.map((sec) => {
                    const ings = getIngredientsForSection(sec.id);
                    if (ings.length === 0) return null;
                    return (
                      <div key={sec.id} className="mb-4">
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          {sectionLucideIcon(sec.icon)} {sec.name}:
                        </h4>
                        <div className="space-y-1 ml-4">
                          {ings.map((ing, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                            >
                              <Checkbox />
                              <span>
                                {ing.name} ({ing.grossKg.toFixed(1)}kg)
                              </span>
                              <span className="text-xs ml-1">
                                {ing.groupIcon}
                              </span>
                              {ing.note && (
                                <span className="text-xs text-muted-foreground">
                                  — {ing.note}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-1">
                    {getIngredientsForSection(activeSection).map(
                      (ing, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                        >
                          <Checkbox />
                          <span>
                            {ing.name} ({ing.grossKg.toFixed(1)}kg)
                          </span>
                          <span className="text-xs ml-1">
                            {ing.groupIcon}
                          </span>
                          {ing.note && (
                            <span className="text-xs text-muted-foreground">
                              — {ing.note}
                            </span>
                          )}
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Export buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {activeSection !== "all" && currentSection && (
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1" />
                    PDF — {currentSection.name}
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF zbiorczy
                </Button>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                {selectedKitchen.sections.map((sec) => (
                  <Button key={sec.id} variant="ghost" size="sm" className="text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1" />
                    {sec.icon} {sec.name}
                  </Button>
                ))}
              </div>
            </Tabs>
          </TabsContent>

          {/* ── TAB 2: Section configuration ── */}
          <TabsContent value="config" className="space-y-4">
            {/* Kitchen selector */}
            <div className="flex items-center gap-3">
              <Select
                value={String(configKitchen.id)}
                onValueChange={(v) => {
                  const k = mockKitchens.find((k) => k.id === Number(v));
                  if (k) setConfigKitchen({ ...k });
                }}
              >
                <SelectTrigger className="w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockKitchens.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setShowAddSection(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj sekcję
              </Button>
            </div>

            {/* Sections table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nazwa sekcji</TableHead>
                  <TableHead>Okna czasowe</TableHead>
                  <TableHead>Odpowiedzialny</TableHead>
                  <TableHead>Typowe dania</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configKitchen.sections.map((sec) => {
                  const template = SECTION_TEMPLATES.find(
                    (t) => t.icon === sec.icon
                  );
                  return (
                    <TableRow key={sec.id}>
                      <TableCell className="text-center text-lg">
                        {sec.icon}
                      </TableCell>
                      <TableCell className="font-medium">{sec.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sec.timeWindows.map((tw, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {tw}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sec.responsible || (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sec.icon === "🔥" &&
                          "Zupy, dania główne gorące, sosy"}
                        {sec.icon === "❄️" &&
                          "Surówki, sałatki, kanapki, desery zimne"}
                        {sec.icon === "🔪" &&
                          "Warzywa, owoce, mięsa do porcjowania"}
                        {sec.icon === "🍰" &&
                          "Ciasta, budynie, galaretki"}
                        {sec.icon === "☕" && "Kompoty, herbaty, napoje"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteSection(sec.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Predefined templates info */}
            <Card className="bg-muted/30">
              <CardContent className="py-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Predefiniowane szablony sekcji:</strong> Kuchnia
                  ciepła (🔥), Kuchnia zimna (❄️), Obróbka wstępna (🔪),
                  Cukiernia (🍰), Napoje (☕). Możesz dodawać własne sekcje
                  dostosowane do specyfiki zakładu.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Dialog: Add section ── */}
        <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj sekcję kuchenną</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nazwa sekcji</Label>
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="np. Grill / Smażalnia"
                />
              </div>
              <div>
                <Label>Ikona</Label>
                <Select value={newSectionIcon} onValueChange={setNewSectionIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="🔥">🔥 Gorąca</SelectItem>
                    <SelectItem value="❄️">❄️ Zimna</SelectItem>
                    <SelectItem value="🔪">🔪 Obróbka</SelectItem>
                    <SelectItem value="🍰">🍰 Cukiernia</SelectItem>
                    <SelectItem value="☕">☕ Napoje</SelectItem>
                    <SelectItem value="🍖">🍖 Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Okna czasowe (oddzielone przecinkiem)</Label>
                <Input
                  value={newSectionTime}
                  onChange={(e) => setNewSectionTime(e.target.value)}
                  placeholder="np. 06:00-08:00, 10:00-12:00"
                />
              </div>
              <div>
                <Label>Osoba odpowiedzialna (opcjonalnie)</Label>
                <Input
                  value={newSectionResp}
                  onChange={(e) => setNewSectionResp(e.target.value)}
                  placeholder="np. Jan Kowalski"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddSection(false)}
              >
                Anuluj
              </Button>
              <Button onClick={handleAddSection}>Dodaj sekcję</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Dialog: Generator ── */}
        <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generator planu produkcji</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Menu (zatwierdzony pakiet)</Label>
                <Select value={genMenu} onValueChange={setGenMenu}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {menuPackages.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data produkcji</Label>
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setSelectedDate(new Date(e.target.value))
                  }
                />
              </div>
              <div>
                <Label>Klient</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sekcje kuchenne</Label>
                <div className="space-y-2 mt-1">
                  {selectedKitchen.sections.map((sec) => (
                    <label
                      key={sec.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={genSections.includes(sec.id)}
                        onCheckedChange={() => toggleGenSection(sec.id)}
                      />
                      <span className="text-sm">
                        {sec.icon} {sec.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={separatePlans}
                  onCheckedChange={setSeparatePlans}
                />
                <Label className="cursor-pointer">
                  Generuj osobne plany per sekcja
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGenerator(false)}
              >
                Anuluj
              </Button>
              <Button onClick={() => setShowGenerator(false)}>
                <Factory className="h-4 w-4 mr-1" />
                Generuj plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DietLayout>
  );
}
