import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
  ChefHat,
  Users,
  TrendingUp,
  CheckCircle,
  Plus,
  Download,
} from "lucide-react";

import { getKitchenAll, saveKitchenAll } from "@/api/kitchensAll";

const KitchenConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = !id || id === "new" || id === "nowa";
  const numericId = !isNew ? Number(id) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===== STANY (jeden payload do save_all.php) =====
  const [kitchen, setKitchen] = useState({
    id: null as number | null,
    name: "",
    city: "",
    address: "",
    nip: "",
  });

  const [settings, setSettings] = useState({
    located_in_hospital: 0,
    max_daily_patient_days: null as number | null,
    max_daily_meals: null as number | null,
    number_of_shifts: 1,
    planned_employees: null as number | null,
    work_start: null as string | null,
    work_end: null as string | null,
    works_weekends: 0,
    notes: "",
  });

  const [quality, setQuality] = useState({
    min_in_process_checks: 0,
    min_final_checks: 0,
    audit_5s_frequency_days: 30,
  });

  const [targets, setTargets] = useState<
      Array<{
        id?: number;
        year: number;
        month: number;
        target_meals_per_rbh: number | null;
        target_rbh: number | null;
        target_daily_meals: number | null;
      }>
  >([]);

  // ===================== LOAD =======================
  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

      getKitchenAll(Number(id))
          .then((data) => {
              setKitchen({
                  ...data.kitchen,
                  id: Number(id), // ⬅️ KLUCZOWA LINIA
              });

              setSettings(data.settings || settings);
              setQuality(data.quality || quality);
              setTargets(data.targets || []);
          })
        .catch((e) => {
          console.error(e);
          setError(e.message);
        })
        .finally(() => setLoading(false));
  }, [id]);

  // Create payload
  const buildPayload = () => ({
    kitchen,
    settings: { ...settings, kitchen_id: kitchen.id },
    quality: { ...quality, kitchen_id: kitchen.id },
    targets: targets.map((t) => ({ ...t, kitchen_id: kitchen.id })),
  });

  // ===================== SAVE ========================
  const autoSave = useCallback(async () => {
    if (!kitchen.name || !kitchen.city || !kitchen.address || !kitchen.nip) return;

    try {
      setSaving(true);

      const result = await saveKitchenAll(buildPayload());

      if (!kitchen.id && result.id) {
        navigate(`/kuchnie/${result.id}`, { replace: true });
      }

      setKitchen((prev) => ({ ...prev, id: result.id }));
      setLastSaved(new Date().toLocaleTimeString("pl-PL"));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [kitchen, settings, quality, targets]);

  const saveOnBlur = () => {
    void autoSave();
  };

  // ===================== RENDER =======================
  if (loading) {
    return (
        <Layout pageKey="config.kitchens">
          <p className="p-6">Ładowanie...</p>
        </Layout>
    );
  }

  return (
      <Layout pageKey="config.kitchens">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Kuchnie" },
              { label: kitchen.name || "Nowa kuchnia" },
            ]}
        />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Konfiguracja kuchni lokalnej
            </h1>
            {saving && (
                <p className="text-xs text-muted-foreground">Zapisywanie…</p>
            )}
            {lastSaved && (
                <p className="text-xs text-muted-foreground">
                  Ostatni zapis: {lastSaved}
                </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Badge className="bg-success text-success-foreground text-base px-4 py-2">
            Status: Aktywna
          </Badge>
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <StatCard icon={<ChefHat className="h-4 w-4" />} label="Kontrakty" value={5} />
          <StatCard icon={<Users className="h-4 w-4" />} label="Pracownicy" value={settings.planned_employees ?? 0} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Śr. posiłki/dzień" value={120} />
          <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Jakość" value="98%" />
        </div>

        {/* ==================== A: Dane kuchni ==================== */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Dane kuchni</h2>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div>
              <Label>Nazwa</Label>
              <Input
                  value={kitchen.name}
                  onChange={(e) => setKitchen({ ...kitchen, name: e.target.value })}
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Miasto</Label>
              <Input
                  value={kitchen.city}
                  onChange={(e) => setKitchen({ ...kitchen, city: e.target.value })}
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Adres</Label>
              <Input
                  value={kitchen.address}
                  onChange={(e) => setKitchen({ ...kitchen, address: e.target.value })}
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>NIP</Label>
              <Input
                  value={kitchen.nip}
                  onChange={(e) => setKitchen({ ...kitchen, nip: e.target.value })}
                  onBlur={saveOnBlur}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Switch
                  checked={settings.located_in_hospital === 1}
                  onCheckedChange={(v) =>
                      setSettings({ ...settings, located_in_hospital: v ? 1 : 0 })
                  }
                  onBlur={saveOnBlur}
              />
              <Label>Czy na terenie szpitala?</Label>
            </div>

            <div className="md:col-span-2">
              <Label>Notatki</Label>
              <Textarea
                  value={settings.notes}
                  onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
                  onBlur={saveOnBlur}
              />
            </div>
          </div>
        </Card>

        {/* ==================== B: Parametry operacyjne ==================== */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Parametry operacyjne</h2>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-3">
            <div>
              <Label>Maks. osobodni</Label>
              <Input
                  type="number"
                  value={settings.max_daily_patient_days ?? ""}
                  onChange={(e) =>
                      setSettings({
                        ...settings,
                        max_daily_patient_days: e.target.value ? Number(e.target.value) : null,
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Maks. posiłków dziennie</Label>
              <Input
                  type="number"
                  value={settings.max_daily_meals ?? ""}
                  onChange={(e) =>
                      setSettings({
                        ...settings,
                        max_daily_meals: e.target.value ? Number(e.target.value) : null,
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Liczba zmian</Label>
              <Input
                  type="number"
                  value={settings.number_of_shifts}
                  onChange={(e) =>
                      setSettings({
                        ...settings,
                        number_of_shifts: Number(e.target.value),
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Liczba pracowników</Label>
              <Input
                  type="number"
                  value={settings.planned_employees ?? ""}
                  onChange={(e) =>
                      setSettings({
                        ...settings,
                        planned_employees: e.target.value ? Number(e.target.value) : null,
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Praca od</Label>
              <Input
                  type="time"
                  value={settings.work_start ?? ""}
                  onChange={(e) =>
                      setSettings({ ...settings, work_start: e.target.value })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Praca do</Label>
              <Input
                  type="time"
                  value={settings.work_end ?? ""}
                  onChange={(e) =>
                      setSettings({ ...settings, work_end: e.target.value })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Switch
                  checked={settings.works_weekends === 1}
                  onCheckedChange={(v) =>
                      setSettings({ ...settings, works_weekends: v ? 1 : 0 })
                  }
                  onBlur={saveOnBlur}
              />
              <Label>Czy działa w weekendy?</Label>
            </div>
          </div>
        </Card>

        {/* ==================== C: Cele miesięczne ==================== */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cele miesięczne</h2>

            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    setTargets((prev) => [
                      ...prev,
                      {
                        year: 2025,
                        month: 1,
                        target_daily_meals: null,
                        target_rbh: null,
                        target_meals_per_rbh: null,
                      },
                    ])
                }
            >
              <Plus className="h-4 w-4" /> Dodaj miesiąc
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3">Rok</th>
                <th className="px-6 py-3">Miesiąc</th>
                <th className="px-6 py-3 text-center">Meals/rbh</th>
                <th className="px-6 py-3 text-center">RBH</th>
                <th className="px-6 py-3 text-center">Daily meals</th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {targets.map((t, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <Input
                          type="number"
                          value={t.year}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setTargets((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, year: v } : x))
                            );
                          }}
                          onBlur={saveOnBlur}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <Input
                          type="number"
                          value={t.month}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setTargets((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, month: v } : x))
                            );
                          }}
                          onBlur={saveOnBlur}
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Input
                          type="number"
                          value={t.target_meals_per_rbh ?? ""}
                          onChange={(e) => {
                            const v = e.target.value
                                ? Number(e.target.value)
                                : null;
                            setTargets((prev) =>
                                prev.map((x, i) =>
                                    i === idx ? { ...x, target_meals_per_rbh: v } : x
                                )
                            );
                          }}
                          onBlur={saveOnBlur}
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Input
                          type="number"
                          value={t.target_rbh ?? ""}
                          onChange={(e) => {
                            const v = e.target.value
                                ? Number(e.target.value)
                                : null;
                            setTargets((prev) =>
                                prev.map((x, i) =>
                                    i === idx ? { ...x, target_rbh: v } : x
                                )
                            );
                          }}
                          onBlur={saveOnBlur}
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Input
                          type="number"
                          value={t.target_daily_meals ?? ""}
                          onChange={(e) => {
                            const v = e.target.value
                                ? Number(e.target.value)
                                : null;
                            setTargets((prev) =>
                                prev.map((x, i) =>
                                    i === idx ? { ...x, target_daily_meals: v } : x
                                )
                            );
                          }}
                          onBlur={saveOnBlur}
                      />
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== D: Jakość ==================== */}
        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Jakość (kontrole + 5S)</h2>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-3">
            <div>
              <Label>K. wewnątrz procesu (minimum dziennie)</Label>
              <Input
                  type="number"
                  value={quality.min_in_process_checks}
                  onChange={(e) =>
                      setQuality({
                        ...quality,
                        min_in_process_checks: Number(e.target.value),
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>K. końcowe (minimum dziennie)</Label>
              <Input
                  type="number"
                  value={quality.min_final_checks}
                  onChange={(e) =>
                      setQuality({
                        ...quality,
                        min_final_checks: Number(e.target.value),
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>

            <div>
              <Label>Audyt 5S – częstotliwość (dni)</Label>
              <Input
                  type="number"
                  value={quality.audit_5s_frequency_days}
                  onChange={(e) =>
                      setQuality({
                        ...quality,
                        audit_5s_frequency_days: Number(e.target.value),
                      })
                  }
                  onBlur={saveOnBlur}
              />
            </div>
          </div>
        </Card>
      </Layout>
  );
};

export default KitchenConfig;
