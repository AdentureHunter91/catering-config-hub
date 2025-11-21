import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getAuditLog } from "@/api/audit";

// 🔍 Renderowanie OLD / NEW wartości wygodnie i czytelnie
const renderDiff = (oldJson: any, newJson: any) => {
  if (!oldJson && !newJson)
    return <span className="text-muted-foreground">—</span>;

  let oldObj: any = {};
  let newObj: any = {};

  try {
    if (oldJson) oldObj = JSON.parse(oldJson);
    if (newJson) newObj = JSON.parse(newJson);
  } catch (e) {}

  const keys = Array.from(
      new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  );

  return (
      <div className="text-xs border rounded-md p-2 bg-muted/20 space-y-1">
        {keys.map((key) => {
          const oldVal = oldObj[key];
          const newVal = newObj[key];
          const changed = oldVal !== newVal;

          return (
              <div
                  key={key}
                  className={`flex flex-col border-b pb-1 ${
                      changed ? "bg-yellow-100 dark:bg-yellow-900/30" : ""
                  }`}
              >
                <span className="font-semibold text-foreground">{key}</span>

                <div className="flex justify-between gap-4 pl-2">
                  <span className="text-red-600">{oldVal ?? "—"}</span>
                  <span className="text-green-600">{newVal ?? "—"}</span>
                </div>
              </div>
          );
        })}
      </div>
  );
};

const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtry
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");

  // Pobranie logów
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog({
        q: search,
        action: action,
        table: tableFilter,
      });
      setLogs(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
      <Layout pageKey="config.audit">
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

        {/* Statystyki */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Wszystkie zdarzenia"
              value={logs.length}
              subtext="Ostatnie 30 dni"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Dodania"
              value={logs.filter((x) => x.action === "insert").length}
              subtext="INSERT"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Zmiany"
              value={logs.filter((x) => x.action === "update").length}
              subtext="UPDATE"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Usunięcia"
              value={logs.filter((x) => x.action === "delete").length}
              subtext="DELETE"
          />
        </div>

        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-foreground">Dziennik zdarzeń</h2>
          </div>

          <div className="p-4">
            {/* Filtrowanie */}
            <div className="mb-4 grid gap-2 md:grid-cols-5">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Szukaj w logach..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select onValueChange={setAction} defaultValue="all">
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

              <Select onValueChange={setTableFilter} defaultValue="all">
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

              <Button
                  variant="outline"
                  className="gap-2"
                  onClick={fetchLogs}
                  disabled={loading}
              >
                <Filter className="h-4 w-4" />
                Filtruj
              </Button>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left">Data</th>
                  <th className="pb-3 text-left">Użytkownik</th>
                  <th className="pb-3 text-left">Akcja</th>
                  <th className="pb-3 text-left">Tabela</th>
                  <th className="pb-3 text-left">ID rekordu</th>
                  <th className="pb-3 text-left">Zmiany (OLD → NEW)</th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Ładowanie…
                      </td>
                    </tr>
                ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Brak danych
                      </td>
                    </tr>
                ) : (
                    logs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-3 text-muted-foreground">{log.changed_at}</td>

                          <td className="py-3 font-medium">
                            {log.user_name || "System"}
                          </td>

                          <td className="py-3">{getActionBadge(log.action)}</td>

                          <td className="py-3 text-muted-foreground">
                            {log.table_name}
                          </td>

                          <td className="py-3 text-muted-foreground">{log.record_id}</td>

                          <td className="py-3">
                            {renderDiff(log.old_values, log.new_values)}
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>

            {/* Future pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Strona 1</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Poprzednia
                </Button>
                <Button variant="outline" size="sm">
                  Następna
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Layout>
  );
};

export default AuditLog;
