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
import { Plus, Settings, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ContractConfig = () => {
  const departments = [
    { name: "Interna", diets: ["Podstawowa", "Cukrzycowa", "Lekkostrawna"] },
    { name: "Chirurgia", diets: ["Płynna", "Podstawowa"] },
    { name: "Pediatria", diets: ["Podstawowa"] },
  ];

  const diets = [
    { name: "Podstawowa", shortName: "POD", active: true },
    { name: "Cukrzycowa", shortName: "CUK", active: true },
    { name: "Płynna", shortName: "PLY", active: true },
    { name: "Lekkostrawna", shortName: "LEK", active: true },
    { name: "Bezglutenowa", shortName: "BEZ", active: false },
  ];

  const mealTypes = [
    { name: "Śniadanie", shortName: "ŚN", sortOrder: 1, cutoff: "06:00", offset: "0", active: true },
    { name: "II Śniadanie", shortName: "IIŚ", sortOrder: 2, cutoff: "09:00", offset: "0", active: true },
    { name: "Obiad", shortName: "OB", sortOrder: 3, cutoff: "11:00", offset: "-1", active: true },
    { name: "Podwieczorek", shortName: "POD", sortOrder: 4, cutoff: "14:00", offset: "0", active: true },
    { name: "Kolacja", shortName: "KOL", sortOrder: 5, cutoff: "17:00", offset: "0", active: true },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Kontrakty", href: "/kontrakty" },
          { label: "KONTRAKT/2025/SZP-001" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Konfiguracja Kontraktu</h1>
        <p className="mt-1 text-muted-foreground">
          Szczegółowa konfiguracja kontraktu i parametrów obsługi
        </p>
      </div>

      {/* Section A: Contract Data */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane kontraktu</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-number">Numer kontraktu</Label>
              <Input id="contract-number" defaultValue="KONTRAKT/2025/SZP-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Klient</Label>
              <Input id="client" defaultValue="Szpital Wojewódzki" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-from">Okres obowiązywania od</Label>
              <Input id="date-from" type="date" defaultValue="2025-01-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Okres obowiązywania do</Label>
              <Input id="date-to" type="date" defaultValue="2025-12-31" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="active">
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
              <Label htmlFor="kitchen">Przypisana kuchnia</Label>
              <Select defaultValue="central-a">
                <SelectTrigger id="kitchen">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central-a">Kuchnia Centralna A</SelectItem>
                  <SelectItem value="regional-b">Kuchnia Regionalna B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz
            </Button>
          </div>
        </div>
      </Card>

      {/* Section B: Client Departments */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Oddziały klienta</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Oddział</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Aktywne diety
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {departments.map((dept, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{dept.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {dept.diets.map((diet, i) => (
                        <Badge key={i} variant="secondary">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Zarządzaj
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section C: Diets */}
      <Card className="mb-6">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Diety klienta</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj dietę
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Nazwa diety
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Short name
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Aktywna
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {diets.map((diet, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Input defaultValue={diet.name} className="max-w-xs" />
                  </td>
                  <td className="px-6 py-4">
                    <Input defaultValue={diet.shortName} className="max-w-[100px]" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Switch defaultChecked={diet.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section D: Meal Types */}
      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Posiłki (meal types)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Nazwa posiłku
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Short name
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Sort order
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Cutoff time
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Cutoff offset
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Aktywny
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mealTypes.map((meal, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Input defaultValue={meal.name} className="max-w-xs" />
                  </td>
                  <td className="px-6 py-4">
                    <Input defaultValue={meal.shortName} className="max-w-[100px]" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Input
                      type="number"
                      defaultValue={meal.sortOrder}
                      className="max-w-[80px] mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Input type="time" defaultValue={meal.cutoff} className="max-w-[120px] mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Select defaultValue={meal.offset}>
                      <SelectTrigger className="max-w-[100px] mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="-1">-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Switch defaultChecked={meal.active} />
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
