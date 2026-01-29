import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  FileText, 
  Users, 
  ChefHat, 
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { getContracts } from "@/api/contracts";
import { getClientsFull } from "@/api/clients";
import { getKitchens } from "@/api/kitchens";
import { getDashboardMapData } from "@/api/dashboardMap";
import { getMealsPickedGlobal } from "@/api/mealsPickedGlobal";
import { useMe } from "@/auth/useMe";
import DashboardMap, { type MapSelection } from "@/components/DashboardMap";
import { endOfDay, endOfMonth, endOfWeek, format, getISOWeek, parseISO, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";

type Contract = {
  id: number;
  is_active: boolean;
  [key: string]: unknown;
};

const Dashboard = () => {
  const { me } = useMe();
  const [mealsAgg, setMealsAgg] = useState<"D" | "W" | "M">("W");
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(null);

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

  const mealsRange = useMemo(() => {
    const now = new Date();
    if (mealsAgg === "D") {
      const dayStarts = Array.from({ length: 10 }, (_, index) => startOfDay(subDays(now, 9 - index)));
      return {
        periodStarts: dayStarts,
        dateFrom: format(dayStarts[0], "yyyy-MM-dd"),
        dateTo: format(endOfDay(now), "yyyy-MM-dd"),
      };
    }

    if (mealsAgg === "M") {
      const monthStarts = Array.from({ length: 10 }, (_, index) => startOfMonth(subMonths(now, 9 - index)));
      return {
        periodStarts: monthStarts,
        dateFrom: format(monthStarts[0], "yyyy-MM-dd"),
        dateTo: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    }

    const weekStarts = Array.from({ length: 10 }, (_, index) =>
      startOfWeek(subWeeks(now, 9 - index), { weekStartsOn: 1 })
    );

    return {
      periodStarts: weekStarts,
      dateFrom: format(weekStarts[0], "yyyy-MM-dd"),
      dateTo: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    };
  }, [mealsAgg]);

  const { data: mealsPicked, isLoading: loadingMealsPicked } = useQuery({
    queryKey: ["meals-picked-global", mealsRange.dateFrom, mealsRange.dateTo],
    queryFn: () =>
      getMealsPickedGlobal({
        dateFrom: mealsRange.dateFrom,
        dateTo: mealsRange.dateTo,
      }),
  });

  const { data: mapData, isLoading: loadingMapData } = useQuery({
    queryKey: ["dashboard-map-data"],
    queryFn: getDashboardMapData,
  });

  const contractsList = (contracts ?? []) as Contract[];
  const clientsList = clients ?? [];
  const kitchensList = kitchens ?? [];
  const mealsChartData = useMemo(() => {
    const totals = new Map<string, number>();
    const filtered = mapSelection
      ? (mealsPicked ?? []).filter((row) =>
          mapSelection.type === "client"
            ? row.client_id === mapSelection.id
            : row.kitchen_id === mapSelection.id
        )
      : (mealsPicked ?? []);

    filtered.forEach((row) => {
      if (!row.meal_date) return;
      const parsed = parseISO(row.meal_date);
      if (!Number.isFinite(parsed.getTime())) return;
      const bucketStart =
        mealsAgg === "D"
          ? startOfDay(parsed)
          : mealsAgg === "M"
            ? startOfMonth(parsed)
            : startOfWeek(parsed, { weekStartsOn: 1 });
      const key = format(bucketStart, "yyyy-MM-dd");
      totals.set(key, (totals.get(key) ?? 0) + (row.quantity ?? 0));
    });

    return mealsRange.periodStarts.map((periodStart) => {
      const key = format(periodStart, "yyyy-MM-dd");
      const label =
        mealsAgg === "D"
          ? format(periodStart, "dd.MM")
          : mealsAgg === "M"
            ? format(periodStart, "MM.yyyy")
            : `W${getISOWeek(periodStart)} ${format(periodStart, "yyyy")}`;
      return {
        label,
        total: totals.get(key) ?? 0,
      };
    });
  }, [mealsAgg, mealsPicked, mealsRange.periodStarts, mapSelection]);

  const formatCompact = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${Math.round(value / 100_000) / 10}m`;
    if (Math.abs(value) >= 1_000) return `${Math.round(value / 100) / 10}k`;
    return String(Math.round(value));
  };

  const mealsScaleTicks = useMemo(() => {
    const maxValue = mealsChartData.reduce((max, item) => Math.max(max, item.total), 0);
    if (maxValue <= 0) return [0];

    let step = 1;
    if (maxValue <= 10) step = 2;
    else if (maxValue <= 50) step = 10;
    else if (maxValue <= 200) step = 50;
    else if (maxValue <= 1000) step = 200;
    else if (maxValue <= 5000) step = 1000;
    else if (maxValue <= 10000) step = 2000;
    else step = 5000;

    const maxRounded = Math.ceil(maxValue / step) * step;
    const ticks = [0, maxRounded - step, maxRounded].filter((value) => value >= 0);
    return Array.from(new Set(ticks)).sort((a, b) => a - b);
  }, [mealsChartData]);

  const mealsScaleMax = mealsScaleTicks.length ? Math.max(...mealsScaleTicks) : 0;

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
      title: "Zamówione posiłki",
      value: "",
      icon: null,
      color: "",
      bgColor: "",
      loading: loadingMealsPicked,
      isChart: true,
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
              {stat.isChart ? (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                        {mapSelection ? (
                          <span className="ml-2 text-xs text-muted-foreground/80">
                            • {mapSelection.name}
                          </span>
                        ) : null}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {(["D", "W", "M"] as const).map((key) => (
                          <Button
                            key={key}
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7 rounded-full text-xs",
                              mealsAgg === key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}
                            onClick={() => setMealsAgg(key)}
                          >
                            {key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                  {stat.loading ? (
                    <Skeleton className="h-[110px] w-full" />
                  ) : (
                    <div className="relative h-[110px] w-full">
                      <div className="pointer-events-none absolute left-2 top-2 bottom-2 z-10 w-10 text-[10px] text-muted-foreground/80">
                        {mealsScaleTicks.map((value) => {
                          const ratio = mealsScaleMax > 0 ? 1 - value / mealsScaleMax : 0;
                          return (
                            <span
                              key={`scale-${value}`}
                              className="absolute left-0"
                              style={{ top: `calc(${ratio * 100}% - 6px)` }}
                            >
                              {formatCompact(value)}
                            </span>
                          );
                        })}
                      </div>
                      <ChartContainer
                        className="h-full w-full !aspect-auto p-0"
                        config={{
                          total: {
                            label: "Posiłki",
                            color: "hsl(var(--primary))",
                          },
                        }}
                      >
                        <AreaChart data={mealsChartData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="mealsArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            stroke="hsl(var(--muted-foreground) / 0.2)"
                            strokeDasharray="3 6"
                          />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            padding={{ left: 0, right: 0 }}
                          />
                          <YAxis
                            hide
                            ticks={mealsScaleTicks}
                            domain={[0, mealsScaleMax]}
                            allowDecimals={false}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent labelKey="label" nameKey="total" />}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="var(--color-total)"
                            fill="url(#mealsArea)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 3 }}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  )}
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      {stat.icon ? <stat.icon className={`h-4 w-4 ${stat.color}`} /> : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stat.loading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{stat.value}</div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Map Section */}
        <DashboardMap
          clients={mapData?.clients ?? []}
          kitchens={mapData?.kitchens ?? []}
          isLoading={loadingMapData}
          onSelectionChange={setMapSelection}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
