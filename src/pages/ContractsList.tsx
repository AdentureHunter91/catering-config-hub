import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  FileText,
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Settings,
} from "lucide-react";

// 🔥 API backendu
import { getContracts } from "@/api/contracts";

const ContractsList = () => {
  const navigate = useNavigate();

  /** ------------------------------
   *  FILTRY
   * ------------------------------ */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active-planned");
  const [clientFilter, setClientFilter] = useState("all");

  /** ------------------------------
   *  Pobranie danych z backendu
   * ------------------------------ */
  const { data: contracts = [], isLoading } = useQuery<any[]>({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
  });

  /** ------------------------------
   *  Lista klientów do filtra
   * ------------------------------ */
  const clientsList = Array.from(new Set(contracts.map((c: any) => c.client_short_name)));

  /** ------------------------------
   *  Statystyki
   * ------------------------------ */
  const activeCount = contracts.filter((c: any) => c.status === "active").length;
  const plannedCount = contracts.filter((c: any) => c.status === "planned").length;
  const expiredCount = contracts.filter((c: any) => c.status === "expired").length;
  const totalCount = contracts.length;

  /** ------------------------------
   *  Badge statusu
   * ------------------------------ */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-white">Aktywny</Badge>;
      case "planned":
        return <Badge className="bg-blue-500 text-white">Planowany</Badge>;
      case "expired":
        return <Badge variant="secondary">Wygasły</Badge>;
      default:
        return null;
    }
  };

  /** ------------------------------
   *  FILTROWANIE + SZUKANIE + SORTOWANIE
   * ------------------------------ */
  const filteredContracts = useMemo(() => {
    return contracts

        // 🔍 wyszukiwanie
        .filter((c: any) => {
          const t = search.toLowerCase();
          return (
              c.contract_number.toLowerCase().includes(t) ||
              c.client_short_name.toLowerCase().includes(t)
          );
        })

        // 🎯 filtr statusu
        .filter((c: any) => {
          if (statusFilter === "all") return true;
          if (statusFilter === "active-planned")
            return c.status === "active" || c.status === "planned";
          return c.status === statusFilter;
        })

        // 🧍 filtr klienta
        .filter((c: any) => {
          if (clientFilter === "all") return true;
          return c.client_short_name === clientFilter;
        })

        // 📅 sortowanie po dacie rozpoczęcia DESC (najnowsze pierwsze)
        .sort((a: any, b: any) => {
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });
  }, [contracts, search, statusFilter, clientFilter]);

  if (isLoading) {
    return (
        <Layout pageKey="config.contracts_list">
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </Layout>
    );
  }

  return (
      <Layout pageKey="config.contracts_list">
        <Breadcrumb items={[{ label: "Konfiguracja systemu" }, { label: "Kontrakty" }]} />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lista Kontraktów</h1>
            <p className="mt-1 text-muted-foreground">
              Zarządzaj kontraktami i przypisanymi kuchniami
            </p>
          </div>

          {/* ➕ Dodawanie kontraktu */}
          <Button className="gap-2" onClick={() => navigate("/kontrakty/nowy")}>
            <Plus className="h-4 w-4" />
            Dodaj kontrakt
          </Button>
        </div>

        {/* 📊 Statystyki */}
        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <StatCard icon={<FileText className="h-4 w-4" />} label="Aktywne kontrakty" value={activeCount} />
          <StatCard icon={<Calendar className="h-4 w-4" />} label="Planowane" value={plannedCount} />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Wygasłe" value={expiredCount} />
          <StatCard icon={<Users className="h-4 w-4" />} label="Łączna liczba kontraktów" value={totalCount} />
        </div>

        <Card>
          <div className="border-b p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <h2 className="text-lg font-semibold text-foreground">Kontrakty</h2>

              {/* 🔍 Wyszukiwanie + Filtry */}
              <div className="flex flex-wrap items-center gap-4">

                {/* 🔍 Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                      placeholder="Szukaj kontraktu lub klienta..."
                      className="pl-9 w-64"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* 🎯 filtr statusu */}
                <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="active-planned">Aktywne + planowane</option>
                  <option value="all">Wszystkie</option>
                  <option value="active">Tylko aktywne</option>
                  <option value="planned">Tylko planowane</option>
                  <option value="expired">Tylko wygasłe</option>
                </select>

                {/* 🧍 filtr klienta */}
                <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="all">Wszyscy klienci</option>
                  {clientsList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 📄 Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Numer kontraktu</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Klient</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Okres obowiązywania</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Akcje</th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {filteredContracts.map((contract: any) => (
                  <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                          to={`/kontrakty/${contract.id}`}
                          className="font-medium text-primary hover:underline"
                      >
                        {contract.contract_number}
                      </Link>
                    </td>

                    <td className="px-6 py-4">{contract.client_short_name}</td>

                    <td className="px-6 py-4">{getStatusBadge(contract.status)}</td>

                    <td className="px-6 py-4 text-sm">
                      {contract.start_date} – {contract.end_date ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/kontrakty/${contract.id}`)}
                      >
                        <Settings className="h-4 w-4" />
                        Zarządzaj
                      </Button>
                    </td>
                  </tr>
              ))}

              {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">
                      Brak wyników dla zastosowanych filtrów
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </Card>
      </Layout>
  );
};

export default ContractsList;
