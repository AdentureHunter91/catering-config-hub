import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { getClient, saveClient } from "@/api/clients";
import { getContracts } from "@/api/contracts";
import { getDepartments, Department } from "@/api/departments";
import {
  getClientDepartments,
  addClientDepartment,
  updateClientDepartment,
  deleteClientDepartment,
  ClientDepartment,
} from "@/api/clientDepartments";
import { getDiets, Diet } from "@/api/diets";
import {
  getClientDiets,
  addClientDiet,
  updateClientDiet,
  deleteClientDiet,
  ClientDiet,
} from "@/api/clientDiets";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

import {
  getClientDepartmentDiets,
  addClientDepartmentDiet,
  updateClientDepartmentDiet,
  deleteClientDepartmentDiet,
  ClientDepartmentDiet,
} from "@/api/clientDepartmentDiets";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  getClientMealTypes,
  updateClientMealType
} from "@/api/clientMealTypes";

import {
  getClientContacts,
  addClientContact,
  updateClientContact,
  deleteClientContact,
  ClientContact,
} from "@/api/clientContacts";


type ContractItem = {
  id: number;
  contract_number: string;
  status: string;
  start_date: string;
  end_date: string | null;
};

const ClientConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "nowy";

  const [form, setForm] = useState({
    id: 0,
    short_name: "",
    full_name: "",
    nip: "",
    city: "",
    address: "",
    total_beds: null as number | null,
  });

  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clientDepartments, setClientDepartmentsState] = useState<ClientDepartment[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [clientDiets, setClientDietsState] = useState<ClientDiet[]>([]);
  const [clientDepartmentDiets, setClientDepartmentDiets] = useState<ClientDepartmentDiet[]>([]);
  const [clientMealTypes, setClientMealTypes] = useState([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);


  const [loading, setLoading] = useState(true);

  // ------------------------------
  // LOAD DATA
  // ------------------------------

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    const clientId = Number(id);

    Promise.all([
      getClient(clientId),
      getContracts(clientId),
      getDepartments(),
      getClientDepartments(clientId),
      getDiets(),
      getClientDiets(clientId),
      getClientDepartmentDiets(clientId),
      getClientMealTypes(clientId),
      getClientContacts(clientId),
    ])
        .then(([client, kontrakty, deps, cDeps, dts, cDts, cddList, cMealTypes, cContacts]) => {
          setForm({
            id: client.id,
            short_name: client.short_name,
            full_name: client.full_name,
            nip: client.nip,
            city: client.city,
            address: client.address,
            total_beds: client.total_beds ?? null,
          });

          setContracts(kontrakty ?? []);
          setDepartments(deps ?? []);
          setClientDepartmentsState(cDeps ?? []);
          setDiets(dts ?? []);
          setClientDietsState(cDts ?? []);
          setClientDepartmentDiets(cddList ?? []);
          setClientMealTypes(cMealTypes ?? []);
          setContacts(cContacts ?? []);
        })
        .finally(() => setLoading(false));
  }, [id, isNew]);

  // ------------------------------
  // HANDLE CHANGE
  // ------------------------------

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------------------
  // SAVE CLIENT
  // ------------------------------

  const handleSave = async () => {
    const saved = await saveClient(form);

    // nowy klient → przejdź do trybu edycji
    if (isNew && saved.id) {
      navigate(`/klienci/${saved.id}`);
      return;
    }

    navigate("/klienci");
  };

  // ------------------------------
  // DELETE CLIENT — TODO backend
  // ------------------------------

  const handleDelete = () => {
    alert("Funkcja usuwania klienta będzie dodana później (TODO).");
  };

  // ------------------------------
