import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMealsPickedGlobal, type PickedGlobalRow } from "@/api/mealsPickedGlobal";
import { buildApiUrl } from "@/api/apiBase";

type DietRow = { id: number; name: string; short_name: string };
type MealTypeRow = { id: number; name: string; short_name: string; sort_order?: number | null };

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

    client_meal_type_id: number | null;
    custom_name?: string | null;
    custom_short_name?: string | null;
};

type VariantRow = {
    variant_label: string;
    exclusions_json: string | null;
    menu_selection_json: string | null;
};

const apiUrl = (p: string) => buildApiUrl(p);

async function fetchJsonAny(url: string, init?: RequestInit): Promise<any> {
    const res = await fetch(url, { credentials: "include", ...init });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
}

function unwrapArray<T>(payload: any, keys: string[] = []): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.data)) return payload.data as T[];
    if (Array.isArray(payload.rows)) return payload.rows as T[];
    for (const k of keys) if (Array.isArray(payload[k])) return payload[k] as T[];
    return [];
}

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

const asKey = (v: any) => String(v ?? "");
const keyMeal = (clientId: number, globalMealTypeId: number) => `${clientId}:${globalMealTypeId}`;
const keyDiet = (clientId: number, globalDietId: number) => `${clientId}:${globalDietId}`;

