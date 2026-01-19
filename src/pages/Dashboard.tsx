import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Users, 
  ChefHat, 
  Package,
} from "lucide-react";
import { getContracts } from "@/api/contracts";
import { getClientsFull } from "@/api/clients";
import { getKitchens } from "@/api/kitchens";
import { getProducts } from "@/api/products";
import { getDashboardMapData } from "@/api/dashboardMap";
import { useMe } from "@/auth/useMe";
import DashboardMap from "@/components/DashboardMap";

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

  const { data: mapData, isLoading: loadingMapData } = useQuery({
    queryKey: ["dashboard-map-data"],
    queryFn: getDashboardMapData,
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

        {/* Map Section */}
        <DashboardMap
          clients={mapData?.clients ?? []}
          kitchens={mapData?.kitchens ?? []}
          isLoading={loadingMapData}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
