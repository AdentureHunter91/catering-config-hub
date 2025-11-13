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
import { ChefHat, Users, TrendingUp, CheckCircle, Plus, Download } from "lucide-react";

const KitchenConfig = () => {
  const monthlyTargets = [
    { year: 2025, month: "Styczeń", targetMeals: 3500, targetRbh: 280, targetDaily: 116 },
    { year: 2025, month: "Luty", targetMeals: 3200, targetRbh: 256, targetDaily: 114 },
    { year: 2025, month: "Marzec", targetMeals: 3500, targetRbh: 280, targetDaily: 116 },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Kuchnie" },
          { label: "Kuchnia Centralna A" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Konfiguracja kuchni lokalnej</h1>
          <p className="mt-1 text-muted-foreground">Parametry operacyjne i cele produkcyjne</p>
        </div>
        <Badge className="bg-success text-success-foreground text-base px-4 py-2">
          Status: Aktywna
        </Badge>
      </div>

      {/* Quick Stats Sidebar */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        <StatCard icon={<ChefHat className="h-4 w-4" />} label="Obsługiwane kontrakty" value={5} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Pracownicy" value={12} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg. posiłki/dzień" value={115} />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Jakość (5S)"
          value="98%"
          subtext="Ostatni audyt: 05.11.2025"
        />
      </div>

      {/* Section A: Kitchen Data */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane kuchni</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kitchen-name">Nazwa</Label>
              <Input id="kitchen-name" defaultValue="Kuchnia Centralna A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input id="city" defaultValue="Warszawa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input id="nip" defaultValue="123-456-78-90" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-8">
              <Switch id="on-site" defaultChecked />
              <Label htmlFor="on-site" className="cursor-pointer">
                Czy na terenie szpitala?
              </Label>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                placeholder="Dodatkowe informacje o kuchni..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section B: Operational Parameters */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Parametry operacyjne</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max-days">Maks. osobodni</Label>
              <Input id="max-days" type="number" defaultValue="150" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-meals">Maks. posiłków dziennie</Label>
              <Input id="max-meals" type="number" defaultValue="500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shifts">Liczba zmian</Label>
              <Input id="shifts" type="number" defaultValue="2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workers-plan">Liczba pracowników (plan)</Label>
              <Input id="workers-plan" type="number" defaultValue="12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-from">Godziny pracy od</Label>
              <Input id="hours-from" type="time" defaultValue="06:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-to">Godziny pracy do</Label>
              <Input id="hours-to" type="time" defaultValue="20:00" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-8">
              <Switch id="weekends" defaultChecked />
              <Label htmlFor="weekends" className="cursor-pointer">
                Czy działa w weekendy?
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Section C: Monthly Targets */}
      <Card className="mb-6">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Cele miesięczne</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj miesiąc
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Eksport KPI
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Rok</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Miesiąc</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Target meals/rbh
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Target rbh
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Target daily meals
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyTargets.map((target, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{target.year}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{target.month}</td>
                  <td className="px-6 py-4 text-center">
                    <Input
                      type="number"
                      defaultValue={target.targetMeals}
                      className="max-w-[120px] mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Input
                      type="number"
                      defaultValue={target.targetRbh}
                      className="max-w-[120px] mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Input
                      type="number"
                      defaultValue={target.targetDaily}
                      className="max-w-[120px] mx-auto"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section D: Quality Controls */}
      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Jakość (kontrole i 5S)</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="internal-checks">Min. kontrole wewnątrz procesu</Label>
              <Input id="internal-checks" type="number" defaultValue="2" />
              <p className="text-xs text-muted-foreground">na dzień</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="final-checks">Min. kontrole końcowe</Label>
              <Input id="final-checks" type="number" defaultValue="1" />
              <p className="text-xs text-muted-foreground">na dzień</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-frequency">Audyt 5S: co ile dni</Label>
              <Input id="audit-frequency" type="number" defaultValue="30" />
              <p className="text-xs text-muted-foreground">dni</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-muted/50 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Ostatni audyt 5S</p>
              <p className="text-sm text-muted-foreground">
                Data: 05.11.2025 | Wynik: 98% | Status: Bardzo dobry
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default KitchenConfig;
