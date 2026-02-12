import { useState } from "react";
import DietLayout from "@/components/DietLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Printer,
  Eye,
  RefreshCw,
  Calendar,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Timer,
  XCircle,
  Snowflake,
  Thermometer,
  Leaf,
  Package,
  Cookie,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";

/* ─── Types ─── */
interface DispatchProduct {
  name: string;
  group: string;
  groupIcon: string;
  netKg: number;
  wastePct: number;
  grossKg: number;
  portions: number;
  cost: number;
}

interface Tranche {
  id: string;
  type: "frozen" | "chilled" | "fresh" | "dry" | "bakery";
  label: string;
  icon: React.ReactNode;
  deadline: string;
  note?: string;
  products: DispatchProduct[];
}

interface Dispatch {
  id: string;
  number: string;
  clientName: string;
  productionDate: string;
  menuSource: string;
  version: number;
  generatedBy: string;
  generatedAt: string;
  status: "generated" | "sent" | "confirmed";
  tranches: Tranche[];
}

type CalendarEntry = {
  date: string;
  items: { trancheType: string; icon: React.ReactNode; label: string; status: "generated" | "pending" | "late" }[];
};

/* ─── Mock data ─── */
const trancheIcon = (type: string) => {
  switch (type) {
    case "frozen": return <Snowflake className="h-4 w-4 text-blue-500" />;
    case "chilled": return <Thermometer className="h-4 w-4 text-cyan-500" />;
    case "fresh": return <Leaf className="h-4 w-4 text-green-500" />;
    case "dry": return <Package className="h-4 w-4 text-amber-700" />;
    case "bakery": return <Cookie className="h-4 w-4 text-orange-500" />;
    default: return <Package className="h-4 w-4" />;
  }
};

const mockTranches: Tranche[] = [
  {
    id: "t1",
    type: "frozen",
    label: "Zamrożone ❄️",
    icon: <Snowflake className="h-4 w-4 text-blue-500" />,
    deadline: "11.02.2026, 15:00",
    note: "WYMAGA ROZMROŻENIA — wydać minimum 24h przed produkcją",
    products: [
      { name: "Pierś z kurczaka mrożona", group: "Mięso", groupIcon: "❄️", netKg: 5.30, wastePct: 20, grossKg: 6.63, portions: 95, cost: 82.88 },
      { name: "Dorsz mrożony", group: "Ryby", groupIcon: "❄️", netKg: 3.10, wastePct: 15, grossKg: 3.65, portions: 40, cost: 58.40 },
      { name: "Filet z mintaja", group: "Ryby", groupIcon: "❄️", netKg: 2.40, wastePct: 12, grossKg: 2.73, portions: 32, cost: 43.68 },
      { name: "Mieszanka warzywna mrożona", group: "Warzywa mrożone", groupIcon: "❄️", netKg: 4.80, wastePct: 5, grossKg: 5.05, portions: 95, cost: 25.25 },
    ],
  },
  {
    id: "t2",
    type: "chilled",
    label: "Chłodzone 🧊",
    icon: <Thermometer className="h-4 w-4 text-cyan-500" />,
    deadline: "12.02.2026, 06:00",
    products: [
      { name: "Jogurt naturalny", group: "Nabiał", groupIcon: "🧊", netKg: 9.50, wastePct: 0, grossKg: 9.50, portions: 95, cost: 38.00 },
      { name: "Ser biały półtłusty", group: "Nabiał", groupIcon: "🧊", netKg: 4.75, wastePct: 0, grossKg: 4.75, portions: 95, cost: 47.50 },
      { name: "Masło extra", group: "Nabiał", groupIcon: "🧊", netKg: 1.90, wastePct: 0, grossKg: 1.90, portions: 95, cost: 30.40 },
    ],
  },
  {
    id: "t3",
    type: "fresh",
    label: "Świeże 🥬",
    icon: <Leaf className="h-4 w-4 text-green-500" />,
    deadline: "12.02.2026, 06:00",
    products: [
      { name: "Marchew", group: "Warzywa", groupIcon: "🥬", netKg: 6.20, wastePct: 18, grossKg: 7.56, portions: 95, cost: 15.12 },
      { name: "Ziemniaki", group: "Warzywa", groupIcon: "🥬", netKg: 14.25, wastePct: 22, grossKg: 18.27, portions: 95, cost: 27.41 },
      { name: "Jabłka", group: "Owoce", groupIcon: "🥬", netKg: 9.50, wastePct: 8, grossKg: 10.33, portions: 95, cost: 36.15 },
      { name: "Pomidory", group: "Warzywa", groupIcon: "🥬", netKg: 3.80, wastePct: 5, grossKg: 4.00, portions: 60, cost: 28.00 },
    ],
  },
  {
    id: "t4",
    type: "bakery",
    label: "Pieczywo 🍞",
    icon: <Cookie className="h-4 w-4 text-orange-500" />,
    deadline: "12.02.2026, 05:30",
    products: [
      { name: "Chleb pszenny krojony", group: "Pieczywo", groupIcon: "🍞", netKg: 9.50, wastePct: 0, grossKg: 9.50, portions: 95, cost: 23.75 },
      { name: "Bułka pszenna", group: "Pieczywo", groupIcon: "🍞", netKg: 4.75, wastePct: 0, grossKg: 4.75, portions: 95, cost: 14.25 },
      { name: "Bułka bezglutenowa", group: "Pieczywo GF", groupIcon: "🍞", netKg: 0.80, wastePct: 0, grossKg: 0.80, portions: 8, cost: 12.00 },
    ],
  },
];

