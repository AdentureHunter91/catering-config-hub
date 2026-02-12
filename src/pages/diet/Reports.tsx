import { useState } from "react";
import DietLayout from "@/components/DietLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Trash2,
  FileDown,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Activity,
  DollarSign,
  ShieldAlert,
  Recycle,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ─── Types ─── */
type ReportType = "hub" | "nutrition" | "cost" | "allergens" | "waste";

const clients = ["Szpital Miejski im. Narutowicza", "ZOZ Nidzica", "SPZOZ Sierpc"];
const diets = ["Standardowa", "Bezglutenowa", "Cukrzycowa", "Nerkowa", "Wszystkie"];
const meals = ["Wszystkie", "Śniadanie", "II Śniadanie", "Obiad", "Podwieczorek", "Kolacja"];

/* ─── Mock data ─── */
const nutritionDays = [
  { day: "Pon 10.02", kcal: 1920, kcalTarget: 2000, protein: 58, proteinTarget: 60, fat: 65, fatTarget: 70, carbs: 255, carbsTarget: 270, fiber: 22, fiberTarget: 25, sodium: 1800, sodiumTarget: 2000, status: "ok" },
  { day: "Wto 11.02", kcal: 2100, kcalTarget: 2000, protein: 64, proteinTarget: 60, fat: 72, fatTarget: 70, carbs: 280, carbsTarget: 270, fiber: 28, fiberTarget: 25, sodium: 2100, sodiumTarget: 2000, status: "warning" },
  { day: "Śro 12.02", kcal: 1750, kcalTarget: 2000, protein: 48, proteinTarget: 60, fat: 58, fatTarget: 70, carbs: 240, carbsTarget: 270, fiber: 20, fiberTarget: 25, sodium: 1600, sodiumTarget: 2000, status: "error" },
  { day: "Czw 13.02", kcal: 1980, kcalTarget: 2000, protein: 62, proteinTarget: 60, fat: 68, fatTarget: 70, carbs: 260, carbsTarget: 270, fiber: 24, fiberTarget: 25, sodium: 1900, sodiumTarget: 2000, status: "ok" },
  { day: "Pią 14.02", kcal: 2050, kcalTarget: 2000, protein: 59, proteinTarget: 60, fat: 71, fatTarget: 70, carbs: 275, carbsTarget: 270, fiber: 26, fiberTarget: 25, sodium: 2050, sodiumTarget: 2000, status: "ok" },
  { day: "Sob 15.02", kcal: 1850, kcalTarget: 2000, protein: 55, proteinTarget: 60, fat: 63, fatTarget: 70, carbs: 248, carbsTarget: 270, fiber: 21, fiberTarget: 25, sodium: 1750, sodiumTarget: 2000, status: "warning" },
  { day: "Nie 16.02", kcal: 1900, kcalTarget: 2000, protein: 57, proteinTarget: 60, fat: 66, fatTarget: 70, carbs: 252, carbsTarget: 270, fiber: 23, fiberTarget: 25, sodium: 1850, sodiumTarget: 2000, status: "ok" },
];

const costDays = [
  { day: "Pon 10.02", breakfast: 12.50, lunch: 28.40, dinner: 14.20, total: 55.10, budget: 52.00, delta: 3.10 },
  { day: "Wto 11.02", breakfast: 11.80, lunch: 26.90, dinner: 13.50, total: 52.20, budget: 52.00, delta: 0.20 },
  { day: "Śro 12.02", breakfast: 13.10, lunch: 30.20, dinner: 15.80, total: 59.10, budget: 52.00, delta: 7.10 },
  { day: "Czw 13.02", breakfast: 11.20, lunch: 27.50, dinner: 12.90, total: 51.60, budget: 52.00, delta: -0.40 },
  { day: "Pią 14.02", breakfast: 12.80, lunch: 29.10, dinner: 14.60, total: 56.50, budget: 52.00, delta: 4.50 },
  { day: "Sob 15.02", breakfast: 10.50, lunch: 25.80, dinner: 13.20, total: 49.50, budget: 52.00, delta: -2.50 },
  { day: "Nie 16.02", breakfast: 11.90, lunch: 26.40, dinner: 13.80, total: 52.10, budget: 52.00, delta: 0.10 },
];

const costByCategory = [
  { name: "Białka", value: 38, color: "hsl(var(--primary))" },
  { name: "Warzywa", value: 22, color: "hsl(142 71% 45%)" },
  { name: "Nabiał", value: 18, color: "hsl(199 89% 48%)" },
  { name: "Pieczywo", value: 12, color: "hsl(38 92% 50%)" },
  { name: "Inne", value: 10, color: "hsl(var(--muted-foreground))" },
];

