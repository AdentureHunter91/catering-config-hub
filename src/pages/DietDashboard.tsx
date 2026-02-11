import { useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Plus,
  Copy,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ── Mock data ── */
const statusCounts = [
  { label: "Szkice", count: 3, color: "bg-muted text-muted-foreground", filter: "draft" },
  { label: "Zatwierdzone", count: 5, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", filter: "approved" },
  { label: "Opublikowane", count: 2, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", filter: "published" },
  { label: "Oczekujące", count: 1, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", filter: "pending" },
];

const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"];
const mealRows = [
  "Śniadanie",
  "II Śniadanie",
  "Obiad",
  "Podwieczorek",
  "Kolacja",
  "Posiłek nocny",
];

type CellData = {
  name: string;
  kcal: number;
  deviation: number; // percent deviation from norm
  allergens: string[];
  ingredients: string[];
  cost: number;
  macros: { p: number; f: number; c: number };
};

const allergenColors: Record<string, string> = {
  gluten: "bg-red-500",
  mleko: "bg-blue-500",
  orzechy: "bg-orange-500",
  jaja: "bg-yellow-500",
  soja: "bg-green-500",
  ryby: "bg-cyan-500",
};

const generateCell = (day: number, meal: number): CellData => {
  const names = [
    "Owsianka z owocami",
    "Kanapka pełnoz.",
    "Zupa pomidorowa",
    "Jogurt naturalny",
    "Sałatka cezar",
    "Kasza z warzywami",
    "Kotlet schabowy",
    "Ryż z kurczakiem",
    "Naleśniki",
    "Budyń waniliowy",
  ];
  const idx = (day * 7 + meal * 3) % names.length;
  const dev = ((day + meal) % 5) * 8 - 10;
  const allergenSets = [
    ["gluten"],
    ["mleko", "jaja"],
    ["orzechy"],
    ["gluten", "mleko"],
    [],
    ["soja"],
    ["ryby"],
  ];
  return {
    name: names[idx],
    kcal: 280 + ((day * meal * 37) % 300),
    deviation: dev,
    allergens: allergenSets[(day + meal) % allergenSets.length],
    ingredients: ["Składnik A", "Składnik B", "Składnik C"],
    cost: 8 + ((day + meal) % 12),
    macros: { p: 15 + (meal % 10), f: 10 + (day % 8), c: 40 + ((day + meal) % 20) },
  };
};

const costData = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}.02`,
  cost: 42 + Math.round(Math.random() * 16),
}));
const avgCost = Math.round(costData.reduce((s, d) => s + d.cost, 0) / costData.length * 100) / 100;
const budget = 52;

const alerts = [
  { id: 1, level: "error" as const, text: "Cena mąki pszennej wzrosła o 18%", time: "10 min temu" },
  { id: 2, level: "warning" as const, text: "Odchylenie kaloryczne w menu czwartek >15%", time: "25 min temu" },
  { id: 3, level: "info" as const, text: "Oczekuje zatwierdzenie jadłospisu tygodnia 8", time: "1h temu" },
  { id: 4, level: "warning" as const, text: "Alergen jaja wykryty w diecie bezjajecznej", time: "2h temu" },
  { id: 5, level: "info" as const, text: "Propagacja zmian z diety bazowej zakończona", time: "3h temu" },
];

const alertIcon = (level: "error" | "warning" | "info") => {
  if (level === "error") return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (level === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
};

const deviationBg = (dev: number) => {
  const abs = Math.abs(dev);
  if (abs <= 5) return "bg-green-50 dark:bg-green-950/30";
  if (abs <= 15) return "bg-yellow-50 dark:bg-yellow-950/30";
  return "bg-red-50 dark:bg-red-950/30";
};

export default function DietDashboard() {
  const navigate = useNavigate();

  return (
    <DietLayout pageKey="diet.meals_approval">
      <h1 className="text-2xl font-bold mb-6">Dashboard Dietetyczny</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Status overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Przegląd statusu menu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {statusCounts.map((s) => (
                <button
                  key={s.filter}
                  className={cn(
                    "rounded-lg p-4 text-left transition-transform hover:scale-[1.02] cursor-pointer",
                    s.color
                  )}
                  onClick={() => navigate(`/dietetyka/jadlospisy?status=${s.filter}`)}
                >
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-sm">{s.label}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Cost trends */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trendy kosztów</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[30, 65]} />
                  <ReferenceLine
                    y={budget}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="6 4"
                    label={{ value: "Budżet", position: "right", fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Średni koszt: <strong>{avgCost} PLN/dzień</strong></span>
              <span>Budżet: <strong>{budget},00 PLN/dzień</strong></span>
              <span>Wykorzystanie: <strong>{Math.round((avgCost / budget) * 100)}%</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Weekly menu calendar — spans full width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Menu bieżącego tygodnia</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <TooltipProvider delayDuration={200}>
              <table className="w-full border-collapse text-xs table-fixed">
                <thead>
                  <tr>
                    <th className="p-1 text-left font-medium text-muted-foreground w-28" />
                    {days.map((d) => (
                      <th key={d} className="p-1 text-center font-medium text-muted-foreground">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mealRows.map((meal, mi) => (
                    <tr key={meal}>
                      <td className="p-1 font-medium text-muted-foreground whitespace-nowrap">
                        {meal}
                      </td>
                      {days.map((_, di) => {
                        const cell = generateCell(di, mi);
                        return (
                          <Tooltip key={di}>
                            <TooltipTrigger asChild>
                              <td
                                className={cn(
                                  "p-1.5 border rounded-md cursor-pointer transition-colors hover:ring-1 hover:ring-ring",
                                  deviationBg(cell.deviation)
                                )}
                              >
                                <div className="font-medium truncate max-w-[100px]">
                                  {cell.name}
                                </div>
                                <div className="text-muted-foreground">{cell.kcal} kcal</div>
                                <div className="flex gap-0.5 mt-0.5">
                                  {cell.allergens.map((a) => (
                                    <span
                                      key={a}
                                      className={cn("w-2.5 h-2.5 rounded-full", allergenColors[a] || "bg-muted")}
                                      title={a}
                                    />
                                  ))}
                                </div>
                              </td>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">{cell.name}</p>
                              <p className="text-xs">Składniki: {cell.ingredients.join(", ")}</p>
                              <p className="text-xs">Koszt: {cell.cost} PLN</p>
                              <p className="text-xs">
                                B: {cell.macros.p}g | T: {cell.macros.f}g | W: {cell.macros.c}g
                              </p>
                              <p className="text-xs">Odchylenie: {cell.deviation > 0 ? "+" : ""}{cell.deviation}%</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Card 5: Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alerty i ostrzeżenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2 rounded-md border p-2.5 text-sm"
                >
                  {alertIcon(a.level)}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0">
              Pokaż wszystkie
            </Button>
          </CardContent>
        </Card>

        {/* Card 6: Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Szybkie akcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/dietetyka/jadlospisy?action=new")}>
                <Plus className="h-5 w-5" />
                <span className="text-xs">Nowy jadłospis</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/dietetyka/jadlospisy?action=copy")}>
                <Copy className="h-5 w-5" />
                <span className="text-xs">Skopiuj menu</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/dietetyka/wydawki?action=generate")}>
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs">Wygeneruj wydawkę</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 relative" onClick={() => navigate("/dietetyka/jadlospisy?status=pending")}>
                <FileCheck className="h-5 w-5" />
                <span className="text-xs">Zatwierdzenia oczekujące</span>
                <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5">3</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DietLayout>
  );
}
