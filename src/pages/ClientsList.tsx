import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus, Edit, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const ClientsList = () => {
  const clients = [
    {
      id: 1,
      short_name: "Szpital A",
      full_name: "Szpital Wojewódzki im. Jana Pawła II",
      nip: "1234567890",
      city: "Warszawa",
      status: "active",
      contracts_count: 2,
    },
    {
      id: 2,
      short_name: "Szpital B",
      full_name: "Centrum Medyczne Medicover",
      nip: "0987654321",
      city: "Kraków",
      status: "active",
      contracts_count: 1,
    },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Klienci" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Klienci</h1>
        <p className="mt-1 text-muted-foreground">Zarządzanie klientami i ich kontraktami</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Aktywni klienci"
          value={2}
          subtext="Z aktywnymi kontraktami"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Aktywne kontrakty"
          value={3}
          subtext="Obecnie obowiązujące"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Planowane"
          value={1}
          subtext="Rozpoczęcie w przyszłości"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Wygasłe"
          value={2}
          subtext="Zakończone kontrakty"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Lista klientów</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj klienta
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj klientów..." className="pl-10" />
            </div>
            <Button variant="outline">Filtruj</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa skrócona</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Pełna nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">NIP</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Miasto</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Kontrakty</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">{client.short_name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{client.full_name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{client.nip}</td>
                    <td className="py-4 text-sm text-muted-foreground">{client.city}</td>
                    <td className="py-4">
                      <Badge variant={client.status === "active" ? "default" : "secondary"}>
                        {client.status === "active" ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{client.contracts_count}</td>
                    <td className="py-4 text-right">
                      <Link to={`/klienci/${client.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edytuj
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default ClientsList;
