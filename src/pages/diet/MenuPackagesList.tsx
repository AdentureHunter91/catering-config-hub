import { useState } from "react";
import DietLayout from "@/components/DietLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Calendar, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockMenuPackages } from "@/data/mockMenuPackages";
import { MENU_PACKAGE_STATUS_LABELS, MENU_PACKAGE_STATUS_COLORS, CYCLE_LABELS, type CycleType } from "@/types/menuPackage";
import { cn } from "@/lib/utils";

const mockDietsForClient = [
  { id: 1, name: "Dieta Podstawowa", code: "STANDARD", type: "base" as const },
  { id: 2, name: "Dieta Bezglutenowa", code: "GF", type: "derived" as const, baseCode: "STANDARD" },
  { id: 3, name: "Dieta Cukrzycowa", code: "DIABETIC", type: "derived" as const, baseCode: "STANDARD" },
  { id: 4, name: "Dieta Renalna", code: "RENAL", type: "derived" as const, baseCode: "STANDARD" },
  { id: 5, name: "Dieta Wegetariańska", code: "VEG", type: "derived" as const, baseCode: "STANDARD" },
];

export default function MenuPackagesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardClient, setWizardClient] = useState("");
  const [wizardCycle, setWizardCycle] = useState<CycleType>("7");
  const [wizardDiets, setWizardDiets] = useState<number[]>([]);

  const filtered = mockMenuPackages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDiet = (id: number) => {
    setWizardDiets((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    setWizardOpen(false);
    setWizardStep(1);
    navigate("/dietetyka/jadlospisy/1/edytor");
  };

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jadłospisy — Pakiety menu</h1>
        <Button onClick={() => { setWizardOpen(true); setWizardStep(1); }}>
          <Plus className="h-4 w-4 mr-2" /> Nowy pakiet
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj pakietu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa pakietu</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Okres</TableHead>
                <TableHead className="text-center">Diety</TableHead>
                <TableHead>Cykl</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Koszt śr./dzień</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.clientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    {pkg.periodFrom} — {pkg.periodTo}
                  </TableCell>
                  <TableCell className="text-center">{pkg.dietPlans.length}</TableCell>
                  <TableCell>{CYCLE_LABELS[pkg.cycle]}</TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", MENU_PACKAGE_STATUS_COLORS[pkg.status])}>
                      {MENU_PACKAGE_STATUS_LABELS[pkg.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{pkg.avgDailyCost.toFixed(2)} PLN</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/dietetyka/jadlospisy/${pkg.id}/edytor`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/dietetyka/jadlospisy/${pkg.id}/dzienny`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    Brak pakietów menu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wizard dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nowy pakiet menu — Krok {wizardStep}/3</DialogTitle>
            <DialogDescription>
              {wizardStep === 1 && "Podaj dane podstawowe pakietu menu."}
              {wizardStep === 2 && "Wybierz diety do uwzględnienia w jadłospisie."}
              {wizardStep === 3 && "Podsumowanie — sprawdź dane przed utworzeniem."}
            </DialogDescription>
          </DialogHeader>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Nazwa pakietu</Label>
                <Input value={wizardName} onChange={(e) => setWizardName(e.target.value)} placeholder="np. Menu Marzec 2026" />
              </div>
              <div>
                <Label>Klient</Label>
                <Select value={wizardClient} onValueChange={setWizardClient}>
                  <SelectTrigger><SelectValue placeholder="Wybierz klienta" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Szpital Miejski w Nidzicy</SelectItem>
                    <SelectItem value="5">Przedszkole Słoneczko</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data od</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Data do</Label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <Label>Cykl planowania</Label>
                <Select value={wizardCycle} onValueChange={(v) => setWizardCycle(v as CycleType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CYCLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Klient ma {mockDietsForClient.length} aktywnych diet. Zaznacz diety do uwzględnienia:</p>
              {mockDietsForClient.map((diet) => (
                <div key={diet.id} className="flex items-center gap-3 p-2 rounded-md border">
                  <Checkbox
                    checked={wizardDiets.includes(diet.id)}
                    onCheckedChange={() => toggleDiet(diet.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{diet.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({diet.code})</span>
                    {diet.type === "derived" && (
                      <span className="ml-2 text-xs text-primary">← {diet.baseCode}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {diet.type === "base" ? "Bazowa" : "Pochodna"}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-3">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Podsumowanie</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Nazwa:</strong> {wizardName || "—"}</p>
                  <p><strong>Klient:</strong> {wizardClient === "4" ? "Szpital Miejski w Nidzicy" : wizardClient === "5" ? "Przedszkole Słoneczko" : "—"}</p>
                  <p><strong>Cykl:</strong> {CYCLE_LABELS[wizardCycle]}</p>
                  <p><strong>Diety:</strong> {wizardDiets.length > 0 ? wizardDiets.map((id) => mockDietsForClient.find((d) => d.id === id)?.code).join(", ") : "—"}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)}>Wstecz</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setWizardOpen(false)}>Anuluj</Button>
              {wizardStep < 3 ? (
                <Button onClick={() => setWizardStep((s) => s + 1)}>Dalej</Button>
              ) : (
                <Button onClick={handleCreate}>Utwórz pakiet</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