const allergenMatrix = [
  { day: "Pon 10.02", meals: { "Śniadanie": ["Gluten", "Mleko"], "Obiad": ["Gluten", "Jaja", "Seler"], "Kolacja": ["Gluten", "Mleko"] } },
  { day: "Wto 11.02", meals: { "Śniadanie": ["Mleko"], "Obiad": ["Ryby", "Gluten"], "Kolacja": ["Gluten", "Jaja"] } },
  { day: "Śro 12.02", meals: { "Śniadanie": ["Gluten", "Mleko"], "Obiad": ["Seler", "Mleko", "Gluten"], "Kolacja": ["Mleko"] } },
  { day: "Czw 13.02", meals: { "Śniadanie": ["Jaja"], "Obiad": ["Gluten", "Ryby"], "Kolacja": ["Gluten", "Mleko"] } },
  { day: "Pią 14.02", meals: { "Śniadanie": ["Gluten", "Mleko"], "Obiad": ["Skorupiaki", "Seler"], "Kolacja": ["Jaja", "Mleko"] } },
];

const allergenColors: Record<string, string> = {
  Gluten: "bg-amber-100 text-amber-800",
  Mleko: "bg-blue-100 text-blue-800",
  Jaja: "bg-yellow-100 text-yellow-800",
  Ryby: "bg-cyan-100 text-cyan-800",
  Seler: "bg-green-100 text-green-800",
  Skorupiaki: "bg-red-100 text-red-800",
};