// OSOBY KONTAKTOWE — HANDLERY
// ------------------------------

  const handleAddContact = async () => {
    if (!form.id) return;

    try {
      const created = await addClientContact({
        client_id: form.id,
        full_name: "",
        position: "",
        phone: "",
        email: "",
        notes: "",
      });

      setContacts((prev) => [...prev, created]);
    } catch (e: any) {
      console.error("Błąd dodawania kontaktu klienta", e);
      alert(e?.message || "Nie udało się dodać kontaktu.");
    }
  };

  type ContactField =
      | "full_name"
      | "position"
      | "phone"
      | "email"
      | "notes";

  const handleContactFieldChange = async (
      index: number,
      field: ContactField,
      value: string
  ) => {
    const row = contacts[index];
    if (!row) return;

    // lokalna zmiana
    setContacts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    if (!row.id) return; // teoretycznie nie powinno się zdarzyć

    try {
      await updateClientContact({
        id: row.id,
        full_name: field === "full_name" ? value : row.full_name,
        position: field === "position" ? value : row.position,
        phone: field === "phone" ? value : row.phone,
        email: field === "email" ? value : row.email,
        notes: field === "notes" ? value : row.notes,
      });
    } catch (e) {
      console.error("Błąd auto-zapisu kontaktu klienta", e);
    }
  };

  const handleDeleteContact = async (index: number) => {
    const row = contacts[index];
    if (!row) return;

    if (!confirm("Czy na pewno chcesz usunąć tę osobę kontaktową?")) return;

    try {
      await deleteClientContact(row.id);
      setContacts((prev) => prev.filter((_, i) => i !== index));
    } catch (e: any) {
      console.error("Błąd usuwania kontaktu klienta", e);
      alert(e?.message || "Nie udało się usunąć kontaktu.");
    }
  };


  // ------------------------------
  // ODDZIAŁY KLIENTA — HANDLERY
  // ------------------------------

  const handleAddClientDepartmentRow = () => {
    if (!form.id) return;

    setClientDepartmentsState((prev) => [
      ...prev,
      {
        id: null,
        client_id: form.id,
        department_id: null,
        department_name: "",
        department_short_name: "",
        custom_name: "",
        custom_short_name: "",
        _temp: true,
      },
    ]);
  };

  const handleClientDepartmentDepartmentChange = async (
      rowId: number | null,
      index: number,
      departmentId: number
  ) => {
    const row = clientDepartments[index];
    if (!row) return;

    // jeśli rekord jeszcze nie zapisany w bazie → ADD
    if (row.id === null) {
      try {
        const created = await addClientDepartment({
          client_id: form.id,
          department_id: departmentId,
          custom_name: row.custom_name,
          custom_short_name: row.custom_short_name,
        });

        setClientDepartmentsState((prev) => {
          const copy = [...prev];
          copy[index] = { ...created, _temp: false };
          return copy;
        });
      } catch (e: any) {
        console.error("Błąd dodawania oddziału klienta", e);
        alert(e?.message || "Nie udało się dodać oddziału klienta.");
      }
    } else {
      // UPDATE istniejącego rekordu
      try {
        await updateClientDepartment({
          id: row.id,
          department_id: departmentId,
          custom_name: row.custom_name,
          custom_short_name: row.custom_short_name,
        });

        // lokalna aktualizacja
        setClientDepartmentsState((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], department_id: departmentId };
          return copy;
        });
      } catch (e: any) {
        console.error("Błąd aktualizacji oddziału klienta", e);
        alert(e?.message || "Nie udało się zaktualizować oddziału klienta.");
      }
    }
  };

  const handleClientDepartmentFieldChange = async (
      index: number,
      field:
          | "custom_name"
          | "custom_short_name"
          | "city"
          | "postal_code"
          | "street"
          | "building_number",
      value: string
  ) => {
    const row = clientDepartments[index];
    if (!row) return;

    let updatedRow: ClientDepartment | null = null;

    // lokalna zmiana + zapamiętanie pełnego, zaktualizowanego rekordu
    setClientDepartmentsState((prev) => {
      const copy = [...prev];
      updatedRow = { ...copy[index], [field]: value };
      copy[index] = updatedRow;
      return copy;
    });

    // jeśli rekord jest zapisany w bazie → auto-save
    if (row.id !== null && updatedRow) {
      try {
        await updateClientDepartment({
          id: updatedRow.id!,                              // na pewno jest
          department_id: updatedRow.department_id || 0,
          custom_name: updatedRow.custom_name || "",
          custom_short_name: updatedRow.custom_short_name || "",
          city: updatedRow.city || "",
          postal_code: updatedRow.postal_code || "",
          street: updatedRow.street || "",
          building_number: updatedRow.building_number || "",
        });
      } catch (e: any) {
        console.error("Błąd auto-zapisu oddziału klienta", e);
      }
    }
  };

  const handleDeleteClientDepartmentRow = async (index: number) => {
    const row = clientDepartments[index];
    if (!row) return;

    if (row.id === null) {
      // tylko lokalny (niezapisany)
      setClientDepartmentsState((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm("Czy na pewno chcesz usunąć ten oddział klienta?")) return;

    try {
      await deleteClientDepartment(row.id);
      setClientDepartmentsState((prev) => prev.filter((_, i) => i !== index));
    } catch (e: any) {
      console.error("Błąd usuwania oddziału klienta", e);
      alert(e?.message || "Nie udało się usunąć oddziału klienta.");
    }
  };

  // ------------------------------
  // DIETY KLIENTA — HANDLERY
  // ------------------------------

  const handleAddClientDietRow = () => {
    if (!form.id) return;

    setClientDietsState((prev) => [
      ...prev,
      {
        id: null,
        client_id: form.id,
        diet_id: null,
        diet_name: "",
        diet_short_name: "",
        custom_name: "",
        custom_short_name: "",
        _temp: true,
      },
    ]);
  };

  const handleClientDietDietChange = async (
      rowId: number | null,
      index: number,
      dietId: number
  ) => {
    const row = clientDiets[index];
    if (!row) return;

    if (row.id === null) {
      try {
        const created = await addClientDiet({
          client_id: form.id,
          diet_id: dietId,
          custom_name: row.custom_name,
          custom_short_name: row.custom_short_name,
        });

        setClientDietsState((prev) => {
          const copy = [...prev];
          copy[index] = { ...created, _temp: false };
          return copy;
        });
      } catch (e: any) {
        console.error("Błąd dodawania diety klienta", e);
        alert(e?.message || "Nie udało się dodać diety klienta.");
      }
    } else {
      try {
        await updateClientDiet({
          id: row.id,
          diet_id: dietId,
          custom_name:
          row.custom_name,
          custom_short_name:
          row.custom_short_name,
        });

        setClientDietsState((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], diet_id: dietId };
          return copy;
        });
      } catch (e: any) {
        console.error("Błąd aktualizacji diety klienta", e);
        alert(e?.message || "Nie udało się zaktualizować diety klienta.");
      }
    }
  };

  const handleClientDietFieldChange = async (
      index: number,
      field: "custom_name" | "custom_short_name",
      value: string
  ) => {
    const row = clientDiets[index];
    if (!row) return;

    setClientDietsState((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    if (row.id !== null) {
      try {
        await updateClientDiet({
          id: row.id,
          diet_id: row.diet_id || 0,
          custom_name:
              field === "custom_name" ? value : row.custom_name,
          custom_short_name:
              field === "custom_short_name" ? value : row.custom_short_name,
        });
      } catch (e: any) {
        console.error("Błąd auto-zapisu diety klienta", e);
      }
    }
  };

  const handleDeleteClientDietRow = async (index: number) => {
    const row = clientDiets[index];
    if (!row) return;

    if (row.id === null) {
      setClientDietsState((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm("Czy na pewno chcesz usunąć tę dietę klienta?")) return;

    try {
      await deleteClientDiet(row.id);
      setClientDietsState((prev) => prev.filter((_, i) => i !== index));
    } catch (e: any) {
      console.error("Błąd usuwania diety klienta", e);
      alert(e?.message || "Nie udało się usunąć diety klienta.");
    }
  };

  // ------------------------------
  // DIETY NA ODDZIAŁACH KLIENTA - HANDLERY
  // ------------------------------

  const handleAddDietToDepartment = async (
      clientDepartmentId: number,
      clientDietId: number
  ) => {
    try {
      const created = await addClientDepartmentDiet({
        client_department_id: clientDepartmentId,
        client_diet_id: clientDietId,
      });

      setClientDepartmentDiets((prev) => [...prev, created]);
    } catch (e: any) {
      console.error("Błąd dodawania diety do oddziału", e);
      alert(e?.message || "Nie udało się dodać diety do oddziału.");
    }
  };

  const handleToggleDeptDietActive = async (id: number) => {
    setClientDepartmentDiets((prev) => {
      const copy = prev.map((row) => {
        if (row.id !== id) return row;

        const newActive: 0 | 1 = row.is_active === 1 ? 0 : 1;
        let newDefault: 0 | 1 = row.is_default;

        // jeśli dezaktywujemy dietę -> nie może być domyślna
        if (newActive === 0 && newDefault === 1) {
          newDefault = 0;
        }

        void updateClientDepartmentDiet({
          id,
          is_active: newActive,
          is_default: newDefault,
        }).catch((e) => {
          console.error("Błąd aktualizacji aktywności diety oddziału", e);
        });

        return { ...row, is_active: newActive, is_default: newDefault };
      });
      return copy;
    });
  };

  const handleToggleDeptDietDefault = async (id: number) => {
    setClientDepartmentDiets((prev) => {
      const copy = prev.map((row) => {
        if (row.id !== id) return row;

        const newDefault: 0 | 1 = row.is_default === 1 ? 0 : 1;
        let newActive: 0 | 1 = row.is_active;

        // domyślna musi być aktywna
        if (newDefault === 1 && newActive === 0) {
          newActive = 1;
        }

        void updateClientDepartmentDiet({
          id,
          is_active: newActive,
          is_default: newDefault,
        }).catch((e) => {
          console.error("Błąd aktualizacji domyślności diety oddziału", e);
        });

        return { ...row, is_default: newDefault, is_active: newActive };
      });
      return copy;
    });
  };

  const handleDeleteDeptDiet = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę dietę z oddziału?")) return;

    try {
      await deleteClientDepartmentDiet(id);
      setClientDepartmentDiets((prev) => prev.filter((row) => row.id !== id));
    } catch (e: any) {
      console.error("Błąd usuwania diety z oddziału", e);
      alert(e?.message || "Nie udało się usunąć diety z oddziału.");
    }
  };

  // ------------------------------
  // ZMIANY W POSIŁKU- HANDLERY
  // ------------------------------

  const handleMealTypeChange = async (mt, changes) => {
    try {
      await updateClientMealType({
        client_id: form.id,
        meal_type_id: mt.meal_type_id,
        ...changes,
      });

      setClientMealTypes((prev) =>
          prev.map((x) =>
              x.meal_type_id === mt.meal_type_id ? { ...x, ...changes } : x
          )
      );
    } catch (e) {
      console.error("Błąd zapisu posiłku klienta", e);
    }
  };


  // ------------------------------
  // UI
  // ------------------------------

  const breadcrumbName = isNew
      ? "Nowy klient"
      : form.short_name || `Klient #${form.id}`;

  if (loading) {
    return (
        <Layout pageKey="config.clients">
          <Breadcrumb
              items={[
                { label: "Konfiguracja systemu" },
                { label: "Klienci", href: "/klienci" },
                { label: breadcrumbName },
              ]}
          />
          <p className="text-muted-foreground">Wczytywanie danych klienta…</p>
        </Layout>
    );
  }

  return (
      <Layout pageKey="config.clients">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Klienci", href: "/klienci" },
              { label: breadcrumbName },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {isNew ? "Nowy klient" : "Konfiguracja klienta"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Dane podstawowe, kontrakty, oddziały i diety klienta
          </p>
        </div>

        {/* SECTION A — Dane klienta */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-foreground">Dane klienta</h2>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nazwa skrócona</Label>
                <Input
                    value={form.short_name}
                    onChange={(e) => handleChange("short_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Pełna nazwa</Label>
                <Input
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>NIP</Label>
                <Input
                    value={form.nip}
                    onChange={(e) => handleChange("nip", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Liczba miejsc (łóżek)</Label>
                <Input
                    type="number"
                    value={form.total_beds ?? ""}
                    placeholder="np. 240"
                    onChange={(e) =>
                        handleChange("total_beds", e.target.value ? Number(e.target.value) : null)
                    }
                />
              </div>

              <div className="space-y-2">
                <Label>Miasto</Label>
                <Input
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Adres</Label>
                <Textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Zapisz zmiany
              </Button>

              {!isNew && (
                  <Button
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń klienta
                  </Button>
              )}
            </div>
          </div>
        </Card>

        {/* SECTION A.1 — Osoby kontaktowe */}
        {!isNew && (
            <Card className="mb-6">
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Osoby kontaktowe
                </h2>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddContact}
                >
                  <Plus className="h-4 w-4" />
                  Dodaj osobę
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Imię i nazwisko
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Stanowisko
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Dodatkowe informacje
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-foreground">
                      Akcje
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y">
                  {contacts.length === 0 && (
                      <tr>
                        <td
                            colSpan={6}
                            className="px-6 py-4 text-sm text-muted-foreground"
                        >
                          Brak zdefiniowanych osób kontaktowych. Użyj przycisku
                          „Dodaj osobę”.
                        </td>
                      </tr>
                  )}

                  {contacts.map((row, index) => (
                      <tr
                          key={row.id}
                          className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Input
                              value={row.full_name ?? ""}
                              onChange={(e) =>
                                  handleContactFieldChange(
                                      index,
                                      "full_name",
                                      e.target.value
                                  )
                              }
                              placeholder="Imię i nazwisko"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Input
                              value={row.position ?? ""}
                              onChange={(e) =>
                                  handleContactFieldChange(
                                      index,
                                      "position",
                                      e.target.value
                                  )
                              }
                              placeholder="Stanowisko"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Input
                              value={row.phone ?? ""}
                              onChange={(e) =>
                                  handleContactFieldChange(
                                      index,
                                      "phone",
                                      e.target.value
                                  )
                              }
                              placeholder="Numer telefonu"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Input
                              type="email"
                              value={row.email ?? ""}
                              onChange={(e) =>
                                  handleContactFieldChange(
                                      index,
                                      "email",
                                      e.target.value
                                  )
                              }
                              placeholder="adres@szpital.pl"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Textarea
                              rows={2}
                              value={row.notes ?? ""}
                              onChange={(e) =>
                                  handleContactFieldChange(
                                      index,
                                      "notes",
                                      e.target.value
                                  )
                              }
                              placeholder="Dodatkowe informacje (godziny kontaktu, zakres odpowiedzialności...)"
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive"
                              onClick={() => handleDeleteContact(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Usuń
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </Card>
        )}


        {/* SECTION B — Kontrakty klienta */}
        {!isNew && (
            <Card className="mb-6">
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Kontrakty klienta
                </h2>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate("/kontrakty/nowy")}
                >
                  <Plus className="h-4 w-4" />
                  Dodaj kontrakt
                </Button>
              </div>

              <div className="p-6">
                {contracts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Klient nie posiada jeszcze żadnych kontraktów.
                    </p>
                ) : (
                    <div className="space-y-3">
                      {contracts.map((c) => (
                          <div
                              key={c.id}
                              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-foreground">
                                  {c.contract_number}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {c.start_date} — {c.end_date || "Brak daty końcowej"}
                                </p>
                              </div>
                            </div>

                            <Link to={`/kontrakty/${c.id}`}>
                              <Button variant="ghost" size="sm">
                                Szczegóły
                              </Button>
                            </Link>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </Card>
        )}

        {/* SECTION C — Oddziały klienta */}
        {!isNew && (
            <Card className="mb-6">
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Oddziały klienta
                </h2>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddClientDepartmentRow}
                >
                  <Plus className="h-4 w-4" />
                  Dodaj oddział
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Oddział (globalny)</th>
                    <th className="px-6 py-3 text-left font-medium">Nazwa własna</th>
                    <th className="px-6 py-3 text-left font-medium">Skrót własny</th>

                    <th className="px-6 py-3 text-left font-medium">Miasto</th>
                    <th className="px-6 py-3 text-left font-medium">Kod pocztowy</th>
                    <th className="px-6 py-3 text-left font-medium">Ulica</th>
                    <th className="px-6 py-3 text-left font-medium">Nr</th>

                    <th className="px-6 py-3 text-right font-medium">Akcje</th>
                  </tr>
                  </thead>

                  <tbody className="divide-y">
                  {clientDepartments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-sm text-muted-foreground">
                          Brak przypisanych oddziałów. Użyj przycisku „Dodaj oddział”.
                        </td>
                      </tr>
                  )}

                  {clientDepartments.map((row, index) => (
                      <tr key={row.id ?? `temp-${index}`} className="hover:bg-muted/30">
                        {/* Globalny oddział */}
                        <td className="px-6 py-4">
                          <Select
                              value={row.department_id ? String(row.department_id) : ""}
                              onValueChange={(val) =>
                                  handleClientDepartmentDepartmentChange(
                                      row.id,
                                      index,
                                      Number(val)
                                  )
                              }
                          >
                            <SelectTrigger className="max-w-xs">
                              <SelectValue placeholder="Wybierz oddział" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((d) => (
                                  <SelectItem key={d.id} value={String(d.id)}>
                                    {d.short_name} — {d.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Nazwa własna */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.custom_name ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "custom_name",
                                      e.target.value
                                  )
                              }
                              placeholder="Opcjonalna nazwa własna"
                          />
                        </td>

                        {/* Skrót własny */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.custom_short_name ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "custom_short_name",
                                      e.target.value
                                  )
                              }
                              placeholder="Opcjonalny skrót"
                          />
                        </td>

                        {/* Miasto */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.city ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "city",
                                      e.target.value
                                  )
                              }
                              placeholder="Miasto"
                          />
                        </td>

                        {/* Kod pocztowy */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.postal_code ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "postal_code",
                                      e.target.value
                                  )
                              }
                              placeholder="00-000"
                          />
                        </td>

                        {/* Ulica */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.street ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "street",
                                      e.target.value
                                  )
                              }
                              placeholder="Ulica"
                          />
                        </td>

                        {/* Nr budynku */}
                        <td className="px-6 py-4">
                          <Input
                              value={row.building_number ?? ""}
                              onChange={(e) =>
                                  handleClientDepartmentFieldChange(
                                      index,
                                      "building_number",
                                      e.target.value
                                  )
                              }
                              placeholder="Nr"
                          />
                        </td>

                        {/* Usuwanie */}
                        <td className="px-6 py-4 text-right">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive"
                              onClick={() => handleDeleteClientDepartmentRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Usuń
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </Card>
        )}


        {/* SECTION D — Diety klienta */}
        {!isNew && (
            <Card className="mb-6">
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Diety klienta
                </h2>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddClientDietRow}
                >
                  <Plus className="h-4 w-4" />
                  Dodaj dietę
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Dieta (globalna)
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Nazwa własna
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-foreground">
                      Skrót własny
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-foreground">
                      Akcje
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y">
                  {clientDiets.length === 0 && (
                      <tr>
                        <td
                            colSpan={4}
                            className="px-6 py-4 text-sm text-muted-foreground"
                        >
                          Brak przypisanych diet. Użyj przycisku „Dodaj dietę”.
                        </td>
                      </tr>
                  )}

                  {clientDiets.map((row, index) => (
                      <tr
                          key={row.id ?? `diet-temp-${index}`}
                          className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Select
                              value={row.diet_id ? String(row.diet_id) : ""}
                              onValueChange={(val) =>
                                  handleClientDietDietChange(
                                      row.id,
                                      index,
                                      Number(val)
                                  )
                              }
                          >
                            <SelectTrigger className="max-w-xs">
                              <SelectValue placeholder="Wybierz dietę" />
                            </SelectTrigger>
                            <SelectContent>
                              {diets.map((d) => (
                                  <SelectItem key={d.id} value={String(d.id)}>
                                    {d.short_name} — {d.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-6 py-4">
                          <Input
                              value={row.custom_name ?? ""}
                              onChange={(e) =>
                                  handleClientDietFieldChange(
                                      index,
                                      "custom_name",
                                      e.target.value
                                  )
                              }
                              placeholder="Opcjonalna nazwa własna"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Input
                              value={row.custom_short_name ?? ""}
                              onChange={(e) =>
                                  handleClientDietFieldChange(
                                      index,
                                      "custom_short_name",
                                      e.target.value
                                  )
                              }
                              placeholder="Opcjonalny skrót"
                              className="max-w-[180px]"
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive"
                              onClick={() => handleDeleteClientDietRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Usuń
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </Card>
        )}

        {/* SECTION E — Diety na oddziałach */}
        {!isNew && (
            <Card className="mb-6">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Diety przypisane do oddziałów
                </h2>
                <p className="text-sm text-muted-foreground">
                  Konfiguracja diet dostępnych na poszczególnych oddziałach klienta.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {clientDepartments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Brak zdefiniowanych oddziałów klienta. Najpierw dodaj oddziały w
                      sekcji powyżej.
                    </p>
                )}

                {clientDepartments.map((dept) => {
                  if (!dept.id) {
                    return (
                        <div
                            key={`dept-temp-${dept.custom_name}-${dept.department_id}`}
                            className="rounded-lg border p-4 bg-muted/30"
                        >
                          <p className="text-sm text-muted-foreground">
                            Ten oddział nie został jeszcze zapisany w bazie. Zapisz
                            klienta/oddział, aby przypisywać diety.
                          </p>
                        </div>
                    );
                  }

                  const dietsForDept = clientDepartmentDiets.filter(
                      (row) => row.client_department_id === dept.id
                  );

                  // dostępne diety klienta, których jeszcze nie ma w tym oddziale
                  const availableClientDiets = clientDiets.filter(
                      (cd) =>
                          !dietsForDept.some((dd) => dd.client_diet_id === cd.id)
                  );

                  const deptLabel =
                      dept.custom_name && dept.custom_name.trim().length > 0
                          ? dept.custom_name
                          : dept.department_name || "Oddział";

                  return (
                      <div
                          key={dept.id}
                          className="rounded-lg border p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              {deptLabel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Globalnie: {dept.department_short_name} —{" "}
                              {dept.department_name}
                            </p>
                          </div>

                          <AddDietToDepartmentButton
                              availableClientDiets={availableClientDiets}
                              onSelectDiet={(clientDietId) =>
                                  handleAddDietToDepartment(dept.id!, clientDietId)
                              }
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-foreground">
                                Dieta
                              </th>
                              <th className="px-4 py-2 text-center font-medium text-foreground">
                                Domyślna
                              </th>
                              <th className="px-4 py-2 text-center font-medium text-foreground">
                                Aktywna
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-foreground">
                                Akcje
                              </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {dietsForDept.length === 0 && (
                                <tr>
                                  <td
                                      colSpan={4}
                                      className="px-4 py-3 text-sm text-muted-foreground"
                                  >
                                    Brak diet przypisanych do tego oddziału.
                                  </td>
                                </tr>
                            )}

                            {dietsForDept.map((row) => (
                                <tr key={row.id} className="hover:bg-muted/30">
                                  <td className="px-4 py-2">
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {row.diet_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {row.diet_short_name}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <Switch
                                        checked={row.is_default === 1}
                                        onCheckedChange={() =>
                                            handleToggleDeptDietDefault(row.id)
                                        }
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <Switch
                                        checked={row.is_active === 1}
                                        onCheckedChange={() =>
                                            handleToggleDeptDietActive(row.id)
                                        }
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-destructive"
                                        onClick={() => handleDeleteDeptDiet(row.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Usuń
                                    </Button>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                  );
                })}
              </div>
            </Card>
        )}

        {/* Sekcja: Konfiguracja posiłków klienta */}
        <Card className="mb-6">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Posiłki klienta (meal types)
              </h2>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">?</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Lista posiłków pochodzi z konfiguracji globalnej.
                    <br />
                    Tutaj możesz dostosować nazwy, skróty i kolejność dla klienta.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Nazwa</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Nazwa własna</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Skrót</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Skrót własny</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Sort</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Aktywny</th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {clientMealTypes.map((mt) => (
                  <tr key={mt.meal_type_id} className="hover:bg-muted/30 transition-colors">

                    {/* Nazwa globalna */}
                    <td className="px-6 py-4">{mt.name}</td>

                    {/* Custom name */}
                    <td className="px-6 py-4">
                      <Input
                          value={mt.custom_name ?? ""}
                          onChange={(e) =>
                              handleMealTypeChange(mt, { custom_name: e.target.value })
                          }
                      />
                    </td>

                    {/* Short name */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {mt.short_name}
                    </td>

                    {/* Custom short name */}
                    <td className="px-6 py-4 relative z-[20]">
                      <Input
                          value={mt.custom_short_name ?? ""}
                          onChange={(e) =>
                              handleMealTypeChange(mt, { custom_short_name: e.target.value })
                          }
                      />
                    </td>

                    {/* Custom sort */}
                    <td className="px-6 py-4 text-center">
                      <Input
                          type="number"
                          value={mt.custom_sort_order ?? mt.sort_order}
                          onChange={(e) =>
                              handleMealTypeChange(mt, {
                                custom_sort_order: Number(e.target.value),
                              })
                          }
                      />
                    </td>

                    {/* Active */}
                    <td className="px-6 py-4 text-center">
                      <Switch
                          checked={mt.is_active === 1}
                          onCheckedChange={(val) =>
                              handleMealTypeChange(mt, { is_active: val ? 1 : 0 })
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

type AddDietToDepartmentButtonProps = {
  availableClientDiets: {
    id: number;
    diet_name?: string;
    diet_short_name?: string;
  }[];
  onSelectDiet: (clientDietId: number) => void;
};

const AddDietToDepartmentButton = ({
                                     availableClientDiets,
                                     onSelectDiet,
                                   }: AddDietToDepartmentButtonProps) => {
  const [open, setOpen] = useState(false);

  const hasOptions = availableClientDiets.length > 0;

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!hasOptions}
          >
            <Plus className="h-4 w-4" />
            {hasOptions ? "Dodaj dietę" : "Wszystkie diety przypisane"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-72">
          <Command>
            <CommandInput placeholder="Szukaj diety..." />
            <CommandList>
              <CommandEmpty>Brak dostępnych diet.</CommandEmpty>
              <CommandGroup>
                {availableClientDiets.map((cd) => (
                    <CommandItem
                        key={cd.id}
                        value={`${cd.diet_short_name} ${cd.diet_name}`}
                        onSelect={() => {
                          onSelectDiet(cd.id);
                          setOpen(false);
                        }}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {cd.diet_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cd.diet_short_name}
                        </p>
                      </div>
                    </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
  );
};


export default ClientConfig;
