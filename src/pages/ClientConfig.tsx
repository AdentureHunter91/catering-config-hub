import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ClientConfig = () => {
  const contracts = [
    { id: 1, number: "K/2024/01", status: "active", start: "2024-01-01", end: "2024-12-31" },
    { id: 2, number: "K/2024/02", status: "planned", start: "2025-01-01", end: null },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Klienci", href: "/klienci" },
          { label: "Szpital A" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Konfiguracja klienta</h1>
        <p className="mt-1 text-muted-foreground">Dane podstawowe i kontrakty</p>
      </div>

      {/* Section A: Client Data */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane klienta</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="short-name">Nazwa skrócona</Label>
              <Input id="short-name" defaultValue="Szpital A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-name">Pełna nazwa</Label>
              <Input id="full-name" defaultValue="Szpital Wojewódzki im. Jana Pawła II" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input id="nip" defaultValue="1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input id="city" defaultValue="Warszawa" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea id="address" defaultValue="ul. Przykładowa 10, 00-001 Warszawa" rows={2} />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz zmiany
            </Button>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Usuń klienta
            </Button>
          </div>
        </div>
      </Card>

      {/* Section B: Contracts */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Kontrakty klienta</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj kontrakt
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{contract.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.start} - {contract.end || "Brak daty końcowej"}
                    </p>
                  </div>
                </div>
                <Link to={`/kontrakty/${contract.id}`}>
                  <Button variant="ghost" size="sm">
                    Szczegóły
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default ClientConfig;
