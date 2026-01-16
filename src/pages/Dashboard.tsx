import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Users, 
  ChefHat, 
  Package,
  TrendingUp,
  Calendar,
  Activity,
  Database
} from "lucide-react";
import { getContracts } from "@/api/contracts";
import { getClientsFull } from "@/api/clients";
import { getKitchens } from "@/api/kitchens";
import { getProducts } from "@/api/products";
import { useMe } from "@/auth/useMe";

type Contract = {
  id: number;
  is_active: boolean;
  [key: string]: unknown;
};

const Dashboard = () => {
  const { me } = useMe();

  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
  });

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["clients-full"],
    queryFn: getClientsFull,
  });

  const { data: kitchens, isLoading: loadingKitchens } = useQuery({
    queryKey: ["kitchens"],
    queryFn: getKitchens,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-all"],
    queryFn: () => getProducts(),
  });

  const contractsList = (contracts ?? []) as Contract[];
  const clientsList = clients ?? [];
  const kitchensList = kitchens ?? [];
  const productsList = products ?? [];

  const stats = [
    {
      title: "Kontrakty",
      value: contractsList.length,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      loading: loadingContracts,
    },
    {
      title: "Klienci",
      value: clientsList.length,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      loading: loadingClients,
    },
    {
      title: "Kuchnie",
      value: kitchensList.length,
      icon: ChefHat,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      loading: loadingKitchens,
    },
    {
      title: "Produkty",
      value: productsList.length,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      loading: loadingProducts,
    },
  ];

  const activeContracts = contractsList.filter((c) => c.is_active).length;

  return (
    <Layout pageKey="config.dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Witaj, {me?.first_name ?? "Użytkowniku"}! Oto przegląd Twojego systemu.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktywne Kontrakty
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingContracts ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{activeContracts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    z {contractsList.length} wszystkich
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data
              </CardTitle>
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Calendar className="h-4 w-4 text-pink-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleDateString("pl-PL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString("pl-PL", { year: "numeric" })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status Systemu
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-2xl font-bold">Online</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Wszystkie systemy działają poprawnie
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Podsumowanie Bazy Danych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Kontrakty</div>
                  {loadingContracts ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-xl font-semibold">{contractsList.length}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Klienci</div>
                  {loadingClients ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-xl font-semibold">{clientsList.length}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <ChefHat className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Kuchnie</div>
                  {loadingKitchens ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-xl font-semibold">{kitchensList.length}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Produkty</div>
                  {loadingProducts ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-xl font-semibold">{productsList.length}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