const mockDispatches: Dispatch[] = [
  {
    id: "d1", number: "WD/2026/02/0045", clientName: "Szpital Miejski im. Narutowicza",
    productionDate: "12.02.2026", menuSource: "Jadłospis Luty 2026", version: 3,
    generatedBy: "Jan Kowalski", generatedAt: "10.02.2026 10:30",
    status: "generated", tranches: mockTranches,
  },
  {
    id: "d2", number: "WD/2026/02/0044", clientName: "Szpital Miejski im. Narutowicza",
    productionDate: "11.02.2026", menuSource: "Jadłospis Luty 2026", version: 2,
    generatedBy: "Jan Kowalski", generatedAt: "09.02.2026 11:00",
    status: "sent", tranches: mockTranches,
  },
  {
    id: "d3", number: "WD/2026/02/0043", clientName: "Szpital Miejski im. Narutowicza",
    productionDate: "10.02.2026", menuSource: "Jadłospis Luty 2026", version: 1,
    generatedBy: "Anna Nowak", generatedAt: "08.02.2026 09:15",
    status: "confirmed", tranches: mockTranches,
  },
];

const clients = ["Szpital Miejski im. Narutowicza", "ZOZ Nidzica", "SPZOZ Sierpc"];

/* ─── Component ─── */
export default function Dispatches() {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 12));
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(2026, 1, 10), { weekStartsOn: 1 }));
  const [previewDispatch, setPreviewDispatch] = useState<Dispatch | null>(null);
  const [activeTranche, setActiveTranche] = useState(0);

  const dispatch = mockDispatches[0];
  const currentTranche = dispatch.tranches[activeTranche];

  /* group products */
  const groupedProducts = currentTranche.products.reduce<Record<string, DispatchProduct[]>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});

  const trancheTotal = currentTranche.products.reduce((s, p) => s + p.cost, 0);
  const tranchePortions = currentTranche.products.reduce((s, p) => s + p.portions, 0);

  /* Calendar data */
  const calendarDays: CalendarEntry[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dayNum = d.getDate();
    const items: CalendarEntry["items"] = [];
    if (i === 0) items.push({ trancheType: "dry", icon: trancheIcon("dry"), label: "Suche na tydz 11-16", status: "generated" });
    if (i === 1) items.push({ trancheType: "frozen", icon: trancheIcon("frozen"), label: "Mrożone na Śro", status: "generated" });
    if (i === 2) {
      items.push({ trancheType: "chilled", icon: trancheIcon("chilled"), label: "Chłodzone", status: "pending" });
      items.push({ trancheType: "fresh", icon: trancheIcon("fresh"), label: "Świeże", status: "pending" });
      items.push({ trancheType: "bakery", icon: trancheIcon("bakery"), label: "Pieczywo", status: "pending" });
    }
    if (i === 3) items.push({ trancheType: "frozen", icon: trancheIcon("frozen"), label: "Mrożone na Czw", status: "pending" });
    if (i === 4) {
      items.push({ trancheType: "chilled", icon: trancheIcon("chilled"), label: "Chłodzone", status: "pending" });
      items.push({ trancheType: "fresh", icon: trancheIcon("fresh"), label: "Świeże", status: "late" });
    }
    return { date: format(d, "EEE dd.MM", { locale: pl }), items };
  });

  const statusBadge = (s: string) => {
    switch (s) {
      case "generated": return <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50"><CheckCircle2 className="h-3 w-3 mr-1" />Wygenerowana</Badge>;
      case "sent": return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50"><RefreshCw className="h-3 w-3 mr-1" />Wysłana</Badge>;
      case "confirmed": return <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5"><CheckCircle2 className="h-3 w-3 mr-1" />Potwierdzona</Badge>;
      default: return null;
    }
  };

  const calendarStatusIcon = (s: string) => {
    switch (s) {
      case "generated": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case "pending": return <Timer className="h-3.5 w-3.5 text-amber-500" />;
      case "late": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Wydawki dietetyczne</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Odśwież zamówienia</Button>
            <Button size="sm"><FileDown className="h-4 w-4 mr-1" />Generuj wydawkę</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview" className="gap-1"><Eye className="h-4 w-4" />Podgląd wydawki</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1"><Calendar className="h-4 w-4" />Kalendarz</TabsTrigger>
            <TabsTrigger value="history" className="gap-1"><List className="h-4 w-4" />Historia</TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Preview ── */}
          <TabsContent value="preview" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, -1))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-3 text-sm font-medium">{format(selectedDate, "EEEE, dd.MM.yyyy", { locale: pl })}</span>
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Dispatch header */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4 pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nr wydawki</span>
                    <p className="font-bold">{dispatch.number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Klient</span>
                    <p className="font-medium">{dispatch.clientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data produkcji</span>
                    <p className="font-medium">{dispatch.productionDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wygenerował</span>
                    <p className="font-medium">{dispatch.generatedBy} · {dispatch.generatedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tranche tabs */}
            <Tabs value={String(activeTranche)} onValueChange={v => setActiveTranche(Number(v))}>
              <TabsList className="flex-wrap h-auto gap-1">
                {dispatch.tranches.map((t, i) => (
                  <TabsTrigger key={t.id} value={String(i)} className="gap-1.5">
                    {t.icon}
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={String(activeTranche)} className="space-y-3 mt-3">
                {/* Tranche info */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />Wydać do: <strong className="text-foreground">{currentTranche.deadline}</strong></span>
                  {currentTranche.note && (
                    <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-4 w-4" />{currentTranche.note}</span>
                  )}
                </div>

                {/* Products table grouped */}
                {Object.entries(groupedProducts).map(([group, products]) => {
                  const groupTotal = products.reduce((s, p) => s + p.cost, 0);
                  const groupWeight = products.reduce((s, p) => s + p.grossKg, 0);
                  return (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-1 mt-3">
                        <span className="text-lg">{products[0].groupIcon}</span>
                        <h3 className="font-semibold text-sm">{group}</h3>
                        <span className="text-xs text-muted-foreground ml-auto">Σ {groupWeight.toFixed(2)} kg · {groupTotal.toFixed(2)} PLN</span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produkt</TableHead>
                            <TableHead className="text-right">Netto (kg)</TableHead>
                            <TableHead className="text-right">Straty %</TableHead>
                            <TableHead className="text-right">Brutto (kg)</TableHead>
                            <TableHead className="text-right">Porcje</TableHead>
                            <TableHead className="text-right">Koszt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{p.name}</TableCell>
                              <TableCell className="text-right">{p.netKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{p.wastePct}%</TableCell>
                              <TableCell className="text-right font-medium">{p.grossKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{p.portions}</TableCell>
                              <TableCell className="text-right font-medium">{p.cost.toFixed(2)} PLN</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}

                {/* Totals */}
                <Card className="bg-muted/30">
                  <CardContent className="py-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">Suma transzy: {currentTranche.label}</span>
                    <div className="flex gap-6">
                      <span>Brutto: <strong>{currentTranche.products.reduce((s, p) => s + p.grossKg, 0).toFixed(2)} kg</strong></span>
                      <span>Porcje: <strong>{tranchePortions}</strong></span>
                      <span>Koszt: <strong>{trancheTotal.toFixed(2)} PLN</strong></span>
                    </div>
                  </CardContent>
                </Card>

                {/* Export buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Drukuj</Button>
                  <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Generuj PDF</Button>
                  <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1" />Generuj Excel</Button>
                  <Button variant="secondary" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Wyślij do StockFlow</Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ── TAB 2: Calendar ── */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, -7))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-3 text-sm font-medium">
                  {format(weekStart, "dd.MM", { locale: pl })} – {format(addDays(weekStart, 6), "dd.MM.yyyy", { locale: pl })}
                </span>
                <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, 7))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {calendarDays.slice(0, 5).map((day, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-medium capitalize">{day.date}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-1.5">
                    {day.items.length === 0 && <p className="text-xs text-muted-foreground italic">Brak wydawek</p>}
                    {day.items.map((item, j) => (
                      <div key={j} className={`flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 ${
                        item.status === "late" ? "bg-red-50 border border-red-200" :
                        item.status === "generated" ? "bg-emerald-50 border border-emerald-200" :
                        "bg-amber-50 border border-amber-200"
                      }`}>
                        {item.icon}
                        <span className="flex-1 truncate">{item.label}</span>
                        {calendarStatusIcon(item.status)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weekend row (smaller) */}
            <div className="grid grid-cols-5 gap-3">
              {calendarDays.slice(5).map((day, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-medium capitalize">{day.date}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <p className="text-xs text-muted-foreground italic">Brak wydawek</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Wygenerowana</span>
              <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-amber-500" />Do wygenerowania</span>
              <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" />Spóźniona</span>
            </div>
          </TabsContent>

          {/* ── TAB 3: History ── */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex gap-3 items-center">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr wydawki</TableHead>
                  <TableHead>Data produkcji</TableHead>
                  <TableHead>Transze</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Menu źródłowe</TableHead>
                  <TableHead>Wersja</TableHead>
                  <TableHead>Wygenerował</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDispatches.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs font-medium">{d.number}</TableCell>
                    <TableCell>{d.productionDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {d.tranches.map(t => <span key={t.id} title={t.label}>{t.icon}</span>)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{d.clientName}</TableCell>
                    <TableCell>{d.menuSource}</TableCell>
                    <TableCell className="text-center">v{d.version}</TableCell>
                    <TableCell className="text-sm">{d.generatedBy}<br /><span className="text-xs text-muted-foreground">{d.generatedAt}</span></TableCell>
                    <TableCell>{statusBadge(d.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Podgląd" onClick={() => setPreviewDispatch(d)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Pobierz PDF"><FileDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Regeneruj"><RefreshCw className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview dialog */}
      <Dialog open={!!previewDispatch} onOpenChange={() => setPreviewDispatch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wydawka {previewDispatch?.number}</DialogTitle>
          </DialogHeader>
          {previewDispatch && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Klient:</span> {previewDispatch.clientName}</div>
                <div><span className="text-muted-foreground">Data produkcji:</span> {previewDispatch.productionDate}</div>
                <div><span className="text-muted-foreground">Wygenerował:</span> {previewDispatch.generatedBy}</div>
                <div><span className="text-muted-foreground">Status:</span> {statusBadge(previewDispatch.status)}</div>
              </div>
              <p className="text-muted-foreground">Transze: {previewDispatch.tranches.map(t => t.label).join(", ")}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />PDF</Button>
                <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
