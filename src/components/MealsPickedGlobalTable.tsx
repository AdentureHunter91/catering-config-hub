// components/MealsPickedGlobalTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMealsPickedGlobal, type PickedGlobalRow } from "@/api/mealsPickedGlobal";

/** global listy do nazw (jak w MealsApproval.tsx) */
type ClientRow = { id: number; short_name: string; full_name: string };
type DepartmentRow = { id: number; name: string; short_name: string };
type DietRow = { id: number; name: string; short_name: string };
type MealTypeRow = { id: number; name: string; short_name: string; sort_order?: number | null };
type KitchenRow = { id: number; name: string; short_name?: string | null };

/** endpointy client-specific (Twoje istniejące) */
type ClientDepartmentRow = {
  id: number; // client_department_id
  client_id: number;
  department_id: number; // global
  department_name?: string;
  department_short_name?: string;
  custom_name?: string | null;
  custom_short_name?: string | null;
};

type ClientDietRow = {
  id: number; // client_diet_id
  client_id: number;
  diet_id: number; // global
  diet_name?: string;
  diet_short_name?: string;
  custom_name?: string | null;
  custom_short_name?: string | null;
};

type ClientMealTypeRow = {
  meal_type_id: number; // global
  name?: string;
  short_name?: string;
  sort_order?: number;

  client_meal_type_id: number | null;
  custom_name?: string | null;
  custom_short_name?: string | null;
  custom_sort_order?: number | null;
  is_active?: number | boolean;
};

type VariantRow = {
  variant_label: string;
  exclusions_json: string | null;
  menu_selection_json: string | null;
};

const BASE = (import.meta as any).env?.BASE_URL || "/Config/";
const apiUrl = (p: string) => `${BASE.replace(/\/?$/, "/")}${p.replace(/^\//, "")}`;

async function fetchJsonAny(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

/** API może zwracać [] albo {data: []} albo {rows: []} itd. */
function unwrapArray<T>(payload: any, keys: string[] = []): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload.rows)) return payload.rows as T[];
  for (const k of keys) if (Array.isArray(payload[k])) return payload[k] as T[];
  return [];
}

const asKey = (v: any) => String(v ?? "");
const key2 = (clientId: number, localId: number | null | undefined) => `${clientId}:${localId ?? ""}`;
const keyMeal = (clientId: number, globalMealTypeId: number) => `${clientId}:${globalMealTypeId}`;

function pickClientLabel(parts: Array<string | null | undefined>) {
  const v = parts.find((x) => (x ?? "").trim().length > 0);
  return (v ?? "").trim();
}

/** media query hook (używamy do: minWidth i szerokości kolumn na mobile) */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    if (m.addEventListener) m.addEventListener("change", onChange);
    else m.addListener(onChange);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange);
      else m.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

/**
 * Responsive: na małym short, na średnim full, na dużym full (short).
 * Tu zostawiamy truncate (bo w wąskiej kolumnie ma się ucinać).
 */
function ResponsiveName({ name, short }: { name?: string; short?: string }) {
  const n = (name ?? "").trim();
  const s = (short ?? "").trim();

  const small = s || n || "—";
  const medium = n || small;
  const large = n && s ? `${n} (${s})` : n || s || "—";

  return (
      <>
        <span className="sm:hidden block truncate">{small}</span>
        <span className="hidden sm:block lg:hidden truncate">{medium}</span>
        <span className="hidden lg:block truncate">{large}</span>
      </>
  );
}

function parseExclusions(exclusionsJson: string | null | undefined): string[] {
  if (!exclusionsJson) return [];
  try {
    const parsed = JSON.parse(exclusionsJson);

    if (Array.isArray(parsed)) {
      return parsed
          .map((x) => {
            if (typeof x === "string") return x.trim();
            if (x && typeof x === "object") return String((x.name ?? x.label ?? x.code ?? x.id ?? "")).trim();
            return "";
          })
          .filter(Boolean);
    }

    if (parsed && typeof parsed === "object") {
      const arr = (parsed.exclusions ?? parsed.items ?? parsed.values) as any;
      if (Array.isArray(arr)) return arr.map((x) => String(x ?? "").trim()).filter(Boolean);
    }

    return [];
  } catch {
    const s = exclusionsJson.trim();
    return s ? [s] : [];
  }
}

