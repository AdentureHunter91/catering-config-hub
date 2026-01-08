import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { getContract, saveContract } from "@/api/contracts";
import { getClientsList } from "@/api/clients";

import {
  getKitchenPeriods,
  addKitchenPeriod,
  updateKitchenPeriod,
  deleteKitchenPeriod,
} from "@/api/kitchenPeriods";

import { getKitchens, Kitchen } from "@/api/kitchens";

import {
  getContractDepartments,
  updateContractDepartment,
} from "@/api/contractDepartments";

import {
  getContractDiets,
  updateContractDiet,
} from "@/api/contractDiets";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  getContractMealTypes,
  updateContractMealType,
} from "@/api/contractMealTypes";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

import {
  getContractDietMealTypes,
  updateContractDietMealType,
} from "@/api/contractDietMealTypes";

import { toast } from "sonner";


// --- TYPY DANYCH ---

type ContractForm = {
  id: number;
  client_id: string | number;
  contract_number: string;
  start_date: string;
  end_date: string | null;
  contract_value: string | number | null;
  status: "active" | "planned" | "expired";
  contract_beds: number | null;
};

type ClientOption = {
  id: number;
  short_name: string;
  full_name: string;
  total_beds?: number;
};

type KitchenPeriod = {
  id: number;
  contract_id: number;
  kitchen_id: number;
  start_date: string;
  end_date: string | null;
  kitchen_name?: string;
};

type ContractDepartmentRow = {
  client_department_id: number;
  name: string;
  short_name: string;
  custom_name: string | null;
  custom_short_name: string | null;
  is_active: number; // 0/1
};

type ContractDietRow = {
  client_diet_id: number;
  name: string;
  short_name: string;
  custom_name: string | null;
  custom_short_name: string | null;
  is_active: number; // 0/1
};

type ContractConfigProps = {
  isNew?: boolean;
};

type ContractMealTypeRow = {
  client_meal_type_id: number;

  global_name: string;
  global_short: string;
  global_sort: number;

  custom_name: string | null;
  custom_short_name: string | null;
  custom_sort_order: number | null;

  cutoff_time: string;
  cutoff_days_offset: number;

  is_active: number; // 0/1
  copy_from_client_meal_type_id: number | null;
};

// --- TYPY DOT. CEN ---

type PriceColumn = {
  id: string;
  label: string;
  department_ids: number[]; // max 1 element – jeden oddział na kolumnę
};

type PriceRule = {
  id: string;
  name: string;
  mealTypeIds: number[];   // puste = wszystkie posiłki
  dietIds: number[];       // puste = wszystkie diety
  departmentIds: number[]; // puste = wszystkie oddziały
  amount: number;          // rabat/dopłata (może być ujemny)
  valid_from: string | null;
  valid_to: string | null;
};

// --- Typ powiązań dieta - posiłek

type ContractDietMealTypeLink = {
  contract_id: number;
  client_diet_id: number;
  client_meal_type_id: number;
  is_active: number; // 0/1
  // valid_from?: string | null; // future
  // valid_to?: string | null;   // future
};

