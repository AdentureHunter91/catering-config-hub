import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getAuditLog } from "@/api/audit";

const TABLE_LABELS: Record<string, string> = {
  products: "Produkty",
  product_variants: "Warianty produktów",
  product_categories: "Kategorie produktów",
  product_subcategories: "Subkategorie produktów",
  subproducts: "Subprodukty",
  clients: "Klienci",
  contracts: "Kontrakty",
  kitchens: "Kuchnie",
  kitchen_settings: "Ustawienia kuchni",
  kitchen_quality_settings: "Ustawienia jakości kuchni",
  kitchen_monthly_targets: "Cele miesięczne kuchni",
  contract_kitchen_periods: "Okresy kuchni kontraktu",
  departments: "Oddziały",
  client_departments: "Oddziały klienta",
  diets: "Diety",
  client_diets: "Diety klienta",
  client_department_diets: "Diety oddziałów klienta",
  meal_types: "Typy posiłków",
  client_meal_types: "Typy posiłków klienta",
  contract_meal_type_settings: "Ustawienia posiłków kontraktu",
  contract_departments: "Oddziały kontraktu",
  contract_diets: "Diety kontraktu",
  contract_diet_meal_types: "Typy posiłków diet kontraktu",
  contract_meal_prices: "Ceny posiłków kontraktu",
  users: "Użytkownicy",
  user_roles: "Role użytkowników",
  roles: "Role",
  role_permissions: "Uprawnienia ról",
  permissions: "Uprawnienia",
  page_access: "Dostęp do stron",
  nutrition_database: "Baza danych IŻŻ",
  nutrition_database_uploads: "Wgrania bazy IŻŻ",
  client_contacts: "Kontakty klienta",
};

const renderDiff = (oldJson: any, newJson: any) => {
  if (!oldJson && !newJson)
    return <span className="text-muted-foreground">—</span>;

  let oldObj: any = {};
  let newObj: any = {};

  try {
    if (oldJson) oldObj = typeof oldJson === 'string' ? JSON.parse(oldJson) : oldJson;
    if (newJson) newObj = typeof newJson === 'string' ? JSON.parse(newJson) : newJson;
  } catch (e) {}

  const keys = Array.from(
      new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  );

  return (
      <div className="text-xs space-y-1 max-h-[400px] overflow-y-auto">
        {keys.map((key) => {
          const oldVal = oldObj[key];
          const newVal = newObj[key];
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          return (
              <div
                  key={key}
                  className={`flex flex-col border-b border-border pb-1 px-2 py-1 rounded ${
                      changed ? "bg-yellow-100 dark:bg-yellow-900/30" : ""
                  }`}
              >
                <span className="font-semibold text-foreground text-xs">{key}</span>
                <div className="flex gap-4 pl-2 text-xs">
                  <span className="text-red-600 break-all">{oldVal !== undefined ? String(oldVal) : "—"}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 break-all">{newVal !== undefined ? String(newVal) : "—"}</span>
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
  const [total, setTotal] = useState(0);

  // Filtry
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50;
  
  // Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog({
        q: search,
        action: action,
        table: tableFilter,
        date_from: dateFrom,
        date_to: dateTo,
        limit: limit,
        offset: (page - 1) * limit,
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / limit);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "insert":
        return <Badge className="bg-green-600 text-white">Dodano</Badge>;
      case "update":
        return <Badge className="bg-blue-600 text-white">Zmieniono</Badge>;
      case "delete":
        return <Badge variant="destructive">Usunięto</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              value={total}
              subtext="Wyniki wyszukiwania"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Dodania"
              value={logs.filter((x) => x.action === "insert").length}
              subtext="Na tej stronie"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Zmiany"
              value={logs.filter((x) => x.action === "update").length}
              subtext="Na tej stronie"
          />
          <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Usunięcia"
              value={logs.filter((x) => x.action === "delete").length}
              subtext="Na tej stronie"
          />
        </div>

        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-foreground">Filtrowanie zdarzeń</h2>
          </div>

          <div className="p-4">
            {/* Filtrowanie */}
            <div className="mb-4 grid gap-3 md:grid-cols-6">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Szukaj w logach..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>

              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ akcji" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie akcje</SelectItem>
                  <SelectItem value="insert">Dodano</SelectItem>
                  <SelectItem value="update">Zmieniono</SelectItem>
                  <SelectItem value="delete">Usunięto</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tabela" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">Wszystkie tabele</SelectItem>
                  {Object.entries(TABLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="date"
                    className="pl-10"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Od daty"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="date"
                    className="pl-10"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="Do daty"
                />
              </div>
            </div>

            <div className="mb-4">
              <Button
                  className="gap-2"
                  onClick={handleFilter}
                  disabled={loading}
              >
                <Filter className="h-4 w-4" />
                Zastosuj filtry
              </Button>
            </div>

            {/* Tabela */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Data</TableHead>
                    <TableHead className="w-[140px]">Użytkownik</TableHead>
                    <TableHead className="w-[100px]">Akcja</TableHead>
                    <TableHead className="w-[180px]">Moduł</TableHead>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">Szczegóły</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Ładowanie…
                        </TableCell>
                      </TableRow>
                  ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Brak danych
                        </TableCell>
                      </TableRow>
                  ) : (
                      logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(log.changed_at)}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {log.user_name?.trim() || "System"}
                            </TableCell>
                            <TableCell>{getActionBadge(log.action)}</TableCell>
                            <TableCell className="text-sm">
                              <span className="font-medium">{TABLE_LABELS[log.table_name] || log.table_name}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              #{log.record_id}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                Pokaż
                              </Button>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Wyświetlono {logs.length} z {total} zdarzeń (strona {page} z {totalPages || 1})
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Poprzednia
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Następna
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Modal szczegółów */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>Szczegóły zmiany</span>
                {selectedLog && getActionBadge(selectedLog.action)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p className="font-medium">{formatDate(selectedLog.changed_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Użytkownik:</span>
                    <p className="font-medium">{selectedLog.user_name?.trim() || "System"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Moduł:</span>
                    <p className="font-medium">{TABLE_LABELS[selectedLog.table_name] || selectedLog.table_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID rekordu:</span>
                    <p className="font-medium font-mono">#{selectedLog.record_id}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-red-600">Stara wartość</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-600">Nowa wartość</span>
                  </h4>
                  {renderDiff(selectedLog.old_values, selectedLog.new_values)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
  );
};

export default AuditLog;