function pickFirst(parts: Array<string | null | undefined>) {
    const v = parts.find((x) => (x ?? "").trim().length > 0);
    return (v ?? "").trim();
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

type AggRow = {
    global_diet_id: number | null;
    variant_label: string; // "" dla braku wariantu
    cells: Record<string, number>; // mealTypeId -> qty
    sum: number;
};

export default function MealsPickedGlobalTotalsTable({
                                                         filters,
                                                         refreshMs = 5000,
                                                         limit = 50000,
                                                         title = "Suma posiłków (agregacja)",
                                                     }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<PickedGlobalRow[]>([]);

    const [diets, setDiets] = useState<DietRow[]>([]);
    const [mealTypes, setMealTypes] = useState<MealTypeRow[]>([]);

    // custom label cache (tylko gdy JEDEN klient wybrany)
    const [clientDietLabels, setClientDietLabels] = useState<Record<string, { name: string; short: string }>>({});
    const [clientMealTypeLabels, setClientMealTypeLabels] = useState<Record<string, { name: string; short: string }>>({});
    const loadedClientRef = useRef<number | null>(null);

    // warianty (cache)
    const [variantMap, setVariantMap] = useState<Record<string, VariantRow>>({});
    const loadedVariantLabelsRef = useRef<Set<string>>(new Set());

    const inflight = useRef(false);
    const isMdUp = useMediaQuery("(min-width: 768px)");

    const loadStaticLists = async () => {
        const [diRaw, mtRaw] = await Promise.all([
            fetchJsonAny(apiUrl("diets/list.php")),
            fetchJsonAny(apiUrl("meal_types/list.php")),
        ]);
        setDiets(unwrapArray<DietRow>(diRaw, ["diets"]));
        setMealTypes(unwrapArray<MealTypeRow>(mtRaw, ["meal_types", "types"]));
    };

    const reload = async () => {
        if (inflight.current) return;
        inflight.current = true;
        try {
            setError(null);
            const data = await getMealsPickedGlobal({
                limit,
                dateFrom: filters?.dateFrom,
                dateTo: filters?.dateTo,
            });
            setRows(data);
        } catch (e: any) {
            setError(e?.message || "Błąd pobierania danych");
            setRows([]);
        } finally {
            inflight.current = false;
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (!refreshMs || refreshMs < 1000) return;
        const t = setInterval(() => reload(), refreshMs);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshMs, limit, filters?.dateFrom, filters?.dateTo]);

    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters?.dateFrom, filters?.dateTo, limit]);

    const dietMap = useMemo(() => Object.fromEntries(diets.map((d) => [d.id, d])), [diets]);

    /** filtr jak dotychczas (po GLOBAL ID) */
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

    /** kolumny posiłków (jak dotychczas) */
    const visibleMealTypes = useMemo(() => {
        const selected = new Set((filters.globalMealTypeIds ?? []).map(String));
        const list = [...mealTypes].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        if (!selected.size) return list;
        return list.filter((m) => selected.has(String(m.id)));
    }, [mealTypes, filters.globalMealTypeIds]);

    /** jeśli wybrany jest dokładnie 1 klient -> ładujemy custom etykiety dla diet i mealType */
    const singleClientId = useMemo(() => {
        const ids = filters?.clientIds ?? [];
        return ids.length === 1 ? ids[0] : null;
    }, [filters?.clientIds]);

    useEffect(() => {
        let alive = true;
        if (!singleClientId) {
            loadedClientRef.current = null;
            setClientDietLabels({});
            setClientMealTypeLabels({});
            return;
        }
        if (loadedClientRef.current === singleClientId) return;

        (async () => {
            try {
                const [cdRaw, cmtRaw] = await Promise.all([
                    fetchJsonAny(apiUrl(`client_diets/list.php?client_id=${singleClientId}`)),
                    fetchJsonAny(apiUrl(`clients/mealTypes/list.php?client_id=${singleClientId}`)),
                ]);

                const cd = unwrapArray<ClientDietRow>(cdRaw, ["client_diets", "diets"]);
                const nextDiet: Record<string, { name: string; short: string }> = {};
                for (const r of cd) {
                    const name = pickFirst([r.custom_name, r.diet_name]) || `#${r.diet_id}`;
                    const short = pickFirst([r.custom_short_name, r.diet_short_name]) || "";
                    nextDiet[keyDiet(singleClientId, r.diet_id)] = { name, short };
                }

                const cmt = unwrapArray<ClientMealTypeRow>(cmtRaw, ["mealTypes", "client_meal_types", "types"]);
                const nextMeal: Record<string, { name: string; short: string }> = {};
                for (const r of cmt) {
                    const name = pickFirst([r.custom_name, r.name]) || `#${r.meal_type_id}`;
                    const short = pickFirst([r.custom_short_name, r.short_name]) || "";
                    nextMeal[keyMeal(singleClientId, r.meal_type_id)] = { name, short };
                }

                if (!alive) return;
                setClientDietLabels(nextDiet);
                setClientMealTypeLabels(nextMeal);
                loadedClientRef.current = singleClientId;
            } catch {
                loadedClientRef.current = singleClientId;
            }
        })();

        return () => {
            alive = false;
        };
    }, [singleClientId]);

    /** batch wariantów */
    useEffect(() => {
        let alive = true;

        const labelsInData = Array.from(
            new Set(filtered.map((r) => (r.variant_label ?? "").trim()).filter((x) => x.length > 0))
        );
        const missing = labelsInData.filter((l) => !loadedVariantLabelsRef.current.has(l));
        if (!missing.length) return;

        (async () => {
            try {
                const payload = await fetchJsonAny(apiUrl("diet/meal_variants/batch.php"), {
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

    /** agregacja: Dieta + Wariant (bez klienta/oddziału) */
    const aggRows: AggRow[] = useMemo(() => {
        const map = new Map<string, AggRow>();

        for (const r of filtered) {
            const dietId = r.global_diet_id ?? null;
            const variant = (r.variant_label ?? "").trim(); // "" = brak
            const k = `${dietId ?? 0}|${variant}`;

            if (!map.has(k)) {
                map.set(k, {
                    global_diet_id: dietId,
                    variant_label: variant,
                    cells: {},
                    sum: 0,
                });
            }

            const ar = map.get(k)!;
            const mealId = r.global_meal_type_id;
            if (mealId != null) {
                ar.cells[String(mealId)] = (ar.cells[String(mealId)] ?? 0) + (Number(r.quantity) || 0);
            }
        }

        const mealIds = visibleMealTypes.map((m) => m.id);
        const out = Array.from(map.values()).map((x) => {
            let sum = 0;
            for (const id of mealIds) sum += x.cells[String(id)] ?? 0;
            return { ...x, sum };
        });

        out.sort((a, b) => {
            const da = a.global_diet_id ?? 999999;
            const db = b.global_diet_id ?? 999999;
            if (da !== db) return da - db;
            return a.variant_label.localeCompare(b.variant_label);
        });

        return out;
    }, [filtered, visibleMealTypes]);

    /** nagłówki posiłków: jeśli 1 klient, to custom, inaczej global */
    const headerMeals = useMemo(() => {
        return visibleMealTypes.map((mt) => {
            if (singleClientId) {
                const c = clientMealTypeLabels[keyMeal(singleClientId, mt.id)];
                return { id: mt.id, name: c?.name ?? mt.name, short: c?.short ?? mt.short_name };
            }
            return { id: mt.id, name: mt.name, short: mt.short_name };
        });
    }, [visibleMealTypes, singleClientId, clientMealTypeLabels]);

    /** Dieta label: jeśli 1 klient, to custom, inaczej global */
    const dietLabel = (globalDietId: number | null) => {
        if (!globalDietId) return { name: "—", short: "—" };
        if (singleClientId) {
            const c = clientDietLabels[keyDiet(singleClientId, globalDietId)];
            if (c) return { name: c.name || dietMap[globalDietId]?.name || `#${globalDietId}`, short: c.short || dietMap[globalDietId]?.short_name || "" };
        }
        return {
            name: dietMap[globalDietId]?.name ?? `#${globalDietId}`,
            short: dietMap[globalDietId]?.short_name ?? "",
        };
    };

    /** sumy kolumn */
    const colTotals = useMemo(() => {
        const t: Record<string, number> = {};
        for (const mt of visibleMealTypes) t[String(mt.id)] = 0;
        for (const r of aggRows) for (const mt of visibleMealTypes) t[String(mt.id)] += r.cells[String(mt.id)] ?? 0;
        return t;
    }, [aggRows, visibleMealTypes]);

    const grandTotal = useMemo(() => aggRows.reduce((a, r) => a + (r.sum || 0), 0), [aggRows]);

    // layout % (bez oddziału; tylko Dieta + Wariant + posiłki + suma)
    const W_DIET = isMdUp ? 22 : 18;
    const W_VARIANT = isMdUp ? 14 : 14;
    const W_SUM = isMdUp ? 7 : 9;
    const remaining = Math.max(0, 100 - (W_DIET + W_VARIANT + W_SUM));
    const mealW = headerMeals.length ? remaining / headerMeals.length : 0;

    // minWidth tylko na md+ (tak jak w poprzednim)
    const minTableWidthPx = isMdUp ? 520 + headerMeals.length * 140 : undefined;

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
                </div>

                <div className="text-xs text-muted-foreground">
                    Wierszy: <span className="font-medium text-foreground">{loading ? "…" : aggRows.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="mt-4 text-sm text-muted-foreground">Ładowanie…</div>
            ) : !aggRows.length ? (
                <div className="mt-4 text-sm text-muted-foreground">Brak danych dla wybranych filtrów.</div>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <table
                        className="w-full table-fixed"
                        style={minTableWidthPx ? { minWidth: `${minTableWidthPx}px` } : undefined}
                    >
                        <colgroup>
                            <col style={{ width: `${W_DIET}%` }} />
                            <col style={{ width: `${W_VARIANT}%` }} />
                            {headerMeals.map((m) => (
                                <col key={m.id} style={{ width: `${mealW}%` }} />
                            ))}
                            <col style={{ width: `${W_SUM}%` }} />
                        </colgroup>

                        <thead>
                        <tr className="border-b">
                            <th className="p-3 text-left text-xs font-semibold text-foreground truncate">Dieta</th>
                            <th className="p-2 sm:p-3 text-left text-xs font-semibold text-foreground truncate">Wariant</th>

                            {headerMeals.map((m) => {
                                const mobileText = (m.short || m.name || "").trim();
                                const fullText = m.short ? `${m.name} (${m.short})` : (m.name || "").trim();
                                return (
                                    <th
                                        key={m.id}
                                        className="p-3 text-center text-xs font-semibold text-foreground"
                                        title={fullText}
                                    >
                                        <span className="md:hidden block whitespace-nowrap">{mobileText}</span>
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
                        {aggRows.map((r, idx) => {
                            const d = dietLabel(r.global_diet_id);
                            const dTextLg = d.name && d.short ? `${d.name} (${d.short})` : d.name || d.short || "—";

                            const label = (r.variant_label ?? "").trim();
                            const variant = label ? variantMap[label] : null;
                            const exclusions = label ? parseExclusions(variant?.exclusions_json ?? null) : [];

                            return (
                                <tr key={`${r.global_diet_id ?? 0}-${r.variant_label}-${idx}`} className="border-b last:border-0">
                                    <td className="p-3 text-sm text-foreground overflow-hidden" title={dTextLg}>
                                        {/* mobile: short, md: full, lg: full(short) */}
                                        <span className="md:hidden block truncate">{d.short || d.name || "—"}</span>
                                        <span className="hidden md:block truncate">{dTextLg}</span>
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

                                    <td className="p-3 text-center text-sm font-semibold text-foreground overflow-hidden">{r.sum}</td>
                                </tr>
                            );
                        })}
                        </tbody>

                        <tfoot>
                        <tr className="border-t bg-muted/20">
                            <td className="p-3 text-sm font-semibold text-foreground" colSpan={2}>
                                Suma
                            </td>

                            {visibleMealTypes.map((mt) => (
                                <td key={mt.id} className="p-3 text-center text-sm font-semibold text-foreground">
                                    {colTotals[String(mt.id)] ?? 0}
                                </td>
                            ))}

                            <td className="p-3 text-center text-sm font-bold text-foreground">{grandTotal}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </Card>
    );
}
