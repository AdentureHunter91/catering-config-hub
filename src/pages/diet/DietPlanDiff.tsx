import { useParams, useNavigate } from "react-router-dom";
import DietLayout from "@/components/DietLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_DIET_PLANS } from "@/data/mockDietPlans";
import { DIET_PLAN_STATUS_COLORS, DIET_PLAN_STATUS_LABELS } from "@/types/dietPlan";

export default function DietPlanDiff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const diet = MOCK_DIET_PLANS.find((d) => d.id === Number(id));
  const baseDiet = diet?.baseDietId ? MOCK_DIET_PLANS.find((d) => d.id === diet.baseDietId) : null;

  if (!diet || !baseDiet) {
    return (
      <DietLayout pageKey="diet.meals_approval">
        <div className="text-center py-12 text-muted-foreground">Nie znaleziono diety lub brak diety bazowej.</div>
      </DietLayout>
    );
  }

  const goalDiffs = diet.nutritionGoals.filter((g) => g.source === "overridden");
  const identicalGoals = diet.nutritionGoals.filter((g) => g.source === "inherited");

  const costDiff = diet.substitutions.length * 0.30; // mock

  return (
    <DietLayout pageKey="diet.meals_approval">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/dietetyka/plany-diet/${diet.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Porównanie: {diet.name} vs {baseDiet.name}</h1>
      </div>

      {/* SIDE BY SIDE */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* BASE */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-lg">{baseDiet.icon}</span>
              DIETA BAZOWA: {baseDiet.name}
              <Badge className={cn("text-[10px]", DIET_PLAN_STATUS_COLORS[baseDiet.status])}>{DIET_PLAN_STATUS_LABELS[baseDiet.status]}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {baseDiet.nutritionGoals.map((g) => (
              <div key={g.nutrient} className="flex justify-between">
                <span className="text-muted-foreground">{g.nutrient}:</span>
                <span>{g.min ?? "—"}–{g.max ?? "—"} {g.unit}</span>
              </div>
            ))}
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">Wyłączenia: brak</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium mb-1">Pozycje menu:</p>
              {diet.substitutions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-1 text-xs py-0.5">
                  <span>{sub.original}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DERIVED */}
        <Card className="border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-lg">{diet.icon}</span>
              DIETA POCHODNA: {diet.name}
              <Badge className={cn("text-[10px]", DIET_PLAN_STATUS_COLORS[diet.status])}>{DIET_PLAN_STATUS_LABELS[diet.status]}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {diet.nutritionGoals.map((g) => {
              const baseG = baseDiet.nutritionGoals.find((bg) => bg.nutrient === g.nutrient);
              const changed = g.source === "overridden";
              return (
                <div key={g.nutrient} className={cn("flex justify-between", changed && "font-medium text-primary")}>
                  <span className={cn(changed ? "text-primary" : "text-muted-foreground")}>{g.nutrient}:</span>
                  <span>
                    {g.min ?? "—"}–{g.max ?? "—"} {g.unit}
                    {changed ? " Δ" : " (=)"}
                  </span>
                </div>
              );
            })}
            <div className="border-t pt-2">
              <p className="text-xs mb-1">
                <span className="text-muted-foreground">Wyłączenia:</span>
                {diet.exclusions.filter((e) => e.active).map((e) => (
                  <Badge key={e.id} variant="destructive" className="ml-1 text-[10px]">{e.name}</Badge>
                ))}
              </p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium mb-1">Zamienniki:</p>
              {diet.substitutions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-1 text-xs py-0.5">
                  <span className="text-muted-foreground line-through">{sub.original}</span>
                  <span>→</span>
                  <span className="font-medium text-primary">{sub.replacement}</span>
                  <span className="text-muted-foreground ml-1">Δ</span>
                </div>
              ))}
              {diet.substitutions.length === 0 && (
                <p className="text-xs text-muted-foreground">Brak zamienników</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SUMMARY */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Podsumowanie różnic</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded text-center">
              <p className="text-xs text-muted-foreground">Cele odżywcze</p>
              <p className="font-bold mt-1">{goalDiffs.length === 0 ? "Identyczne" : `${goalDiffs.length} zmienione`}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded text-center">
              <p className="text-xs text-muted-foreground">Wyłączenia</p>
              <p className="font-bold mt-1">+{diet.exclusions.filter((e) => e.active).length}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded text-center">
              <p className="text-xs text-muted-foreground">Zamienniki</p>
              <p className="font-bold mt-1">{diet.substitutions.length} pozycji</p>
            </div>
            <div className="p-3 bg-muted/50 rounded text-center">
              <p className="text-xs text-muted-foreground">Struktura posiłków</p>
              <p className="font-bold mt-1">{diet.mealSlots.some((m) => m.overridden) ? "Zmieniona" : "Identyczna"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded text-center">
              <p className="text-xs text-muted-foreground">Δ koszt/dzień</p>
              <p className="font-bold mt-1 text-amber-700">+{costDiff.toFixed(2)} PLN</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DietLayout>
  );
}