export type MealsPickedGlobalFilters = {
  dateFrom?: string;
  dateTo?: string;

  clientIds?: number[];
  globalDepartmentIds?: number[];
  globalDietIds?: number[];
  globalMealTypeIds?: number[];
  kitchenIds?: number[];

  allowStatuses?: string[];
};

type Props = {
  filters: MealsPickedGlobalFilters;
  refreshMs?: number;
  limit?: number;
  title?: string;
};

type MatrixRow = {
  global_department_id: number | null;
  global_diet_id: number | null;

  client_department_id: number | null;
  client_diet_id: number | null;

  variant_label: string;
  cells: Record<string, number>;
  sum: number;
};

type Group = {
  meal_date: string;
  client_id: number;
  kitchen_id: number | null;
  rows: MatrixRow[];
  mealTypeIds: number[];
};

type NamePair = { name: string; short: string };

export default function MealsPickedGlobalTable({
                                                 filters,
                                                 refreshMs = 5000,
                                                 limit = 50000,
                                                 title = "Ilości posiłków (podgląd dietetyka)",
                                               }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<PickedGlobalRow[]>([]);

  // global listy
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [diets, setDiets] = useState<DietRow[]>([]);
  const [mealTypes, setMealTypes] = useState<MealTypeRow[]>([]);
  const [kitchens, setKitchens] = useState<KitchenRow[]>([]);

  // klientowe nazwy (cache)
  const [clientDeptNames, setClientDeptNames] = useState<Record<string, NamePair>>({});
  const [clientDietNames, setClientDietNames] = useState<Record<string, NamePair>>({});
  const [clientMealTypeLabels, setClientMealTypeLabels] = useState<Record<string, { name: string; short: string }>>({});
  const loadedClientIdsRef = useRef<Set<number>>(new Set());

  // warianty (cache)
  const [variantMap, setVariantMap] = useState<Record<string, VariantRow>>({});
  const loadedVariantLabelsRef = useRef<Set<string>>(new Set());

  const inflight = useRef(false);

  // >= md: pokazuj pełne nazwy w headerach i możesz dodać minWidth
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const loadStaticLists = async () => {
    const [cRaw, dRaw, diRaw, mtRaw] = await Promise.all([
      fetchJsonAny(apiUrl("api/clients/list.php")),
      fetchJsonAny(apiUrl("api/departments/list.php")),
      fetchJsonAny(apiUrl("api/diets/list.php")),
      fetchJsonAny(apiUrl("api/meal_types/list.php")),
    ]);

    setClients(unwrapArray<ClientRow>(cRaw, ["clients"]));
    setDepartments(unwrapArray<DepartmentRow>(dRaw, ["departments"]));
    setDiets(unwrapArray<DietRow>(diRaw, ["diets"]));
    setMealTypes(unwrapArray<MealTypeRow>(mtRaw, ["meal_types", "types"]));

    try {
      const kRaw = await fetchJsonAny(apiUrl("api/kitchens/list.php"));
      setKitchens(unwrapArray<KitchenRow>(kRaw, ["kitchens"]));
    } catch {
      setKitchens([]);
    }
  };

  const reload = async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      setError(null);
      const data = await getMealsPickedGlobal(limit);
      setRows(data);
    } catch (e: any) {
      setError(e?.message || "Błąd pobierania danych");
      setRows([]);
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  };

  // init
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await loadStaticLists();
        if (!alive) return;
        await reload();
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // polling
  useEffect(() => {
    if (!refreshMs || refreshMs < 1000) return;
    const t = setInterval(() => {
      reload();
    }, refreshMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs, limit]);

  const clientsMap = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients]);
  const deptMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d])), [departments]);
  const dietMap = useMemo(() => Object.fromEntries(diets.map((d) => [d.id, d])), [diets]);
  const kitchenMap = useMemo(() => Object.fromEntries(kitchens.map((k) => [k.id, k])), [kitchens]);

  /** filtrowanie po GLOBAL ID */
  const filtered = useMemo(() => {
    const { dateFrom, dateTo, clientIds, globalDepartmentIds, globalDietIds, globalMealTypeIds, kitchenIds, allowStatuses } =
    filters || {};

    const sClient = new Set((clientIds ?? []).map(asKey));
    const sDept = new Set((globalDepartmentIds ?? []).map(asKey));
    const sDiet = new Set((globalDietIds ?? []).map(asKey));
    const sMeal = new Set((globalMealTypeIds ?? []).map(asKey));
    const sKitchen = new Set((kitchenIds ?? []).map(asKey));
    const sStatus = new Set((allowStatuses ?? []).map(asKey));

    const useClient = (clientIds ?? []).length > 0;
    const useDept = (globalDepartmentIds ?? []).length > 0;
    const useDiet = (globalDietIds ?? []).length > 0;
    const useMeal = (globalMealTypeIds ?? []).length > 0;
    const useKitchen = (kitchenIds ?? []).length > 0;
    const useStatus = (allowStatuses ?? []).length > 0;

    return rows.filter((r) => {
      if (dateFrom && r.meal_date < dateFrom) return false;
      if (dateTo && r.meal_date > dateTo) return false;

      if (useClient && !sClient.has(asKey(r.client_id))) return false;
      if (useKitchen && !sKitchen.has(asKey(r.kitchen_id))) return false;

      if (useDept && !sDept.has(asKey(r.global_department_id))) return false;
      if (useDiet && !sDiet.has(asKey(r.global_diet_id))) return false;
      if (useMeal && !sMeal.has(asKey(r.global_meal_type_id))) return false;

      if (useStatus && !sStatus.has(asKey(r.status))) return false;

      return true;
    });
  }, [rows, filters]);

  /** jakie kolumny posiłków pokazujemy */
  const visibleMealTypes = useMemo(() => {
    const selected = new Set((filters.globalMealTypeIds ?? []).map(String));
    const list = [...mealTypes].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
    if (!selected.size) return list;
    return list.filter((m) => selected.has(String(m.id)));
  }, [mealTypes, filters.globalMealTypeIds]);

  /**
   * Dociąganie NAZW KLIENTOWYCH per client_id
   */
  useEffect(() => {
    let alive = true;

    const clientIdsInData = Array.from(new Set(filtered.map((r) => r.client_id))).filter((id) => id > 0);
    const missing = clientIdsInData.filter((id) => !loadedClientIdsRef.current.has(id));
    if (!missing.length) return;

    (async () => {
      try {
        const nextDept: Record<string, NamePair> = {};
        const nextDiet: Record<string, NamePair> = {};
        const nextMeal: Record<string, { name: string; short: string }> = {};

        await Promise.all(
            missing.map(async (clientId) => {
              // client_departments
              try {
                const payload = await fetchJsonAny(apiUrl(`api/client_departments/list.php?client_id=${clientId}`));
                const list = unwrapArray<ClientDepartmentRow>(payload, ["client_departments", "departments"]);
                for (const cd of list) {
                  const name = (cd.custom_name ?? cd.department_name ?? "").trim();
                  const short = (cd.custom_short_name ?? cd.department_short_name ?? "").trim();
                  nextDept[key2(clientId, cd.id)] = { name, short };
                }
              } catch {}

              // client_diets
              try {
                const payload = await fetchJsonAny(apiUrl(`api/client_diets/list.php?client_id=${clientId}`));
                const list = unwrapArray<ClientDietRow>(payload, ["client_diets", "diets"]);
                for (const cd of list) {
                  const name = (cd.custom_name ?? cd.diet_name ?? "").trim();
                  const short = (cd.custom_short_name ?? cd.diet_short_name ?? "").trim();
                  nextDiet[key2(clientId, cd.id)] = { name, short };
                }
              } catch {}

              // meal types (global->custom per klient)
              try {
                const payload = await fetchJsonAny(apiUrl(`api/clients/mealTypes/list.php?client_id=${clientId}`));
                const list = unwrapArray<ClientMealTypeRow>(payload, ["mealTypes", "client_meal_types", "types"]);
                for (const mt of list) {
                  const name = pickClientLabel([mt.custom_name, mt.name]) || `#${mt.meal_type_id}`;
                  const short = pickClientLabel([mt.custom_short_name, mt.short_name]) || "";
                  nextMeal[keyMeal(clientId, mt.meal_type_id)] = { name, short };
                }
              } catch {}
            })
        );

        if (!alive) return;

        setClientDeptNames((prev) => ({ ...prev, ...nextDept }));
        setClientDietNames((prev) => ({ ...prev, ...nextDiet }));
        setClientMealTypeLabels((prev) => ({ ...prev, ...nextMeal }));

        for (const id of missing) loadedClientIdsRef.current.add(id);
      } catch {
        // no-op
      }
    })();

    return () => {
      alive = false;
    };
  }, [filtered]);

  /**
   * Dociąganie wariantów (batch) po variant_label
   */
  useEffect(() => {
    let alive = true;

    const labelsInData = Array.from(
        new Set(filtered.map((r) => (r.variant_label ?? "").trim()).filter((x) => x.length > 0))
    );
    const missing = labelsInData.filter((l) => !loadedVariantLabelsRef.current.has(l));
    if (!missing.length) return;

    (async () => {
      try {
        const payload = await fetchJsonAny(apiUrl("api/diet/meal_variants/batch.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant_labels: missing }),
        });

        const list = unwrapArray<VariantRow>(payload, ["variants"]);
        const next: Record<string, VariantRow> = {};
        for (const v of list) if (v?.variant_label) next[v.variant_label] = v;

        if (!alive) return;

        setVariantMap((prev) => ({ ...prev, ...next }));
        for (const l of missing) loadedVariantLabelsRef.current.add(l);
      } catch {
        for (const l of missing) loadedVariantLabelsRef.current.add(l);
      }
    })();

    return () => {
      alive = false;
    };
  }, [filtered]);

  /** grupowanie: data + klient + kuchnia => osobna tabela */
  const groups: Group[] = useMemo(() => {
    const map = new Map<
        string,
        { meal_date: string; client_id: number; kitchen_id: number | null; rowsMap: Map<string, MatrixRow> }
    >();
    const mealTypeIds = visibleMealTypes.map((m) => m.id);

    for (const r of filtered) {
      const gKey = `${r.meal_date}|${r.client_id}|${r.kitchen_id ?? 0}`;
      if (!map.has(gKey)) {
        map.set(gKey, {
          meal_date: r.meal_date,
          client_id: r.client_id,
          kitchen_id: r.kitchen_id ?? null,
          rowsMap: new Map(),
        });
      }
      const g = map.get(gKey)!;

      const variant = (r.variant_label ?? "").trim();
      const rowKey = `${r.global_department_id ?? 0}|${r.global_diet_id ?? 0}|${variant}`;

      if (!g.rowsMap.has(rowKey)) {
        g.rowsMap.set(rowKey, {
          global_department_id: r.global_department_id,
          global_diet_id: r.global_diet_id,
          client_department_id: r.client_department_id ?? null,
          client_diet_id: r.client_diet_id ?? null,
          variant_label: variant,
          cells: {},
          sum: 0,
        });
      }

      const mr = g.rowsMap.get(rowKey)!;
      if (mr.client_department_id == null && r.client_department_id != null) mr.client_department_id = r.client_department_id;
      if (mr.client_diet_id == null && r.client_diet_id != null) mr.client_diet_id = r.client_diet_id;

      const mealId = r.global_meal_type_id;
      if (mealId != null) {
        mr.cells[String(mealId)] = (mr.cells[String(mealId)] ?? 0) + (Number(r.quantity) || 0);
      }
    }

    const out: Group[] = [];
    for (const g of map.values()) {
      const rowsArr = Array.from(g.rowsMap.values()).map((rr) => {
        let sum = 0;
        for (const id of mealTypeIds) sum += rr.cells[String(id)] ?? 0;
        return { ...rr, sum };
      });

      rowsArr.sort((a, b) => {
        const da = a.global_department_id ?? 999999;
        const db = b.global_department_id ?? 999999;
        if (da !== db) return da - db;

        const ia = a.global_diet_id ?? 999999;
        const ib = b.global_diet_id ?? 999999;
        if (ia !== ib) return ia - ib;

        return a.variant_label.localeCompare(b.variant_label);
      });

      out.push({ meal_date: g.meal_date, client_id: g.client_id, kitchen_id: g.kitchen_id, rows: rowsArr, mealTypeIds });
    }

    out.sort((a, b) => (a.meal_date === b.meal_date ? a.client_id - b.client_id : a.meal_date < b.meal_date ? 1 : -1));
    return out;
  }, [filtered, visibleMealTypes]);

  return (
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          </div>

          <div className="text-xs text-muted-foreground">
            Rekordów: <span className="font-medium text-foreground">{loading ? "…" : filtered.length}</span>
          </div>
        </div>

        {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Ładowanie…</div>
        ) : !groups.length ? (
            <div className="mt-4 text-sm text-muted-foreground">Brak danych dla wybranych filtrów.</div>
        ) : (
            <div className="mt-4 space-y-6">
              {groups.map((g) => {
                const client = clientsMap[g.client_id];
                const kitchen = g.kitchen_id ? kitchenMap[g.kitchen_id] : null;

                // header meal labels per klient
                const headerMeals = visibleMealTypes.map((mt) => {
                  const custom = clientMealTypeLabels[keyMeal(g.client_id, mt.id)];
                  const name = custom?.name ?? mt.name;
                  const short = custom?.short ?? mt.short_name;
                  return { id: mt.id, name, short };
                });

                // Mobile: zwężamy Oddział/Dieta/Wariant mocniej żeby nie wymuszać scrolla.
                // Desktop: wracamy do "komfortowych" procentów.
                const W_DEPT = isMdUp ? 16 : 13;   // %
                const W_DIET = isMdUp ? 18 : 14;   // %
                const W_VARIANT = isMdUp ? 14 : 12; // %  wężej
                const W_SUM = isMdUp ? 6 : 8;      // %
                const remaining = Math.max(0, 100 - (W_DEPT + W_DIET + W_VARIANT + W_SUM));
                const mealW = headerMeals.length ? remaining / headerMeals.length : 0;

                // MinWidth tylko na >= md (żeby mobile nie musiał scrollować przez sztuczne minWidth)
                const minTableWidthPx = isMdUp ? 520 + headerMeals.length * 140 : undefined;

                // sums
                const colTotals: Record<string, number> = {};
                for (const mt of visibleMealTypes) colTotals[String(mt.id)] = 0;

                let grand = 0;
                for (const r of g.rows) {
                  grand += r.sum;
                  for (const mt of visibleMealTypes) colTotals[String(mt.id)] += r.cells[String(mt.id)] ?? 0;
                }

                return (
                    <div key={`${g.meal_date}|${g.client_id}|${g.kitchen_id ?? 0}`} className="border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-muted/30 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-semibold text-foreground">{g.meal_date}</span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-foreground" title={client?.full_name}>
                      {client?.short_name ?? `Klient #${g.client_id}`}
                    </span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                      Kuchnia:{" "}
                            <span className="text-foreground">
                        {kitchen
                            ? kitchen.short_name
                                ? `${kitchen.short_name} — ${kitchen.name}`
                                : kitchen.name
                            : g.kitchen_id
                                ? `#${g.kitchen_id}`
                                : "—"}
                      </span>
                    </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Wierszy: <span className="font-medium text-foreground">{g.rows.length}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table
                            className="w-full table-fixed"
                            style={minTableWidthPx ? { minWidth: `${minTableWidthPx}px` } : undefined}
                        >
                          <colgroup>
                            <col style={{ width: `${W_DEPT}%` }} />
                            <col style={{ width: `${W_DIET}%` }} />
                            <col style={{ width: `${W_VARIANT}%` }} />
                            {headerMeals.map((m) => (
                                <col key={m.id} style={{ width: `${mealW}%` }} />
                            ))}
                            <col style={{ width: `${W_SUM}%` }} />
                          </colgroup>

                          <thead>
                          <tr className="border-b">
                            <th className="p-3 text-left text-xs font-semibold text-foreground truncate">Oddział</th>
                            <th className="p-3 text-left text-xs font-semibold text-foreground truncate">Dieta</th>
                            <th className="p-2 sm:p-3 text-left text-xs font-semibold text-foreground truncate">Wariant</th>

                            {/* ✅ Pełne nazwy bez "..." na >= md: zawijamy w 2 linie.
                            ✅ Na mobile: pokazujemy tylko short (żeby nie pchać scrolla). */}
                            {headerMeals.map((m) => {
                              const mobileText = (m.short || m.name || "").trim();
                              const fullText = m.short ? `${m.name} (${m.short})` : (m.name || "").trim();
                              return (
                                  <th
                                      key={m.id}
                                      className="p-3 text-center text-xs font-semibold text-foreground"
                                      title={fullText}
                                  >
                                    {/* mobile */}
                                    <span className="md:hidden block whitespace-nowrap">{mobileText}</span>

                                    {/* >=md: pełna nazwa, bez ellipsis, max 2 linie */}
                                    <span className="hidden md:block whitespace-normal break-words leading-snug line-clamp-2">
                                {fullText}
                              </span>
                                  </th>
                              );
                            })}

                            <th className="p-3 text-center text-xs font-semibold text-foreground">Suma</th>
                          </tr>
                          </thead>

                          <tbody>
                          {g.rows.map((r, idx) => {
                            const deptObj =
                                clientDeptNames[key2(g.client_id, r.client_department_id)] ??
                                (r.global_department_id
                                    ? {
                                      name: deptMap[r.global_department_id!]?.name ?? "",
                                      short: deptMap[r.global_department_id!]?.short_name ?? "",
                                    }
                                    : { name: "", short: "" });

                            const dietObj =
                                clientDietNames[key2(g.client_id, r.client_diet_id)] ??
                                (r.global_diet_id
                                    ? {
                                      name: dietMap[r.global_diet_id!]?.name ?? "",
                                      short: dietMap[r.global_diet_id!]?.short_name ?? "",
                                    }
                                    : { name: "", short: "" });

                            const label = (r.variant_label ?? "").trim();
                            const variant = label ? variantMap[label] : null;
                            const exclusions = label ? parseExclusions(variant?.exclusions_json ?? null) : [];

                            return (
                                <tr
                                    key={`${idx}-${r.global_department_id}-${r.global_diet_id}-${r.variant_label}`}
                                    className="border-b last:border-0"
                                >
                                  <td
                                      className="p-3 text-sm text-foreground overflow-hidden"
                                      title={deptObj.name || deptObj.short || ""}
                                  >
                                    <ResponsiveName name={deptObj.name} short={deptObj.short} />
                                  </td>

                                  <td
                                      className="p-3 text-sm text-foreground overflow-hidden"
                                      title={dietObj.name || dietObj.short || ""}
                                  >
                                    <ResponsiveName name={dietObj.name} short={dietObj.short} />
                                  </td>

                                  <td className="p-2 sm:p-3 text-sm align-top">
                                    {exclusions.length ? (
                                        <div className="text-[11px] sm:text-xs whitespace-normal break-words leading-snug text-rose-600 space-y-0.5">
                                          {exclusions.map((x, i) => (
                                              <div key={i}>- {x}</div>
                                          ))}
                                        </div>
                                    ) : null}
                                  </td>

                                  {visibleMealTypes.map((mt) => {
                                    const v = r.cells[String(mt.id)] ?? 0;
                                    return (
                                        <td
                                            key={mt.id}
                                            className={cn(
                                                "p-3 text-center text-sm overflow-hidden",
                                                v ? "text-foreground" : "text-muted-foreground"
                                            )}
                                        >
                                          {v || 0}
                                        </td>
                                    );
                                  })}

                                  <td className="p-3 text-center text-sm font-semibold text-foreground overflow-hidden">
                                    {r.sum}
                                  </td>
                                </tr>
                            );
                          })}
                          </tbody>

                          <tfoot>
                          <tr className="border-t bg-muted/20">
                            <td className="p-3 text-sm font-semibold text-foreground" colSpan={3}>
                              Suma
                            </td>

                            {visibleMealTypes.map((mt) => (
                                <td key={mt.id} className="p-3 text-center text-sm font-semibold text-foreground">
                                  {colTotals[String(mt.id)] ?? 0}
                                </td>
                            ))}

                            <td className="p-3 text-center text-sm font-bold text-foreground">{grand}</td>
                          </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                );
              })}
            </div>
        )}
      </Card>
  );
}
