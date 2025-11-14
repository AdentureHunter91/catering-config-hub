import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AuditLog = () => {
  const logs = [
    {
      id: 1,
      date: "2024-01-15 14:32:10",
      user: "Anna Nowak",
      action: "update",
      table: "contracts",
      record_id: 5,
    },
    {
      id: 2,
      date: "2024-01-15 13:15:22",
      user: "Jan Kowalski",
      action: "insert",
      table: "kitchens",
      record_id: 12,
    },
    {
      id: 3,
      date: "2024-01-15 12:45:33",
      user: "Anna Nowak",
      action: "delete",
      table: "client_departments",
      record_id: 8,
    },
    {
      id: 4,
      date: "2024-01-15 11:20:15",
      user: "Piotr Wiśniewski",
      action: "update",
      table: "users",
      record_id: 3,
    },
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case "insert":
        return <Badge className="bg-success text-white">Dodano</Badge>;
      case "update":
        return <Badge variant="secondary">Zmieniono</Badge>;
      case "delete":
        return <Badge variant="destructive">Usunięto</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Dziennik zdarzeń" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dziennik zdarzeń (Audit Log)</h1>
        <p className="mt-1 text-muted-foreground">Historia wszystkich zmian w systemie</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Wszystkie zdarzenia"
          value={1248}
          subtext="Ostatnie 30 dni"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Dodania"
          value={423}
          subtext="INSERT"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Zmiany"
          value={702}
          subtext="UPDATE"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Usunięcia"
          value={123}
          subtext="DELETE"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dziennik zdarzeń</h2>
        </div>

        <div className="p-4">
          {/* Filters */}
          <div className="mb-4 grid gap-2 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj w logach..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Typ akcji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="insert">Dodano</SelectItem>
                <SelectItem value="update">Zmieniono</SelectItem>
                <SelectItem value="delete">Usunięto</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="contracts">Kontrakty</SelectItem>
                <SelectItem value="kitchens">Kuchnie</SelectItem>
                <SelectItem value="users">Użytkownicy</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtruj
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Data i czas</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Użytkownik</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Akcja</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Tabela</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">ID rekordu</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-4 text-sm text-muted-foreground">{log.date}</td>
                    <td className="py-4 text-sm font-medium text-foreground">{log.user}</td>
                    <td className="py-4">{getActionBadge(log.action)}</td>
                    <td className="py-4 text-sm text-muted-foreground">{log.table}</td>
                    <td className="py-4 text-sm text-muted-foreground">{log.record_id}</td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Zobacz
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Strona 1 z 125</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Poprzednia</Button>
              <Button variant="outline" size="sm">Następna</Button>
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default AuditLog;
