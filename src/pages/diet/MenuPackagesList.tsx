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
import { Plus, Search, Calendar, Edit, Eye, Copy, Tag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockMenuPackages } from "@/data/mockMenuPackages";
import {
  MENU_PACKAGE_STATUS_LABELS, MENU_PACKAGE_STATUS_COLORS,
  CYCLE_LABELS, PREDEFINED_TAGS, type CycleType,
} from "@/types/menuPackage";
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
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardClient, setWizardClient] = useState("");
  const [wizardCycle, setWizardCycle] = useState<CycleType>("7");
  const [wizardDiets, setWizardDiets] = useState<number[]>([]);

  // Copy dialog state
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyClient, setCopyClient] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [copyTo, setCopyTo] = useState("");

  const filtered = mockMenuPackages.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || p.tags.includes(filterTag);
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesTag && matchesStatus;
  });

  const toggleDiet = (id: number) => {
    setWizardDiets((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((p) => p.id));
    }
  };

  const handleCreate = () => {
    setWizardOpen(false);
    setWizardStep(1);
    navigate("/dietetyka/jadlospisy/1/edytor");
  };

  const handleBulkCopy = () => {
    setCopyOpen(true);
  };

  const handleCopyConfirm = () => {
    setCopyOpen(false);
    setCopyClient("");
    setCopyFrom("");
    setCopyTo("");
    setSelected([]);
  };

  const allTags = PREDEFINED_TAGS;
  const getTagDef = (id: string) => allTags.find((t) => t.id === id);

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jadłospisy — Pakiety menu</h1>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Zaznaczono: {selected.length}</span>
              <Button variant="outline" onClick={handleBulkCopy}>
                <Copy className="h-4 w-4 mr-2" /> Kopiuj zaznaczone
              </Button>
            </>
          )}
          <Button onClick={() => { setWizardOpen(true); setWizardStep(1); }}>
            <Plus className="h-4 w-4 mr-2" /> Nowy pakiet
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj pakietu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={filterStatus ?? "all"} onValueChange={(v) => setFilterStatus(v === "all" ? null : v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {Object.entries(MENU_PACKAGE_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {allTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className={cn(
                "cursor-pointer text-xs transition-all",
                filterTag === tag.id ? tag.color + " border-2" : "hover:bg-muted",
              )}
              onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
            >
              {tag.label}
              {filterTag === tag.id && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Nazwa pakietu</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Okres</TableHead>
                <TableHead className="text-center">Diety</TableHead>
                <TableHead>Cykl</TableHead>
                <TableHead>Tagi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Koszt śr./dzień</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pkg) => (
                <TableRow key={pkg.id} className={cn(selected.includes(pkg.id) && "bg-primary/5")}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(pkg.id)}
                      onCheckedChange={() => toggleSelect(pkg.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.clientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    {pkg.periodFrom} — {pkg.periodTo}
                  </TableCell>
                  <TableCell className="text-center">{pkg.dietPlans.length}</TableCell>
                  <TableCell>{CYCLE_LABELS[pkg.cycle]}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {pkg.tags.map((tagId) => {
                        const t = getTagDef(tagId);
                        return t ? (
                          <Badge key={tagId} variant="outline" className={cn("text-[10px] border", t.color)}>
                            {t.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </TableCell>
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
                      <Button size="sm" variant="ghost" onClick={() => { setSelected([pkg.id]); handleBulkCopy(); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
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

      {/* Copy dialog */}
      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kopiuj jadłospis{selected.length > 1 ? "y" : ""}</DialogTitle>
            <DialogDescription>
              {selected.length > 1
                ? `Kopiujesz ${selected.length} jadłospisów na nowy okres.`
                : "Skopiuj jadłospis na inny okres lub do innego klienta."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Docelowy klient</Label>
              <Select value={copyClient} onValueChange={setCopyClient}>
                <SelectTrigger><SelectValue placeholder="Ten sam klient" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Ten sam klient</SelectItem>
                  <SelectItem value="4">Szpital Miejski w Nidzicy</SelectItem>
                  <SelectItem value="5">Przedszkole Słoneczko</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nowa data od</Label>
                <Input type="date" value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} />
              </div>
              <div>
                <Label>Nowa data do</Label>
                <Input type="date" value={copyTo} onChange={(e) => setCopyTo(e.target.value)} />
              </div>
            </div>
            {selected.length > 1 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Kopiowane jadłospisy: {selected.map((id) => mockMenuPackages.find((p) => p.id === id)?.name).filter(Boolean).join(", ")}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyOpen(false)}>Anuluj</Button>
            <Button onClick={handleCopyConfirm}>
              <Copy className="h-4 w-4 mr-2" /> Kopiuj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
