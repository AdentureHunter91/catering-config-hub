import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Clock, Users, Plus, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const ContractsList = () => {
  const contracts = [
    {
      id: "KONTRAKT/2025/SZP-001",
      client: "Szpital Wojewódzki",
      status: "active",
      dateFrom: "01.01.2025",
      dateTo: "31.12.2025",
      kitchen: "Kuchnia Centralna A",
      kitchenPeriod: "01.01.2025 - 31.12.2025",
    },
    {
      id: "KONTRAKT/2025/SZP-002",
      client: "Szpital Miejski",
      status: "planned",
      dateFrom: "01.03.2025",
      dateTo: "31.12.2025",
      kitchen: "Kuchnia Regionalna B",
      kitchenPeriod: "01.03.2025 - 31.12.2025",
    },
    {
      id: "KONTRAKT/2024/SZP-015",
      client: "Centrum Medyczne",
      status: "expired",
      dateFrom: "01.01.2024",
      dateTo: "31.12.2024",
      kitchen: "Kuchnia Centralna A",
      kitchenPeriod: "01.01.2024 - 31.12.2024",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Aktywny</Badge>;
      case "planned":
        return <Badge className="bg-info text-info-foreground">Planowany</Badge>;
      case "expired":
        return <Badge variant="secondary">Wygasły</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: "Konfiguracja systemu" }, { label: "Kontrakty" }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lista Kontraktów</h1>
          <p className="mt-1 text-muted-foreground">
            Zarządzaj kontraktami i przypisanymi kuchniami
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Dodaj kontrakt
        </Button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Aktywne kontrakty" value={12} />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Planowane" value={3} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Wygasłe" value={8} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Łączna liczba klientów" value={23} />
      </div>

      {/* Contracts Table */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Kontrakty</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Filtrowanie..." className="pl-9 w-64" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Numer kontraktu
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Klient</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Obowiązuje: data od–do
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Kuchnia obsługująca
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/kontrakty/${contract.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {contract.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{contract.client}</td>
                  <td className="px-6 py-4">{getStatusBadge(contract.status)}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {contract.dateFrom} – {contract.dateTo}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{contract.kitchen}</p>
                      <p className="text-xs text-muted-foreground">{contract.kitchenPeriod}</p>
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
    </Layout>
  );
};

export default ContractsList;
