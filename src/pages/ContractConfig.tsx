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

import { getContractMealTypes, updateContractMealType } from "@/api/contractMealTypes";

// tymczasowy mock dla sekcji meal types – do podpięcia pod bazę w 2 kroku
const mealTypes = [
  { name: "Śniadanie", shortName: "ŚN", sortOrder: 1, cutoff: "06:00", offset: "0", active: true },
  { name: "II Śniadanie", shortName: "IIŚ", sortOrder: 2, cutoff: "09:00", offset: "0", active: true },
  { name: "Obiad", shortName: "OB", sortOrder: 3, cutoff: "11:00", offset: "-1", active: true },
  { name: "Podwieczorek", shortName: "POD", sortOrder: 4, cutoff: "14:00", offset: "0", active: true },
  { name: "Kolacja", shortName: "KOL", sortOrder: 5, cutoff: "17:00", offset: "0", active: true },
];

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
  const [contractDepartments, setContractDepartments] = useState<ContractDepartmentRow[]>([]);
  const [contractDiets, setContractDiets] = useState<ContractDietRow[]>([]);
  const [contractMealTypes, setContractMealTypes] = useState<ContractMealTypeRow[]>([]);


  const [loading, setLoading] = useState<boolean>(!isNew);

  // lista klientów
  useEffect(() => {
    getClientsList()
        .then((list) => setClients(list ?? []))
        .catch((err) => {
          console.error("Błąd pobierania klientów", err);
          setClients([]);
        });
  }, []);

  // tryb NOWY
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
      });
      setLoading(false);
    }
  }, [isNew]);

  // tryb EDYCJI
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
    ])
        .then(([contractData, kitchensList, periodsList, depList, dietList, mealTypeList]) => {
          setForm({
            id: contractData.id,
            client_id: contractData.client_id,
            contract_number: contractData.contract_number ?? "",
            start_date: contractData.start_date ?? "",
            end_date: contractData.end_date ?? "",
            contract_value: contractData.contract_value ?? "",
            status: (contractData.status as "active" | "planned" | "expired") ?? "active",
            contract_beds: contractData.contract_beds ?? null,
          });

          setKitchens(kitchensList ?? []);
          setKitchenPeriods(periodsList ?? []);
          setContractDepartments(depList ?? []);
          setContractDiets(dietList ?? []);
          setContractMealTypes(mealTypeList.data ?? []);
        })
        .catch((err) => {
          console.error("Błąd ładowania szczegółów kontraktu", err);
        })
        .finally(() => setLoading(false));
  }, [id, isNew]);

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

  // okresy obsługi
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
            <h2 className="text-lg font-semibold text-foreground">Dane kontraktu</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract-number">Numer kontraktu</Label>
                <Input
                    id="contract-number"
                    value={form.contract_number}
                    onChange={(e) => handleChange("contract_number", e.target.value)}
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
                        handleChange("status", val as "active" | "planned" | "expired")
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
                    onChange={(e) => handleChange("contract_value", e.target.value)}
                />
              </div>

              {/* Liczba miejsc wg kontraktu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contract-beds">Liczba miejsc (w kontrakcie)</Label>

                  {/* Badge z konfiguracji klienta */}
                  {form.client_id && (
                      <Badge variant="secondary" className="text-xs">
                        wg konfiguracji klienta: {clients.find(c => c.id === Number(form.client_id))?.total_beds ?? "—"}
                      </Badge>
                  )}
                </div>

                <Input
                    id="contract-beds"
                    type="number"
                    placeholder="np. 180"
                    value={form.contract_beds ?? ""}
                    onChange={(e) =>
                        handleChange("contract_beds", e.target.value ? Number(e.target.value) : null)
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
                      <tr key={period.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <Select
                              value={String(period.kitchen_id)}
                              onValueChange={(val) =>
                                  handlePeriodFieldChange(period.id, "kitchen_id", Number(val))
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
                                  handlePeriodFieldChange(period.id, "start_date", e.target.value)
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

              {/* Tooltip */}
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
                    {/* Nazwa + custom */}
                    <td className="px-6 py-4 font-medium">
                      {dept.name}
                      {dept.custom_name ? ` (${dept.custom_name})` : ""}
                    </td>

                    {/* Skrót + custom */}
                    <td className="px-6 py-4">
                      {dept.custom_short_name || dept.short_name}
                    </td>

                    {/* Switch */}
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
                                      d.client_department_id === dept.client_department_id
                                          ? { ...d, is_active: newVal }
                                          : d
                                  )
                              );
                            } catch (e) {
                              console.error("Błąd zapisu oddziału w kontrakcie", e);
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
                    diet.client_diet_id ??
                    diet.clientDietId ??
                    diet.id ??
                    0;

                return (
                    <tr
                        key={dietId}
                        className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Nazwa */}
                      <td className="px-6 py-4">
                        {diet.custom_name || diet.name}
                      </td>

                      {/* Skrót */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {diet.custom_short_name || diet.short_name}
                      </td>

                      {/* Switch */}
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
                                        (d.client_diet_id ?? d.id) === dietId
                                            ? { ...d, is_active: newVal }
                                            : d
                                    )
                                );
                              } catch (e) {
                                console.error("Błąd zapisu diety w kontrakcie", e);
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
                <th className="px-6 py-3 text-left text-sm font-medium">Nazwa</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Short</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Sort</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Cutoff</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Offset</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Copy from</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Aktywny</th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {contractMealTypes.map((mt) => (
                  <tr key={mt.client_meal_type_id} className="hover:bg-muted/30">
                    {/* Nazwa */}
                    <td className="px-6 py-4">{mt.custom_name ?? mt.global_name}</td>

                    {/* Short */}
                    <td className="px-6 py-4">{mt.custom_short_name ?? mt.global_short}</td>

                    {/* Sort – tylko readonly (ustawiane u klienta) */}
                    <td className="px-6 py-4 text-center">
                      {mt.custom_sort_order ?? mt.global_sort}
                    </td>

                    {/* Cutoff */}
                    <td className="px-6 py-4 text-center">
                      <Input
                          className="max-w-[120px] mx-auto"
                          type="time"
                          value={mt.cutoff_time ?? "00:00"}
                          onChange={(e) =>
                              updateContractMealTypeField(mt, "cutoff_time", e.target.value)
                          }
                      />
                    </td>

                    {/* Offset */}
                    <td className="px-6 py-4 text-center">
                      <Select
                          value={String(mt.cutoff_days_offset)}
                          onValueChange={(v) =>
                              updateContractMealTypeField(mt, "cutoff_days_offset", Number(v))
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

                    {/* Copy from */}
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
                              .filter((x) => x.client_meal_type_id !== mt.client_meal_type_id)
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


                    {/* Active */}
                    <td className="px-6 py-4 text-center">
                      <Switch
                          checked={mt.is_active === 1}
                          onCheckedChange={(checked) =>
                              updateContractMealTypeField(mt, "is_active", checked ? 1 : 0)
                          }
                      />
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Layout>
  );
};

export default ContractConfig;