/* ─── Component ─── */
export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>("hub");
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [selectedDiet, setSelectedDiet] = useState("Wszystkie");
  const [selectedMeal, setSelectedMeal] = useState("Wszystkie");
  const [allergenMode, setAllergenMode] = useState<"matrix" | "patient">("matrix");
  const [dateFrom, setDateFrom] = useState("2026-02-10");
  const [dateTo, setDateTo] = useState("2026-02-16");

  const statusBadge = (s: string) => {
    switch (s) {
      case "ok": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" />Zgodny</Badge>;
      case "warning": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle className="h-3 w-3 mr-1" />Ostrzeżenie</Badge>;
      case "error": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Niezgodny</Badge>;
      default: return null;
    }
  };

  const renderFilters = (showMeal = false) => (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <Label className="text-xs">Klient</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Dieta</Label>
        <Select value={selectedDiet} onValueChange={setSelectedDiet}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{diets.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {showMeal && (
        <div>
          <Label className="text-xs">Posiłek</Label>
          <Select value={selectedMeal} onValueChange={setSelectedMeal}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{meals.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="text-xs">Od</Label>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" />
      </div>
      <div>
        <Label className="text-xs">Do</Label>
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" />
      </div>
    </div>
  );

  const exportButtons = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Pobierz PDF</Button>
      <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1" />Pobierz Excel</Button>
    </div>
  );

  /* ─── Hub ─── */
  if (activeReport === "hub") {
    const reportCards: { type: ReportType; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
      { type: "nutrition", title: "Raport odżywczy", desc: "Zgodność odżywcza menu vs cele diety. Analiza kcal, makroskładników, błonnika i sodu.", icon: <Activity className="h-8 w-8" />, color: "text-emerald-600" },
      { type: "cost", title: "Raport kosztowy", desc: "FoodCost: planowany vs rzeczywisty, budżet vs realizacja, rozkład kosztów.", icon: <DollarSign className="h-8 w-8" />, color: "text-blue-600" },
      { type: "allergens", title: "Raport alergenów", desc: "Matryca alergenów per menu/dzień. Weryfikacja bezpieczeństwa dla diety/pacjenta.", icon: <ShieldAlert className="h-8 w-8" />, color: "text-amber-600" },
      { type: "waste", title: "Raport odpadów", desc: "Współczynniki odpadów, wpływ kosztowy, dane z modułu Produkcja.", icon: <Recycle className="h-8 w-8" />, color: "text-red-600" },
    ];

    return (
      <DietLayout pageKey="diet.meals_approval">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" />Raporty</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportCards.map(rc => (
              <Card key={rc.type} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => setActiveReport(rc.type)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`${rc.color}`}>{rc.icon}</div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-lg">{rc.title}</CardTitle>
                  <CardDescription>{rc.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DietLayout>
    );
  }

  /* ─── Shared wrapper ─── */
  const reportTitle = activeReport === "nutrition" ? "Raport odżywczy" : activeReport === "cost" ? "Raport kosztowy" : activeReport === "allergens" ? "Raport alergenów" : "Raport odpadów";

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveReport("hub")}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold">{reportTitle}</h1>
        </div>

        {/* ── Nutrition Report ── */}
        {activeReport === "nutrition" && (
          <div className="space-y-4">
            {renderFilters(true)}
            {exportButtons}

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dzień</TableHead>
                  <TableHead className="text-right">Kcal</TableHead>
                  <TableHead className="text-right">Białko (g)</TableHead>
                  <TableHead className="text-right">Tłuszcz (g)</TableHead>
                  <TableHead className="text-right">Węgl. (g)</TableHead>
                  <TableHead className="text-right">Błonnik (g)</TableHead>
                  <TableHead className="text-right">Sód (mg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nutritionDays.map(d => (
                  <TableRow key={d.day}>
                    <TableCell className="font-medium">{d.day}</TableCell>
                    <TableCell className="text-right">{d.kcal} <span className="text-xs text-muted-foreground">/ {d.kcalTarget}</span></TableCell>
                    <TableCell className="text-right">{d.protein} <span className="text-xs text-muted-foreground">/ {d.proteinTarget}</span></TableCell>
                    <TableCell className="text-right">{d.fat} <span className="text-xs text-muted-foreground">/ {d.fatTarget}</span></TableCell>
                    <TableCell className="text-right">{d.carbs} <span className="text-xs text-muted-foreground">/ {d.carbsTarget}</span></TableCell>
                    <TableCell className="text-right">{d.fiber} <span className="text-xs text-muted-foreground">/ {d.fiberTarget}</span></TableCell>
                    <TableCell className="text-right">{d.sodium} <span className="text-xs text-muted-foreground">/ {d.sodiumTarget}</span></TableCell>
                    <TableCell>{statusBadge(d.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary */}
            <Card className="bg-muted/30">
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span>Średnie kcal: <strong>{Math.round(nutritionDays.reduce((s, d) => s + d.kcal, 0) / nutritionDays.length)}</strong></span>
                  <span>Średnie białko: <strong>{Math.round(nutritionDays.reduce((s, d) => s + d.protein, 0) / nutritionDays.length)}g</strong></span>
                  <span>Dni zgodne: <strong>{nutritionDays.filter(d => d.status === "ok").length}/{nutritionDays.length}</strong> ({Math.round(nutritionDays.filter(d => d.status === "ok").length / nutritionDays.length * 100)}%)</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Trend kcal</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={nutritionDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis domain={[1500, 2300]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="kcal" stroke="hsl(var(--primary))" name="Kcal" strokeWidth={2} />
                      <Line type="monotone" dataKey="kcalTarget" stroke="hsl(var(--muted-foreground))" name="Cel" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Rozkład makroskładników (średnia)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[{
                      name: "Średnia",
                      protein: Math.round(nutritionDays.reduce((s, d) => s + d.protein, 0) / nutritionDays.length),
                      fat: Math.round(nutritionDays.reduce((s, d) => s + d.fat, 0) / nutritionDays.length),
                      carbs: Math.round(nutritionDays.reduce((s, d) => s + d.carbs, 0) / nutritionDays.length),
                      proteinT: 60, fatT: 70, carbsT: 270,
                    }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="protein" fill="hsl(142 71% 45%)" name="Białko (g)" />
                      <Bar dataKey="fat" fill="hsl(38 92% 50%)" name="Tłuszcz (g)" />
                      <Bar dataKey="carbs" fill="hsl(var(--primary))" name="Węgl. (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── Cost Report ── */}
        {activeReport === "cost" && (
          <div className="space-y-4">
            {renderFilters()}
            {exportButtons}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dzień</TableHead>
                  <TableHead className="text-right">Śniadanie</TableHead>
                  <TableHead className="text-right">Obiad</TableHead>
                  <TableHead className="text-right">Kolacja</TableHead>
                  <TableHead className="text-right">Koszt/dzień</TableHead>
                  <TableHead className="text-right">Budżet</TableHead>
                  <TableHead className="text-right">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costDays.map(d => (
                  <TableRow key={d.day}>
                    <TableCell className="font-medium">{d.day}</TableCell>
                    <TableCell className="text-right">{d.breakfast.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{d.lunch.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{d.dinner.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{d.total.toFixed(2)} PLN</TableCell>
                    <TableCell className="text-right">{d.budget.toFixed(2)} PLN</TableCell>
                    <TableCell className={`text-right font-medium ${d.delta > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {d.delta > 0 ? "+" : ""}{d.delta.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Card className="bg-muted/30">
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span>Średni koszt/dzień: <strong>{(costDays.reduce((s, d) => s + d.total, 0) / costDays.length).toFixed(2)} PLN</strong></span>
                  <span>Łączny koszt: <strong>{costDays.reduce((s, d) => s + d.total, 0).toFixed(2)} PLN</strong></span>
                  <span>Łączny budżet: <strong>{costDays.reduce((s, d) => s + d.budget, 0).toFixed(2)} PLN</strong></span>
                  <span className={costDays.reduce((s, d) => s + d.delta, 0) > 0 ? "text-red-600" : "text-emerald-600"}>
                    Δ łączne: <strong>{costDays.reduce((s, d) => s + d.delta, 0) > 0 ? "+" : ""}{costDays.reduce((s, d) => s + d.delta, 0).toFixed(2)} PLN</strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Koszt dzienny vs budżet</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={costDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis domain={[40, 65]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name="Koszt" strokeWidth={2} />
                      <Line type="monotone" dataKey="budget" stroke="hsl(var(--muted-foreground))" name="Budżet" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Rozkład kosztów wg kategorii</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={costByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                        {costByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── Allergens Report ── */}
        {activeReport === "allergens" && (
          <div className="space-y-4">
            {renderFilters()}

            <Tabs value={allergenMode} onValueChange={v => setAllergenMode(v as "matrix" | "patient")}>
              <TabsList>
                <TabsTrigger value="matrix">Matryca menu</TabsTrigger>
                <TabsTrigger value="patient">Raport pacjenta</TabsTrigger>
              </TabsList>

              <TabsContent value="matrix" className="space-y-3">
                {exportButtons}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dzień</TableHead>
                      <TableHead>Śniadanie</TableHead>
                      <TableHead>Obiad</TableHead>
                      <TableHead>Kolacja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergenMatrix.map(d => (
                      <TableRow key={d.day}>
                        <TableCell className="font-medium">{d.day}</TableCell>
                        {["Śniadanie", "Obiad", "Kolacja"].map(meal => (
                          <TableCell key={meal}>
                            <div className="flex flex-wrap gap-1">
                              {(d.meals[meal as keyof typeof d.meals] || []).map(a => (
                                <Badge key={a} variant="outline" className={`text-xs ${allergenColors[a] || "bg-muted"}`}>{a}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="patient" className="space-y-3">
                {exportButtons}
                <Card>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-xs">Dieta pacjenta</Label>
                        <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                          <SelectContent>{diets.filter(d => d !== "Wszystkie").map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Analiza bezpieczeństwa: {selectedDiet}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Pon 10.02 — Menu bezpieczne (brak konfliktu alergenowego)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Wto 11.02 — Menu bezpieczne</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>Śro 12.02 — <strong>UWAGA:</strong> Obiad zawiera Gluten (wyłączenie diety Bezglutenowej)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Czw 13.02 — Menu bezpieczne</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Pią 14.02 — Menu bezpieczne</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t text-sm">
                        <span className="text-emerald-600 font-medium">4/5 dni bezpiecznych</span> · <span className="text-amber-600 font-medium">1 dzień z ostrzeżeniem</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ── Waste Report ── */}
        {activeReport === "waste" && (
          <div className="space-y-4">
            {renderFilters()}
            {exportButtons}

            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Recycle className="h-4 w-4" />
                  Moduł raportów odpadów jest zasilany danymi z Modułu Produkcja. Poniżej dane szacunkowe na podstawie współczynników odpadów zdefiniowanych w recepturach.
                </p>
              </CardContent>
            </Card>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategoria składnika</TableHead>
                  <TableHead className="text-right">Ilość brutto (kg)</TableHead>
                  <TableHead className="text-right">Ilość netto (kg)</TableHead>
                  <TableHead className="text-right">Odpady (kg)</TableHead>
                  <TableHead className="text-right">Wsp. odpadów</TableHead>
                  <TableHead className="text-right">Koszt odpadów</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { cat: "Warzywa", gross: 42.5, net: 33.2, waste: 9.3, pct: 21.9, cost: 18.60 },
                  { cat: "Mięso", gross: 28.8, net: 23.0, waste: 5.8, pct: 20.1, cost: 72.50 },
                  { cat: "Ryby", gross: 8.4, net: 7.1, waste: 1.3, pct: 15.5, cost: 19.50 },
                  { cat: "Owoce", gross: 15.2, net: 13.9, waste: 1.3, pct: 8.6, cost: 4.55 },
                  { cat: "Nabiał", gross: 24.6, net: 24.6, waste: 0.0, pct: 0.0, cost: 0.00 },
                  { cat: "Pieczywo", gross: 15.1, net: 15.1, waste: 0.0, pct: 0.0, cost: 0.00 },
                ].map(r => (
                  <TableRow key={r.cat}>
                    <TableCell className="font-medium">{r.cat}</TableCell>
                    <TableCell className="text-right">{r.gross.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{r.net.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{r.waste.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{r.pct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-medium">{r.cost.toFixed(2)} PLN</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Card className="bg-muted/30">
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span>Łączne odpady: <strong>17.7 kg</strong></span>
                  <span>Koszt odpadów: <strong>115.15 PLN</strong></span>
                  <span>Średni wsp. odpadów: <strong>13.1%</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DietLayout>
  );
}