const ContractConfig = ({ isNew = false }: ContractConfigProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<ContractForm>({
    id: 0,
    client_id: "",
    contract_number: "",
    start_date: "",
    end_date: "",
    contract_value: "",
    status: "active",
    contract_beds: null,
  });

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [kitchenPeriods, setKitchenPeriods] = useState<KitchenPeriod[]>([]);
  const [contractDepartments, setContractDepartments] = useState<
      ContractDepartmentRow[]
  >([]);
  const [contractDiets, setContractDiets] = useState<ContractDietRow[]>([]);
  const [contractMealTypes, setContractMealTypes] = useState<
      ContractMealTypeRow[]
  >([]);
  const [dietMealLinks, setDietMealLinks] = useState<ContractDietMealTypeLink[]>([]);

  const [loading, setLoading] = useState<boolean>(!isNew);

  // --- STANY DOT. CEN ---

  const [priceViewMode, setPriceViewMode] = useState<"basic" | "detailed">(
      "basic"
  );

  const [priceColumns, setPriceColumns] = useState<PriceColumn[]>([]);

  const [pricesLoaded, setPricesLoaded] = useState(false);

  useEffect(() => {
    if (pricesLoaded) return;            // ✅ nie nadpisuj jak już wczytaliśmy z backendu
    if (contractDepartments.length === 0) return;

    const deps = contractDepartments
        .filter(d => d.is_active === 1)
        .map(d => d.client_department_id);

    setPriceColumns([
      {
        id: "col_1",
        label: "Wszystkie oddziały",
        department_ids: deps,
      },
    ]);
  }, [contractDepartments, pricesLoaded]);



  // basePrices[mealTypeId][columnId] = number | ""
  const [basePrices, setBasePrices] = useState<
      Record<number, Record<string, number | "">>
  >({});

  // dietPrices[mealTypeId][dietId][columnId] = number | ""
  const [dietPrices, setDietPrices] = useState<
      Record<number, Record<number, Record<string, number | "">>>
  >({});

  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);

  const loadPrices = async (contractId: number) => {
    const res = await fetch(
        `/Config/api/contracts/prices/get_contract_meal_prices.php?contract_id=${contractId}`,
        { credentials: "include" }
    );
    const json = await res.json();

    if (!json?.success) {
      throw new Error(json?.error || "Nie udało się pobrać cen");
    }

    const data = json.data || {};
    if (data.mode === "detailed" || data.mode === "basic") {
      setPriceViewMode(data.mode);
    }

    if (Array.isArray(data.priceColumns) && data.priceColumns.length) {
      setPriceColumns(data.priceColumns);
    }

    setBasePrices(data.basePrices || {});
    setDietPrices(data.dietPrices || {});
    setPricesLoaded(true);
  };


  // --- POBRANIE LISTY KLIENTÓW ---

  useEffect(() => {
    getClientsList()
        .then((list) => setClients(list ?? []))
        .catch((err) => {
          console.error("Błąd pobierania klientów", err);
          setClients([]);
        });
  }, []);

  // --- TRYB NOWY ---

  useEffect(() => {
    if (isNew) {
      setForm({
        id: 0,
        client_id: "",
        contract_number: "",
        start_date: "",
        end_date: "",
        contract_value: "",
        status: "active",
        contract_beds: null,
      });
      setLoading(false);
    }
  }, [isNew]);

  // --- TRYB EDYCJI ---

  useEffect(() => {
    if (isNew || !id) return;

    setLoading(true);

    Promise.all([
      getContract(Number(id)),
      getKitchens(),
      getKitchenPeriods(Number(id)),
      getContractDepartments(Number(id)),
      getContractDiets(Number(id)),
      getContractMealTypes(Number(id)),
      getContractDietMealTypes(Number(id)), // ⬅️ NOWE
    ])
        .then(
            ([
               contractData,
               kitchensList,
               periodsList,
               depList,
               dietList,
               mealTypeList,
               dietMealMatrix, // ⬅️ NOWE
             ]) => {
              setForm({
                id: contractData.id,
                client_id: contractData.client_id,
                contract_number: contractData.contract_number ?? "",
                start_date: contractData.start_date ?? "",
                end_date: contractData.end_date ?? "",
                contract_value: contractData.contract_value ?? "",
                status:
                    (contractData.status as "active" | "planned" | "expired") ??
                    "active",
                contract_beds: contractData.contract_beds ?? null,
              });

              setKitchens(kitchensList ?? []);
              setKitchenPeriods(periodsList ?? []);
              setContractDepartments(depList ?? []);
              setContractDiets(dietList ?? []);
              setContractMealTypes(mealTypeList.data ?? []);

              setDietMealLinks(dietMealMatrix ?? []); // ⬅️ NOWE
            }
        )
        .catch((err) => {
          console.error("Błąd ładowania szczegółów kontraktu", err);
        })
        .finally(() => setLoading(false));
  }, [id, isNew]);

  useEffect(() => {
    if (isNew) return;
    if (!form.id) return;
    if (pricesLoaded) return;

    loadPrices(form.id).catch((e) => {
      console.error("Błąd pobierania cen", e);
      // nie blokujemy UI, zostaną domyślne kolumny
    });
  }, [form.id, isNew, pricesLoaded]);

  // --- HANDLERY FORMULARZA KONTRAKTU ---

  const handleChange = (field: keyof ContractForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const saved = await saveContract(form);
    if (!form.id && saved?.id) {
      setForm((prev) => ({ ...prev, id: saved.id }));
    }
    navigate("/kontrakty");
  };

  // --- OKRESY OBSŁUGI ---

  const handleAddPeriod = async () => {
    const contractId = form.id;
    if (!contractId || !kitchens.length) return;

    try {
      const baseKitchen = kitchens[0];

      const newPeriod = await addKitchenPeriod({
        contract_id: contractId,
        kitchen_id: baseKitchen.id,
        start_date: form.start_date || new Date().toISOString().slice(0, 10),
        end_date: null,
      });

      setKitchenPeriods((prev) => [...prev, newPeriod]);
    } catch (e) {
      console.error("Błąd dodawania okresu kuchni", e);
    }
  };

  const handlePeriodFieldChange = (
      periodId: number,
      field: "kitchen_id" | "start_date" | "end_date",
      value: any
  ) => {
    setKitchenPeriods((prev) => {
      const updatedList = prev.map((p) =>
          p.id === periodId ? { ...p, [field]: value } : p
      );

      const row = updatedList.find((p) => p.id === periodId);
      if (row) {
        void updateKitchenPeriod({
          id: row.id,
          kitchen_id: row.kitchen_id,
          start_date: row.start_date,
          end_date: row.end_date,
        });
      }

      return updatedList;
    });
  };

  const handleDeletePeriod = async (periodId: number) => {
    try {
      await deleteKitchenPeriod(periodId);
      setKitchenPeriods((prev) => prev.filter((p) => p.id !== periodId));
    } catch (e) {
      console.error("Błąd usuwania okresu kuchni", e);
    }
  };

  const breadcrumbName = isNew
      ? "Nowy kontrakt"
      : form.contract_number || (form.id ? `Kontrakt #${form.id}` : "Kontrakt");

  if (loading) {
    return (
        <Layout pageKey="config.contracts">
          <Breadcrumb
              items={[
                { label: "Konfiguracja systemu" },
                { label: "Kontrakty", href: "/kontrakty" },
                { label: breadcrumbName },
              ]}
          />
          <p className="text-muted-foreground">Ładowanie danych kontraktu…</p>
        </Layout>
    );
  }

  // --- AKTUALIZACJA POLA MEAL TYPE ---

  const updateContractMealTypeField = async (
      mt: ContractMealTypeRow,
      field: keyof ContractMealTypeRow,
      value: any
  ) => {
    const updated = { ...mt, [field]: value };

    setContractMealTypes((prev) =>
        prev.map((x) =>
            x.client_meal_type_id === mt.client_meal_type_id ? updated : x
        )
    );

    await updateContractMealType({
      contract_id: form.id,
      client_meal_type_id: mt.client_meal_type_id,
      cutoff_time: updated.cutoff_time,
      cutoff_days_offset: updated.cutoff_days_offset,
      is_active: updated.is_active,
      copy_from_client_meal_type_id: updated.copy_from_client_meal_type_id,
    });
  };

  // --- LOGIKA CEN: DODANIE KOLUMNY ---

  const handleAddPriceColumn = () => {
    const id = "col_" + Math.random().toString(36).slice(2);
    setPriceColumns((prev) => [
      ...prev,
      {
        id,
        label: "Oddział – wybierz",
        department_ids: [],
      },
    ]);
  };

  // --- LOGIKA CEN: ZMIANA ODDZIAŁU W KOLUMNIE (BEZ NAKŁADANIA) ---

  const handleUpdatePriceColumnDepartment = () => {};


  const handleRemovePriceColumn = (columnId: string) => {
    setPriceColumns((prev) => {
      if (prev.length <= 1) return prev; // zawsze musi zostać minimum jedna kolumna
      return prev.filter((c) => c.id !== columnId);
    });
  };

  // --- LOGIKA CEN: ZAPIS (na razie tylko console.log) ---

  const handleSavePrices = async () => {
    if (!form.id) {
      toast.error("Najpierw zapisz kontrakt (żeby miał ID).");
      return;
    }

    if (uncoveredDepartments.length > 0) {
      toast.error("Część oddziałów nie ma przypisanej kolumny cenowej.");
      return;
    }

    const payload = {
      contract_id: form.id,
      mode: priceViewMode,
      priceColumns,
      basePrices,
      dietPrices,
    };

    try {
      const res = await fetch(
          `/Config/api/contracts/prices/save_contract_meal_prices.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
      );

      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.error || "Nie udało się zapisać cen");
      }

      toast.success("Ceny zapisane");
      // odśwież z backendu (żeby mieć spójny stan)
      setPricesLoaded(false);
      await loadPrices(form.id);

    } catch (e: any) {
      console.error("Błąd zapisu cen", e);
      toast.error(e?.message || "Błąd zapisu cen");
    }
  };


  // --- TOGGLE DEPARTMENT ---
  const toggleDepartment = (columnId: string, deptId: number) => {
    setPriceColumns((prev) => {
      let cols = [...prev];

      // 1. usuń dept ze wszystkich kolumn
      cols = cols.map((c) => ({
        ...c,
        department_ids: c.department_ids.filter((id) => id !== deptId),
      }));

      // 2. dodaj dept tylko do tej właściwej kolumny
      cols = cols.map((c) =>
          c.id === columnId
              ? { ...c, department_ids: [...c.department_ids, deptId] }
              : c
      );

      return cols;
    });
  };


  // --- ZAPIS POJEDYNCZEJ REGUŁY (placeholder) ---

  const handleSavePriceRule = (rule: PriceRule) => {
    console.log("Zapis reguły cenowej – TODO backend", rule);
  };

  // --- POMOCNICZE: sprawdzenie czy są niewycenione oddziały ---

  const uncoveredDepartments = (() => {
    const activeIds = contractDepartments
        .filter((d) => d.is_active === 1)
        .map((d) => d.client_department_id);
    const covered = priceColumns.flatMap((c) => c.department_ids);
    return activeIds.filter((id) => !covered.includes(id));
  })();

  const activeDiets = contractDiets; // na razie wszystkie

  // wszystkie aktywne oddziały
  const activeDepartments = contractDepartments
      .filter((d) => d.is_active === 1)
      .map((d) => d.client_department_id);

  // --- MATRYCA DIETA × POSIŁEK ---

  const isMealEnabledForDiet = (dietId: number, mealTypeId: number): boolean => {
    const link = dietMealLinks.find(
        (l) =>
            l.client_diet_id === dietId &&
            l.client_meal_type_id === mealTypeId
    );
    // jeśli backend nie zwrócił rekordu – traktujemy jak ON (domyślnie wszystko włączone)
    if (!link) return false;
    return link.is_active === 1;
  };

  const handleToggleDietMeal = async (
      dietId: number,
      mealTypeId: number,
      checked: boolean
  ) => {
    if (!form.id) return;

    const newVal = checked ? 1 : 0;

    // optymistyczny update w stanie
    setDietMealLinks((prev) => {
      const exists = prev.find(
          (l) =>
              l.client_diet_id === dietId &&
              l.client_meal_type_id === mealTypeId
      );

      if (exists) {
        return prev.map((l) =>
            l.client_diet_id === dietId &&
            l.client_meal_type_id === mealTypeId
                ? { ...l, is_active: newVal }
                : l
        );
      }

      // brak rekordu -> dodajemy
      return [
        ...prev,
        {
          contract_id: form.id,
          client_diet_id: dietId,
          client_meal_type_id: mealTypeId,
          is_active: newVal,
        },
      ];
    });

    try {
      await updateContractDietMealType({
        contract_id: form.id,
        client_diet_id: dietId,
        client_meal_type_id: mealTypeId,
        is_active: newVal,
      });
    } catch (e) {
      console.error("Błąd zapisu powiązania dieta–posiłek", e);
      // TODO: opcjonalnie rollback, toast
    }
  };


  return (
      <Layout pageKey="config.contracts">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Kontrakty", href: "/kontrakty" },
              { label: breadcrumbName },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {isNew ? "Nowy kontrakt" : "Konfiguracja Kontraktu"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Szczegółowa konfiguracja kontraktu i parametrów obsługi
          </p>
        </div>

        {/* A – Dane kontraktu */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-foreground">
              Dane kontraktu
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract-number">Numer kontraktu</Label>
                <Input
                    id="contract-number"
                    value={form.contract_number}
                    onChange={(e) =>
                        handleChange("contract_number", e.target.value)
                    }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Klient</Label>
                <Select
                    value={form.client_id ? String(form.client_id) : ""}
                    onValueChange={(val) => handleChange("client_id", Number(val))}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Wybierz klienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.short_name} – {c.full_name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Obowiązuje od</Label>
                <Input
                    id="date-from"
                    type="date"
                    value={form.start_date ?? ""}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Obowiązuje do</Label>
                <Input
                    id="date-to"
                    type="date"
                    value={form.end_date ?? ""}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={form.status}
                    onValueChange={(val) =>
                        handleChange(
                            "status",
                            val as "active" | "planned" | "expired"
                        )
                    }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="planned">Planowany</SelectItem>
                    <SelectItem value="expired">Wygasły</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-value">Wartość kontraktu (PLN)</Label>
                <Input
                    id="contract-value"
                    type="number"
                    value={form.contract_value ?? ""}
                    onChange={(e) =>
                        handleChange("contract_value", e.target.value)
                    }
                />
              </div>

              {/* Liczba miejsc wg kontraktu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contract-beds">
                    Liczba miejsc (w kontrakcie)
                  </Label>

                  {form.client_id && (
                      <Badge variant="secondary" className="text-xs">
                        wg konfiguracji klienta:{" "}
                        {
                            clients.find((c) => c.id === Number(form.client_id))
                                ?.total_beds ?? "—"
                        }
                      </Badge>
                  )}
                </div>

                <Input
                    id="contract-beds"
                    type="number"
                    placeholder="np. 180"
                    value={form.contract_beds ?? ""}
                    onChange={(e) =>
                        handleChange(
                            "contract_beds",
                            e.target.value ? Number(e.target.value) : null
                        )
                    }
                />
              </div>
            </div>

            <div className="mt-6">
              <Button className="gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Zapisz
              </Button>
            </div>
          </div>
        </Card>

        {/* B – Okresy obsługi przez kuchnie */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Okresy obsługi przez kuchnie
            </h2>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAddPeriod}
                disabled={!form.id || kitchens.length === 0}
            >
              <Plus className="h-4 w-4" />
              Dodaj okres obsługi
            </Button>
          </div>
          <div className="overflow-x-auto">
            {kitchenPeriods.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Brak zdefiniowanych okresów obsługi dla tego kontraktu.
                </p>
            ) : (
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Kuchnia
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Data rozpoczęcia
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Data zakończenia
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                      Akcje
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y">
                  {kitchenPeriods.map((period) => (
                      <tr
                          key={period.id}
                          className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Select
                              value={String(period.kitchen_id)}
                              onValueChange={(val) =>
                                  handlePeriodFieldChange(
                                      period.id,
                                      "kitchen_id",
                                      Number(val)
                                  )
                              }
                          >
                            <SelectTrigger className="max-w-[250px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {kitchens.map((k) => (
                                  <SelectItem key={k.id} value={String(k.id)}>
                                    {k.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                              type="date"
                              value={period.start_date ?? ""}
                              className="max-w-[160px]"
                              onChange={(e) =>
                                  handlePeriodFieldChange(
                                      period.id,
                                      "start_date",
                                      e.target.value
                                  )
                              }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                              type="date"
                              value={period.end_date ?? ""}
                              placeholder="Brak daty końcowej"
                              className="max-w-[160px]"
                              onChange={(e) =>
                                  handlePeriodFieldChange(
                                      period.id,
                                      "end_date",
                                      e.target.value || null
                                  )
                              }
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive"
                              onClick={() => handleDeletePeriod(period.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Usuń
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
            )}
          </div>
        </Card>

        {/* C – Oddziały w ramach kontraktu */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Oddziały w ramach kontraktu
              </h2>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help select-none">
                      ?
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Lista oddziałów pochodzi z konfiguracji klienta.
                    <br />
                    Tutaj wybierasz, które oddziały obowiązują w tym kontrakcie.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Oddział
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Skrót
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Aktywny w kontrakcie
                </th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {contractDepartments.map((dept) => (
                  <tr
                      key={dept.client_department_id}
                      className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      {dept.name}
                      {dept.custom_name ? ` (${dept.custom_name})` : ""}
                    </td>

                    <td className="px-6 py-4">
                      {dept.custom_short_name || dept.short_name}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Switch
                          checked={dept.is_active === 1}
                          onCheckedChange={async (val) => {
                            const newVal = val ? 1 : 0;
                            try {
                              await updateContractDepartment({
                                contract_id: form.id,
                                client_department_id: dept.client_department_id,
                                is_active: newVal,
                              });

                              setContractDepartments((prev) =>
                                  prev.map((d) =>
                                      d.client_department_id ===
                                      dept.client_department_id
                                          ? { ...d, is_active: newVal }
                                          : d
                                  )
                              );
                            } catch (e) {
                              console.error(
                                  "Błąd zapisu oddziału w kontrakcie",
                                  e
                              );
                            }
                          }}
                      />
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* D – Diety w ramach kontraktu */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Diety w ramach kontraktu
              </h2>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help select-none">
                      ?
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Lista diet pochodzi z konfiguracji klienta.
                    <br />
                    Tutaj wybierasz, które diety są aktywne w tym kontrakcie.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Dieta
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Skrót
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Aktywna
                </th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {contractDiets.map((diet) => {
                const dietId =
                    (diet as any).client_diet_id ??
                    (diet as any).clientDietId ??
                    (diet as any).id ??
                    0;

                return (
                    <tr
                        key={dietId}
                        className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {diet.custom_name || diet.name}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {diet.custom_short_name || diet.short_name}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Switch
                            checked={diet.is_active === 1}
                            onCheckedChange={async (val) => {
                              const newVal = val ? 1 : 0;

                              try {
                                await updateContractDiet({
                                  contract_id: form.id,
                                  client_diet_id: dietId,
                                  is_active: newVal,
                                });

                                setContractDiets((prev) =>
                                    prev.map((d) =>
                                        ((d as any).client_diet_id ?? (d as any).id) ===
                                        dietId
                                            ? { ...d, is_active: newVal }
                                            : d
                                    )
                                );
                              } catch (e) {
                                console.error(
                                    "Błąd zapisu diety w kontrakcie",
                                    e
                                );
                              }
                            }}
                        />
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* E – Posiłki (meal types) */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-foreground">
              Posiłki (meal types)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Nazwa
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Short
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Sort
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Cutoff
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Offset
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Copy from
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium">
                  Aktywny
                </th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {contractMealTypes.map((mt) => (
                  <tr key={mt.client_meal_type_id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      {mt.custom_name ?? mt.global_name}
                    </td>

                    <td className="px-6 py-4">
                      {mt.custom_short_name ?? mt.global_short}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {mt.custom_sort_order ?? mt.global_sort}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Input
                          className="max-w-[120px] mx-auto"
                          type="time"
                          value={mt.cutoff_time ?? "00:00"}
                          onChange={(e) =>
                              updateContractMealTypeField(
                                  mt,
                                  "cutoff_time",
                                  e.target.value
                              )
                          }
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Select
                          value={String(mt.cutoff_days_offset)}
                          onValueChange={(v) =>
                              updateContractMealTypeField(
                                  mt,
                                  "cutoff_days_offset",
                                  Number(v)
                              )
                          }
                      >
                        <SelectTrigger className="max-w-[80px] mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Select
                          value={
                            mt.copy_from_client_meal_type_id
                                ? String(mt.copy_from_client_meal_type_id)
                                : "none"
                          }
                          onValueChange={(v) =>
                              updateContractMealTypeField(
                                  mt,
                                  "copy_from_client_meal_type_id",
                                  v === "none" ? null : Number(v)
                              )
                          }
                      >
                        <SelectTrigger className="max-w-[180px] mx-auto">
                          <SelectValue placeholder="Brak" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="none">Brak</SelectItem>
                          {contractMealTypes
                              .filter(
                                  (x) =>
                                      x.client_meal_type_id !==
                                      mt.client_meal_type_id
                              )
                              .map((x) => (
                                  <SelectItem
                                      key={x.client_meal_type_id}
                                      value={String(x.client_meal_type_id)}
                                  >
                                    {x.custom_name ?? x.global_name}
                                  </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Switch
                          checked={mt.is_active === 1}
                          onCheckedChange={(checked) =>
                              updateContractMealTypeField(
                                  mt,
                                  "is_active",
                                  checked ? 1 : 0
                              )
                          }
                      />
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* E.1 – Posiłki dostępne w dietach (matryca) */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Posiłki w ramach diet
              </h2>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help select-none">
                      ?
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Określasz, które posiłki są dostępne
                    dla poszczególnych diet w tym kontrakcie.
                    <br />
                    Tylko te kombinacje będą dostępne do wprowadzania
                    danych w Portalu Klienta i dalszych modułach.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="overflow-x-auto">
            {contractDiets.filter((d) => d.is_active === 1).length === 0 ||
            contractMealTypes.filter((m) => m.is_active === 1).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Brak aktywnych diet lub posiłków w kontrakcie. Najpierw włącz
                  co najmniej jedną dietę i jeden posiłek.
                </p>
            ) : (
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Dieta
                    </th>

                    {contractMealTypes
                        .filter((mt) => mt.is_active === 1)
                        .sort(
                            (a, b) =>
                                (a.custom_sort_order ?? a.global_sort) -
                                (b.custom_sort_order ?? b.global_sort)
                        )
                        .map((mt) => (
                            <th
                                key={mt.client_meal_type_id}
                                className="px-6 py-3 text-center text-sm font-medium text-foreground"
                            >
                              {mt.custom_name ?? mt.global_name}
                            </th>
                        ))}
                  </tr>
                  </thead>

                  <tbody className="divide-y">
                  {contractDiets
                      .filter((d) => d.is_active === 1)
                      .map((diet) => {
                        const dietId =
                            (diet as any).client_diet_id ??
                            (diet as any).clientDietId ??
                            (diet as any).id ??
                            0;

                        return (
                            <tr
                                key={dietId}
                                className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium">
                                {diet.custom_name || diet.name}
                                {diet.custom_short_name || diet.short_name ? (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                (
                                      {diet.custom_short_name || diet.short_name}
                                      )
                              </span>
                                ) : null}
                              </td>

                              {contractMealTypes
                                  .filter((mt) => mt.is_active === 1)
                                  .sort(
                                      (a, b) =>
                                          (a.custom_sort_order ?? a.global_sort) -
                                          (b.custom_sort_order ?? b.global_sort)
                                  )
                                  .map((mt) => (
                                      <td
                                          key={mt.client_meal_type_id}
                                          className="px-6 py-4 text-center"
                                      >
                                        <Switch
                                            checked={isMealEnabledForDiet(
                                                dietId,
                                                mt.client_meal_type_id
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleToggleDietMeal(
                                                    dietId,
                                                    mt.client_meal_type_id,
                                                    checked
                                                )
                                            }
                                        />
                                      </td>
                                  ))}
                            </tr>
                        );
                      })}
                  </tbody>
                </table>
            )}
          </div>
        </Card>


        {/* F – Ceny posiłków */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Ceny posiłków
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* przełącznik rozliczania */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Rozliczanie podstawowe</span>

              <Switch
                  checked={priceViewMode === "detailed"}
                  onCheckedChange={(val) =>
                      setPriceViewMode(val ? "detailed" : "basic")
                  }
              />

              <span className="text-sm font-medium">
              Rozliczanie szczegółowe (per dieta)
            </span>
            </div>

            {uncoveredDepartments.length > 0 && (
                <p className="text-xs text-amber-600">
                  Uwaga: część aktywnych oddziałów nie ma przypisanej kolumny
                  cenowej.
                </p>
            )}

            {/* kolumny cen */}
            <div className="flex items-center justify-between mt-4 mb-2">
              <h3 className="font-medium text-sm">Kolumny cen</h3>

              <Button variant="outline" size="sm" onClick={handleAddPriceColumn}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj kolumnę
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    Posiłek / Dieta
                  </th>

                  {priceColumns.map((col) => {
                    const usedInOther = priceColumns
                        .filter((c) => c.id !== col.id)
                        .flatMap((c) => c.department_ids);

                    return (
                        <th
                            key={col.id}
                            className="px-4 py-3 text-center font-medium min-w-[190px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-foreground/70">
                            {col.department_ids.length === 0
                                ? "Brak"
                                : col.department_ids.length === activeDepartments.length
                                    ? "Wszystkie oddziały"
                                    : contractDepartments
                                        .filter((d) => col.department_ids.includes(d.client_department_id))
                                        .map((d) => d.name)
                                        .join(", ")}
                          </span>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-[160px] justify-between"
                                >
                                  {col.department_ids.length === activeDepartments.length
                                      ? "Wszystkie oddziały"
                                      : col.department_ids.length === 0
                                          ? "Brak"
                                          : `${col.department_ids.length} wybrane`}

                                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent className="p-0 w-[220px]">
                                <Command>
                                  <CommandList>
                                    <CommandGroup>
                                      {contractDepartments
                                          .filter((d) => d.is_active === 1)
                                          .map((d) => {
                                            const id = d.client_department_id;
                                            const checked = col.department_ids.includes(id);

                                            return (
                                                <CommandItem
                                                    key={id}
                                                    onSelect={() => toggleDepartment(col.id, id)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                  <Checkbox checked={checked} />
                                                  {d.name}
                                                </CommandItem>
                                            );
                                          })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>



                            {priceColumns.length > 1 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive h-6 px-2 text-xs"
                                    onClick={() => handleRemovePriceColumn(col.id)}
                                >
                                  Usuń
                                </Button>
                            )}
                          </div>
                        </th>
                    );
                  })}
                </tr>
                </thead>

                {/* PODSTAWOWY */}
                {priceViewMode === "basic" && (
                    <tbody className="divide-y">
                    {contractMealTypes.map((mt) => (
                        <tr
                            key={mt.client_meal_type_id}
                            className="hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 font-medium">
                            {mt.custom_name ?? mt.global_name}
                          </td>

                          {priceColumns.map((col) => {
                            const price =
                                basePrices?.[mt.client_meal_type_id]?.[col.id] ?? "";

                            return (
                                <td
                                    key={col.id}
                                    className="px-4 py-3 text-center"
                                >
                                  <Input
                                      type="number"
                                      step="0.01"
                                      className="w-[120px] mx-auto"
                                      value={price}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setBasePrices((prev) => ({
                                          ...prev,
                                          [mt.client_meal_type_id]: {
                                            ...(prev[mt.client_meal_type_id] || {}),
                                            [col.id]:
                                                val === "" ? "" : Number(val),
                                          },
                                        }));
                                      }}
                                  />
                                </td>
                            );
                          })}
                        </tr>
                    ))}
                    </tbody>
                )}

                {/* SZCZEGÓŁOWY (DIETY) */}
                {priceViewMode === "detailed" && (
                    <tbody className="divide-y">
                    {contractMealTypes.map((mt) =>
                        activeDiets
                            .filter((d) => d.is_active === 1)
                            .map((diet) => {
                              const dietId = diet.client_diet_id;

                              return (
                                  <tr
                                      key={mt.client_meal_type_id + "_" + dietId}
                                      className="hover:bg-muted/30"
                                  >
                                    <td className="px-4 py-3 font-medium">
                                      {mt.custom_name ?? mt.global_name}
                                      {" • "}
                                      <span className="text-muted-foreground">
                                {diet.custom_name ?? diet.name}
                              </span>
                                    </td>

                                    {priceColumns.map((col) => {
                                      const price =
                                          dietPrices?.[mt.client_meal_type_id]?.[
                                              dietId
                                              ]?.[col.id] ?? "";

                                      return (
                                          <td
                                              key={col.id}
                                              className="px-4 py-3 text-center"
                                          >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="w-[120px] mx-auto"
                                                value={price}
                                                onChange={(e) => {
                                                  const val = e.target.value;

                                                  setDietPrices((prev) => ({
                                                    ...prev,
                                                    [mt.client_meal_type_id]: {
                                                      ...(prev[mt.client_meal_type_id] ||
                                                          {}),
                                                      [dietId]: {
                                                        ...(prev[mt.client_meal_type_id]?.[
                                                            dietId
                                                            ] || {}),
                                                        [col.id]:
                                                            val === ""
                                                                ? ""
                                                                : Number(val),
                                                      },
                                                    },
                                                  }));
                                                }}
                                            />
                                          </td>
                                      );
                                    })}
                                  </tr>
                              );
                            })
                    )}
                    </tbody>
                )}
              </table>
            </div>

            {/* ZAPISZ CENY */}
            <div className="flex justify-end mt-6">
              <Button className="gap-2" onClick={handleSavePrices}>
                <Save className="h-4 w-4" />
                Zapisz ceny
              </Button>
            </div>
          </div>
        </Card>

        {/* G – Reguły cenowe */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Reguły cenowe
            </h2>

            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const id = "rule_" + Math.random().toString(36).slice(2);
                  setPriceRules((prev) => [
                    ...prev,
                    {
                      id,
                      name: "Nowa reguła",
                      mealTypeIds: [],
                      dietIds: [],
                      departmentIds: [],
                      amount: 0,
                      valid_from: null,
                      valid_to: null,
                    },
                  ]);
                }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Dodaj regułę
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {priceRules.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Brak zdefiniowanych reguł cenowych.
                </p>
            )}

            {priceRules.map((rule) => (
                <Card key={rule.id} className="p-4 border bg-muted/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="w-full space-y-3">
                      <Input
                          value={rule.name}
                          className="font-medium"
                          onChange={(e) =>
                              setPriceRules((prev) =>
                                  prev.map((r) =>
                                      r.id === rule.id
                                          ? { ...r, name: e.target.value }
                                          : r
                                  )
                              )
                          }
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Posiłki */}
                        <div>
                          <Label className="text-sm">Posiłek</Label>
                          <Select
                              value={
                                rule.mealTypeIds.length
                                    ? String(rule.mealTypeIds[0])
                                    : "all"
                              }
                              onValueChange={(v) =>
                                  setPriceRules((prev) =>
                                      prev.map((r) =>
                                          r.id === rule.id
                                              ? {
                                                ...r,
                                                mealTypeIds:
                                                    v === "all" ? [] : [Number(v)],
                                              }
                                              : r
                                      )
                                  )
                              }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wszystkie posiłki" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Wszystkie</SelectItem>
                              {contractMealTypes.map((mt) => (
                                  <SelectItem
                                      key={mt.client_meal_type_id}
                                      value={String(mt.client_meal_type_id)}
                                  >
                                    {mt.custom_name ?? mt.global_name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Diety */}
                        <div>
                          <Label className="text-sm">Dieta</Label>
                          <Select
                              value={
                                rule.dietIds.length
                                    ? String(rule.dietIds[0])
                                    : "all"
                              }
                              onValueChange={(v) =>
                                  setPriceRules((prev) =>
                                      prev.map((r) =>
                                          r.id === rule.id
                                              ? {
                                                ...r,
                                                dietIds:
                                                    v === "all" ? [] : [Number(v)],
                                              }
                                              : r
                                      )
                                  )
                              }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wszystkie diety" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Wszystkie</SelectItem>
                              {contractDiets.map((d) => (
                                  <SelectItem
                                      key={
                                          (d as any).client_diet_id ?? (d as any).id
                                      }
                                      value={String(
                                          (d as any).client_diet_id ?? (d as any).id
                                      )}
                                  >
                                    {d.custom_name ?? d.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Oddziały */}
                        <div>
                          <Label className="text-sm">Oddział</Label>
                          <Select
                              value={
                                rule.departmentIds.length
                                    ? String(rule.departmentIds[0])
                                    : "all"
                              }
                              onValueChange={(v) =>
                                  setPriceRules((prev) =>
                                      prev.map((r) =>
                                          r.id === rule.id
                                              ? {
                                                ...r,
                                                departmentIds:
                                                    v === "all" ? [] : [Number(v)],
                                              }
                                              : r
                                      )
                                  )
                              }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wszystkie oddziały" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Wszystkie</SelectItem>
                              {contractDepartments
                                  .filter((d) => d.is_active === 1)
                                  .map((d) => (
                                      <SelectItem
                                          key={d.client_department_id}
                                          value={String(d.client_department_id)}
                                      >
                                        {d.name}
                                      </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Label className="text-sm">
                          Kwota (rabat/dopłata) [PLN]
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            className="w-[180px] mt-1"
                            value={rule.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPriceRules((prev) =>
                                  prev.map((r) =>
                                      r.id === rule.id
                                          ? {
                                            ...r,
                                            amount:
                                                val === "" ? 0 : Number(val),
                                          }
                                          : r
                                  )
                              );
                            }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-sm">Obowiązuje od</Label>
                          <Input
                              type="date"
                              className="mt-1"
                              value={rule.valid_from ?? ""}
                              onChange={(e) => {
                                const val = e.target.value || null;
                                setPriceRules((prev) =>
                                    prev.map((r) =>
                                        r.id === rule.id
                                            ? { ...r, valid_from: val }
                                            : r
                                    )
                                );
                              }}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Obowiązuje do</Label>
                          <Input
                              type="date"
                              className="mt-1"
                              value={rule.valid_to ?? ""}
                              onChange={(e) => {
                                const val = e.target.value || null;
                                setPriceRules((prev) =>
                                    prev.map((r) =>
                                        r.id === rule.id
                                            ? { ...r, valid_to: val }
                                            : r
                                    )
                                );
                              }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSavePriceRule(rule)}
                      >
                        <Save className="h-4 w-4" />
                        Zapisz regułę
                      </Button>

                      <Button
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                              setPriceRules((prev) =>
                                  prev.filter((r) => r.id !== rule.id)
                              )
                          }
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
            ))}
          </div>
        </Card>
      </Layout>
  );
};

export default ContractConfig;
