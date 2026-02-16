import { useState, useEffect } from "react";
import DietLayout from "@/components/DietLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Ruler } from "lucide-react";
import { toast } from "sonner";
import {
  MeasurementUnit,
  getMeasurementUnits,
  saveMeasurementUnit,
  deleteMeasurementUnit,
} from "@/api/measurementUnits";

const TYPE_LABELS: Record<string, string> = {
  mass: "Masa",
  volume: "Objętość",
  piece: "Sztuka",
};

export default function MeasurementUnitsSettings() {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Partial<MeasurementUnit> | null>(null);

  const load = () => {
    setLoading(true);
    getMeasurementUnits("all")
      .then(setUnits)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditUnit({ symbol: "", name: "", type: "mass", base_unit_symbol: null, to_base_factor: 1, sort_order: units.length + 1, status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (u: MeasurementUnit) => {
    setEditUnit({ ...u });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editUnit?.symbol || !editUnit?.name) {
      toast.error("Symbol i nazwa są wymagane");
      return;
    }
    try {
      await saveMeasurementUnit(editUnit as any);
      toast.success(editUnit.id ? "Jednostka zaktualizowana" : "Jednostka dodana");
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Archiwizować tę jednostkę?")) return;
    try {
      await deleteMeasurementUnit(id);
      toast.success("Jednostka zarchiwizowana");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const baseUnits = units.filter((u) => !u.base_unit_symbol && u.status === "active");

  return (
    <DietLayout pageKey="diet.settings">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Jednostki miary</h1>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Dodaj jednostkę
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Lista jednostek miary z przelicznikami</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Ładowanie…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Symbol</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead className="w-28">Typ</TableHead>
                  <TableHead className="w-32">Jednostka bazowa</TableHead>
                  <TableHead className="w-36 text-right">Przelicznik do bazowej</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((u) => (
                  <TableRow key={u.id} className={u.status === "archived" ? "opacity-50" : ""}>
                    <TableCell className="font-mono font-bold">{u.symbol}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[u.type] || u.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {u.base_unit_symbol || <span className="text-muted-foreground italic">bazowa</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono">{Number(u.to_base_factor)}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "active" ? "default" : "secondary"} className="text-xs">
                        {u.status === "active" ? "Aktywna" : "Archiwum"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {u.status === "active" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {units.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      Brak jednostek — kliknij „Dodaj jednostkę"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* EDIT/ADD DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUnit?.id ? "Edycja jednostki" : "Nowa jednostka"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Symbol</Label>
                <Input
                  value={editUnit?.symbol || ""}
                  onChange={(e) => setEditUnit((p) => p ? { ...p, symbol: e.target.value } : p)}
                  placeholder="np. g"
                />
              </div>
              <div>
                <Label>Nazwa</Label>
                <Input
                  value={editUnit?.name || ""}
                  onChange={(e) => setEditUnit((p) => p ? { ...p, name: e.target.value } : p)}
                  placeholder="np. gram"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Typ</Label>
                <Select
                  value={editUnit?.type || "mass"}
                  onValueChange={(v) => setEditUnit((p) => p ? { ...p, type: v as any } : p)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mass">Masa</SelectItem>
                    <SelectItem value="volume">Objętość</SelectItem>
                    <SelectItem value="piece">Sztuka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jednostka bazowa</Label>
                <Select
                  value={editUnit?.base_unit_symbol || "__none"}
                  onValueChange={(v) => setEditUnit((p) => p ? { ...p, base_unit_symbol: v === "__none" ? null : v } : p)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">— bazowa (sama w sobie) —</SelectItem>
                    {baseUnits.map((bu) => (
                      <SelectItem key={bu.symbol} value={bu.symbol}>
                        {bu.symbol} ({bu.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Przelicznik do bazowej</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={editUnit?.to_base_factor ?? 1}
                  onChange={(e) => setEditUnit((p) => p ? { ...p, to_base_factor: Number(e.target.value) } : p)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Np. 1 kg = 1000 g → przelicznik = 1000
                </p>
              </div>
              <div>
                <Label>Kolejność</Label>
                <Input
                  type="number"
                  value={editUnit?.sort_order ?? 0}
                  onChange={(e) => setEditUnit((p) => p ? { ...p, sort_order: Number(e.target.value) } : p)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSave}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DietLayout>
  );
}
