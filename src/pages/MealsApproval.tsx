import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    AlertTriangle,
    CheckCircle2,
    Filter,
    X,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    CheckSquare,
    Square,
} from "lucide-react";
import MealsPickedGlobalTable from "@/components/MealsPickedGlobalTable";
import MealsPickedGlobalTotalsTable from "@/components/MealsPickedGlobalTotalsTable";
import { buildApiUrl } from "@/api/apiBase";


/** ===== helpers ===== */
const apiUrl = (p: string) => buildApiUrl(p);
const getLocalISODate = () => {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

async function fetchJsonAny(url: string): Promise<any> {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
}

async function postJsonAny(url: string, body: any): Promise<any> {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = (payload && (payload.error || payload.message)) || `HTTP ${res.status} for ${url}`;
        throw new Error(msg);
    }
    return payload;
}

/**
 * API może zwracać:
 * - [] (goła tablica)
 * - { success: true, data: [...] }
 * - { rows: [...] } / { clients: [...] } itd.
 */
function unwrapArray<T>(payload: any, keys: string[] = []): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.data)) return payload.data as T[];
    if (Array.isArray(payload.rows)) return payload.rows as T[];
    for (const k of keys) {
        if (Array.isArray(payload[k])) return payload[k] as T[];
    }
    return [];
}

function unwrapObject(payload: any): any {
    if (!payload || typeof payload !== "object") return null;
    if (payload.success === false) return null;
    if (payload.data && typeof payload.data === "object") return payload.data;
    return payload;
}

type MultiOption = { value: number | string; label: string; title?: string };
const asKey = (v: number | string | null | undefined) => String(v ?? "");
const key2 = (clientId: number, localId: number | null | undefined) => `${clientId}:${localId ?? ""}`;

/** ===== Dropdown multi-select z checkboxami ===== */
function MultiSelectDropdown({
                                 label,
                                 options,
                                 selected,
                                 onChange,
                                 placeholder,
                                 className = "",
                                 defaultAllSelected = true,
                             }: {
    label: string;
    options: MultiOption[];
    selected: (number | string)[];
    onChange: (next: (number | string)[]) => void;
    placeholder?: string;
    className?: string;
    defaultAllSelected?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement | null>(null);

    const selectedSet = useMemo(() => new Set(selected.map(asKey)), [selected]);
    const allValues = useMemo(() => options.map((o) => o.value), [options]);
    const allSelected = options.length > 0 && selected.length === options.length;

    // domyślnie wszystko zaznaczone
    useEffect(() => {
        if (!defaultAllSelected) return;
        if (!options.length) return;
        if (selected.length) return;
        onChange(allValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.length]);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!boxRef.current) return;
            if (!boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const toggleOne = (val: number | string) => {
        const k = asKey(val);
        const next = new Set(selectedSet);
        if (next.has(k)) next.delete(k);
        else next.add(k);

        const typed = options
            .filter((o) => next.has(asKey(o.value)))
            .map((o) => o.value);
        onChange(typed);
    };

    const selectAll = () => onChange(allValues);
    const clearAll = () => onChange([]);

    const summary = useMemo(() => {
        if (!options.length) return placeholder ?? "Brak danych";
        if (allSelected) return `Wszystkie (${options.length})`;
        if (!selected.length) return "Brak (0)";
        return `Wybrane: ${selected.length}/${options.length}`;
    }, [options.length, allSelected, selected.length, placeholder]);

    return (
        <div className={cn("relative", className)} ref={boxRef}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "w-full h-10 rounded-md border border-input bg-background px-3 text-sm",
                    "flex items-center justify-between gap-2",
                    "hover:bg-muted/40",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
            >
                <span className="truncate">{summary}</span>
                <ChevronDown
                    className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-[min(520px,calc(100vw-2rem))] rounded-lg border bg-card shadow-lg p-2">
                    <div className="flex items-center justify-between px-2 py-1">
                        <div className="text-xs text-muted-foreground">
                            {options.length ? `Opcje: ${options.length}` : "Brak opcji"}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={selectAll}
                                disabled={!options.length}
                            >
                                <CheckSquare className="h-4 w-4" />
                                Wszystkie
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={clearAll}
                                disabled={!options.length}
                            >
                                <Square className="h-4 w-4" />
                                Wyczyść
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-auto mt-2">
                        {options.map((o) => {
                            const checked = selectedSet.has(asKey(o.value));
                            return (
                                <label
                                    key={asKey(o.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-sm",
                                        "hover:bg-muted/40"
                                    )}
                                    title={o.title}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleOne(o.value)}
                                        className="h-4 w-4"
                                    />
                                    <span className="truncate">{o.label}</span>
                                </label>
                            );
                        })}

                        {!options.length && (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                                {placeholder ?? "Brak danych"}
                            </div>
                        )}
                    </div>

                    <div className="px-2 pt-2 text-[11px] text-muted-foreground">
                        Tip: kliknij wiersz, żeby zaznaczyć/odznaczyć.
                    </div>
                </div>
            )}
        </div>
    );
}

/** ===== Mini select do czasu odświeżania (wąski) ===== */
function RefreshSelect({
                           valueSec,
                           onChangeSec,
                           optionsSec = [5, 10, 15, 30, 60, 120],
                       }: {
    valueSec: number;
    onChangeSec: (sec: number) => void;
    optionsSec?: number[];
}) {
    return (
        <select
            className={cn(
                "h-10 rounded-md border border-input bg-background px-2 text-sm",
                "hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "w-[92px]"
            )}
            value={String(valueSec)}
            onChange={(e) => onChangeSec(Number(e.target.value))}
            title="Czas auto-odświeżania"
        >
            {optionsSec.map((s) => (
                <option key={s} value={s}>
                    {s}s
                </option>
            ))}
        </select>
    );
}

/** ===== API types (GLOBAL LISTS) ===== */
type ClientRow = { id: number; short_name: string; full_name: string; total_beds?: number | null };
type DepartmentRow = { id: number; name: string; short_name: string; description?: string | null };
type DietRow = { id: number; name: string; short_name: string; description?: string | null };
type MealTypeRow = { id: number; name: string; short_name: string; sort_order?: number | null; description?: string | null };
type KitchenRow = { id: number; name: string; short_name?: string | null; description?: string | null };

/** ===== After-cutoff rows from endpoint ===== */
type AfterCutoffApiRow = {
    meal_date: string;
    client_id: number;

    client_department_id: number | null;
    client_diet_id: number | null;
    client_meal_type_id: number | null;

    global_department_id: number | null;
    global_diet_id: number | null;
    global_meal_type_id: number | null;

    qty_after: number;
    qty_before: number | null;
    qty_diff: number | null;

    status: string;
    updated_at: string;
    cutoff_at: string | null;
    minutes_after_cutoff: number | null;

    after_id: number;
    before_id: number | null;

    contract_id?: number | null;
    kitchen_id?: number | null; // ✅ NOWE
};

/** ===== client-specific lists ===== */
type ClientDietRow = {
    id: number; // client_diet_id
    client_id: number;
    diet_id: number; // global
    diet_name?: string;
    diet_short_name?: string;
    custom_name?: string | null;
    custom_short_name?: string | null;
};

type ClientDepartmentRow = {
    id: number; // client_department_id
    client_id: number;
    department_id: number; // global
    department_name?: string;
    department_short_name?: string;
    custom_name?: string | null;
    custom_short_name?: string | null;
    city?: string | null;
    postal_code?: string | null;
    street?: string | null;
    building_number?: string | null;
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

/** ===== small helpers ===== */
function statusLabel(s: string) {
    if (s === "pending_approval") return "Po czasie (pending)";
    if (s === "approved" || s === "accepted") return "Zaakceptowane";
    if (s === "rejected") return "Odrzucone";
    return s;
}

function statusBadgeClass(s: string) {
    if (s === "pending_approval") return "bg-amber-100 text-amber-800";
    if (s === "approved" || s === "accepted") return "bg-emerald-100 text-emerald-800";
    if (s === "rejected") return "bg-rose-100 text-rose-800";
    return "bg-muted text-foreground";
}

function hhmm(ts: string | null) {
    if (!ts) return "—";
    const m = ts.match(/\b(\d{2}:\d{2}):\d{2}\b/);
    return m ? m[1] : ts;
}

function shouldApply(selected: (number | string)[], totalOptions: number) {
    if (!totalOptions) return false;
    if (!selected.length) return false;
    return selected.length < totalOptions;
}

function pickClientLabel(parts: Array<string | null | undefined>) {
    const v = parts.find((x) => (x ?? "").trim().length > 0);
    return (v ?? "").trim();
}

/** ====== ustaw ścieżki do endpointów ====== */
const AFTER_CUTOFF_PATH = "diet/meals_approval/list.php";
const SET_STATUS_PATH = "diet/meals_approval/set_status.php";

const MealsApproval = () => {
    /** ===== refresh config ===== */
    const [refreshSec, setRefreshSec] = useState<number>(15);
    const refreshMs = useMemo(() => Math.max(5, refreshSec) * 1000, [refreshSec]);

    /** ===== global filters ===== */
    const [dateFrom, setDateFrom] = useState<string>(() => getLocalISODate());
    const [dateTo, setDateTo] = useState<string>("");

    // FILTRUJEMY PO GLOBAL ID
    const [clientIds, setClientIds] = useState<(number | string)[]>([]);
    const [departmentIds, setDepartmentIds] = useState<(number | string)[]>([]);
    const [dietIds, setDietIds] = useState<(number | string)[]>([]);
    const [mealTypeIds, setMealTypeIds] = useState<(number | string)[]>([]);
    const [kitchenIds, setKitchenIds] = useState<(number | string)[]>([]);

    /** ===== status filter (multi) ===== */
    const [statusMulti, setStatusMulti] = useState<(string | number)[]>([]);

    /** ===== option lists ===== */
    const [clients, setClients] = useState<ClientRow[]>([]);
    const [departments, setDepartments] = useState<DepartmentRow[]>([]);
    const [diets, setDiets] = useState<DietRow[]>([]);
    const [mealTypes, setMealTypes] = useState<MealTypeRow[]>([]);
    const [kitchens, setKitchens] = useState<KitchenRow[]>([]);

    /** ===== corrections data ===== */
    const [rows, setRows] = useState<AfterCutoffApiRow[]>([]);
    const [loadingRows, setLoadingRows] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /** ===== per-row action loading ===== */
    const [actionBusy, setActionBusy] = useState<Record<number, "approve" | "reject" | null>>({});

    /** ===== client-specific name maps (client_id + local_id) ===== */
    const [clientDietNames, setClientDietNames] = useState<Record<string, string>>({});
    const [clientDeptNames, setClientDeptNames] = useState<Record<string, string>>({});
    const [clientMealTypeNames, setClientMealTypeNames] = useState<Record<string, string>>({});

    /** tabs fo tables **/
    const [mealsView, setMealsView] = useState<"summary" | "details">("summary");


    /** ===== force refresh meals table immediately (remount) ===== */
    const [mealsTableKey, setMealsTableKey] = useState<number>(0);

    const reloadRows = async () => {
        const rowsRaw = await fetchJsonAny(apiUrl(AFTER_CUTOFF_PATH));
        setRows(unwrapArray<AfterCutoffApiRow>(rowsRaw, ["data", "rows"]));
    };

    /** ===== initial load ===== */
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setError(null);
                setLoadingRows(true);

                const [cRaw, dRaw, diRaw, mtRaw, kRaw, rowsRaw] = await Promise.all([
                    fetchJsonAny(apiUrl("clients/list.php")),
                    fetchJsonAny(apiUrl("departments/list.php")),
                    fetchJsonAny(apiUrl("diets/list.php")),
                    fetchJsonAny(apiUrl("meal_types/list.php")),
                    fetchJsonAny(apiUrl("kitchens/list.php")),
                    fetchJsonAny(apiUrl(AFTER_CUTOFF_PATH)),
                ]);

                if (!alive) return;

                setClients(unwrapArray<ClientRow>(cRaw, ["clients"]));
                setDepartments(unwrapArray<DepartmentRow>(dRaw, ["departments"]));
                setDiets(unwrapArray<DietRow>(diRaw, ["diets"]));
                setMealTypes(unwrapArray<MealTypeRow>(mtRaw, ["meal_types", "types"]));
                setKitchens(unwrapArray<KitchenRow>(kRaw, ["kitchens"]));
                setRows(unwrapArray<AfterCutoffApiRow>(rowsRaw, ["data", "rows"]));

                // domyślnie tylko pending
                setStatusMulti((prev) => (prev.length ? prev : ["pending_approval"]));
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Błąd pobierania danych");
                setClients([]);
                setDepartments([]);
                setDiets([]);
                setMealTypes([]);
                setKitchens([]);
                setRows([]);
            } finally {
                if (!alive) return;
                setLoadingRows(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    /** ===== auto refresh (korekty) ===== */
    useEffect(() => {
        if (loadingRows) return;
        let alive = true;

        const tick = async () => {
            try {
                await reloadRows();
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message || "Błąd odświeżania korekt");
            }
        };

        const id = window.setInterval(tick, refreshMs);
        return () => {
            alive = false;
            window.clearInterval(id);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshMs, loadingRows]);

    /**
     * Dociąganie NAZW KLIENTOWYCH (per client_id z rows)
     */
    useEffect(() => {
        let alive = true;

        const uniqueClientIds = Array.from(new Set(rows.map((r) => r.client_id))).filter((id) => id > 0);
        if (!uniqueClientIds.length) return;

        (async () => {
            try {
                const nextDiet: Record<string, string> = {};
                const nextDept: Record<string, string> = {};
                const nextMeal: Record<string, string> = {};

                await Promise.all(
                    uniqueClientIds.map(async (clientId) => {
                        // 1) client diets
                        try {
                            const payload = await fetchJsonAny(apiUrl(`client_diets/list.php?client_id=${clientId}`));
                            const list = unwrapArray<ClientDietRow>(payload, ["diets", "client_diets"]);
                            for (const cd of list) {
                                const label =
                                    pickClientLabel([cd.custom_short_name, cd.custom_name, cd.diet_short_name, cd.diet_name]) ||
                                    `#${cd.id}`;
                                nextDiet[key2(clientId, cd.id)] = label;
                            }
                        } catch {}

                        // 2) client departments
                        try {
                            const payload = await fetchJsonAny(apiUrl(`client_departments/list.php?client_id=${clientId}`));
                            const list = unwrapArray<ClientDepartmentRow>(payload, ["departments", "client_departments"]);
                            for (const cd of list) {
                                const label =
                                    pickClientLabel([cd.custom_short_name, cd.custom_name, cd.department_short_name, cd.department_name]) ||
                                    `#${cd.id}`;
                                nextDept[key2(clientId, cd.id)] = label;
                            }
                        } catch {}

                        // 3) client meal types
                        try {
                            const payload = await fetchJsonAny(apiUrl(`clients/mealTypes/list.php?client_id=${clientId}`));
                            const list = unwrapArray<ClientMealTypeRow>(payload, ["mealTypes", "client_meal_types", "types"]);
                            for (const mt of list) {
                                if (!mt.client_meal_type_id) continue;
                                const label =
                                    pickClientLabel([mt.custom_short_name, mt.custom_name, mt.short_name, mt.name]) ||
                                    `#${mt.client_meal_type_id}`;
                                nextMeal[key2(clientId, mt.client_meal_type_id)] = label;
                            }
                        } catch {}
                    })
                );

                if (!alive) return;

                setClientDietNames((prev) => ({ ...prev, ...nextDiet }));
                setClientDeptNames((prev) => ({ ...prev, ...nextDept }));
                setClientMealTypeNames((prev) => ({ ...prev, ...nextMeal }));
            } catch {}
        })();

        return () => {
            alive = false;
        };
    }, [rows]);

    /** ===== maps for display ===== */
    const clientsMap = useMemo(() => {
        const m: Record<number, ClientRow> = {};
        for (const c of clients) m[c.id] = c;
        return m;
    }, [clients]);

    const departmentsMap = useMemo(() => {
        const m: Record<number, DepartmentRow> = {};
        for (const d of departments) m[d.id] = d;
        return m;
    }, [departments]);

    const dietsMap = useMemo(() => {
        const m: Record<number, DietRow> = {};
        for (const d of diets) m[d.id] = d;
        return m;
    }, [diets]);

    const mealTypesMap = useMemo(() => {
        const m: Record<number, MealTypeRow> = {};
        for (const mt of mealTypes) m[mt.id] = mt;
        return m;
    }, [mealTypes]);

    const kitchensMap = useMemo(() => {
        const m: Record<number, KitchenRow> = {};
        for (const k of kitchens) m[k.id] = k;
        return m;
    }, [kitchens]);

    /** ===== options for multiselects (GLOBAL) ===== */
    const clientOptions: MultiOption[] = useMemo(
        () =>
            clients.map((c) => ({
                value: c.id,
                label: c.short_name,
                title: c.full_name,
            })),
        [clients]
    );

    const deptOptions: MultiOption[] = useMemo(
        () =>
            departments.map((d) => ({
                value: d.id,
                label: d.short_name ? `${d.short_name} — ${d.name}` : d.name,
                title: d.description ?? d.name,
            })),
        [departments]
    );

    const dietOptions: MultiOption[] = useMemo(
        () =>
            diets.map((d) => ({
                value: d.id,
                label: d.short_name ? `${d.short_name} — ${d.name}` : d.name,
                title: d.description ?? d.name,
            })),
        [diets]
    );

    const mealTypeOptions: MultiOption[] = useMemo(
        () =>
            mealTypes.map((m) => ({
                value: m.id,
                label: m.short_name ? `${m.short_name} — ${m.name}` : m.name,
                title: m.description ?? m.name,
            })),
        [mealTypes]
    );

    const kitchenOptions: MultiOption[] = useMemo(
        () =>
            kitchens.map((k) => ({
                value: k.id,
                label: k.short_name ? `${k.short_name} — ${k.name}` : k.name,
                title: k.description ?? k.name,
            })),
        [kitchens]
    );

    const statusOptions: MultiOption[] = useMemo(
        () => [
            { value: "pending_approval", label: "Po czasie (pending)" },
            { value: "approved", label: "Zaakceptowane" },
            { value: "rejected", label: "Odrzucone" },
            { value: "accepted", label: "Zaakceptowane (alias)" },
        ],
        []
    );

    /** ===== defaults: wszystko zaznaczone ===== */
    useEffect(() => {
        if (clientOptions.length && !clientIds.length) setClientIds(clientOptions.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientOptions.length]);

    useEffect(() => {
        if (deptOptions.length && !departmentIds.length) setDepartmentIds(deptOptions.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deptOptions.length]);

    useEffect(() => {
        if (dietOptions.length && !dietIds.length) setDietIds(dietOptions.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dietOptions.length]);

    useEffect(() => {
        if (mealTypeOptions.length && !mealTypeIds.length) setMealTypeIds(mealTypeOptions.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mealTypeOptions.length]);

    useEffect(() => {
        if (kitchenOptions.length && !kitchenIds.length) setKitchenIds(kitchenOptions.map((o) => o.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kitchenOptions.length]);

    useEffect(() => {
        if (statusOptions.length && !statusMulti.length) setStatusMulti(["pending_approval"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusOptions.length]);

    /** ===== filtering corrections (GLOBAL IDs + kitchen_id) ===== */
    const filteredRows = useMemo(() => {
        const applyClient = shouldApply(clientIds, clients.length);
        const applyDept = shouldApply(departmentIds, departments.length);
        const applyDiet = shouldApply(dietIds, diets.length);
        const applyMeal = shouldApply(mealTypeIds, mealTypes.length);
        const applyKitchen = shouldApply(kitchenIds, kitchens.length);
        const applyStatus = shouldApply(statusMulti, statusOptions.length);

        const sClient = new Set(clientIds.map(asKey));
        const sDept = new Set(departmentIds.map(asKey));
        const sDiet = new Set(dietIds.map(asKey));
        const sMeal = new Set(mealTypeIds.map(asKey));
        const sKitchen = new Set(kitchenIds.map(asKey));
        const sStatus = new Set(statusMulti.map(asKey));

        return rows.filter((r) => {
            if (dateFrom && r.meal_date < dateFrom) return false;
            if (dateTo && r.meal_date > dateTo) return false;

            if (applyClient && !sClient.has(asKey(r.client_id))) return false;

            // GLOBAL ID
            if (applyDept && !sDept.has(asKey(r.global_department_id))) return false;
            if (applyDiet && !sDiet.has(asKey(r.global_diet_id))) return false;
            if (applyMeal && !sMeal.has(asKey(r.global_meal_type_id))) return false;

            // ✅ Kuchnia (po kitchen_id z endpointu)
            if (applyKitchen && !sKitchen.has(asKey(r.kitchen_id))) return false;

            if (applyStatus && !sStatus.has(asKey(r.status))) return false;

            return true;
        });
    }, [
        rows,
        dateFrom,
        dateTo,
        clientIds,
        departmentIds,
        dietIds,
        mealTypeIds,
        kitchenIds,
        statusMulti,
        clients.length,
        departments.length,
        diets.length,
        mealTypes.length,
        kitchens.length,
        statusOptions.length,
    ]);

    const pendingCount = useMemo(() => rows.filter((r) => r.status === "pending_approval").length, [rows]);

    const resetFilters = () => {
        setDateFrom(getLocalISODate());
        setDateTo("");
        setClientIds(clientOptions.map((o) => o.value));
        setDepartmentIds(deptOptions.map((o) => o.value));
        setDietIds(dietOptions.map((o) => o.value));
        setMealTypeIds(mealTypeOptions.map((o) => o.value));
        setKitchenIds(kitchenOptions.map((o) => o.value));
        setStatusMulti(statusOptions.map((o) => o.value));
    };

    /** ===== approve/reject ===== */
    const applyDecision = async (afterId: number, action: "approve" | "reject") => {
        setError(null);

        setActionBusy((prev) => ({ ...prev, [afterId]: action }));
        try {
            const payload = await postJsonAny(apiUrl(SET_STATUS_PATH), { after_id: afterId, action });
            const obj = unwrapObject(payload);

            const newStatus = obj?.status;
            const newUpdatedAt = obj?.updated_at;

            // update local rows immediately
            setRows((prev) =>
                prev.map((r) =>
                    r.after_id === afterId
                        ? {
                            ...r,
                            status: newStatus || (action === "approve" ? "approved" : "rejected"),
                            updated_at: newUpdatedAt || r.updated_at,
                        }
                        : r
                )
            );

            // natychmiast odśwież tabelę ilości posiłków (remount komponentu)
            setMealsTableKey((k) => k + 1);
        } catch (e: any) {
            setError(e?.message || "Nie udało się zmienić statusu");
        } finally {
            setActionBusy((prev) => ({ ...prev, [afterId]: null }));
        }
    };

    const pickedFilters = useMemo(() => {
        const applyClient = shouldApply(clientIds, clients.length);
        const applyDept = shouldApply(departmentIds, departments.length);
        const applyDiet = shouldApply(dietIds, diets.length);
        const applyMeal = shouldApply(mealTypeIds, mealTypes.length);
        const applyKitchen = shouldApply(kitchenIds, kitchens.length);

        return {
            dateFrom,
            dateTo,
            clientIds: applyClient ? (clientIds.map(Number) as number[]) : undefined,
            globalDepartmentIds: applyDept ? (departmentIds.map(Number) as number[]) : undefined,
            globalDietIds: applyDiet ? (dietIds.map(Number) as number[]) : undefined,
            globalMealTypeIds: applyMeal ? (mealTypeIds.map(Number) as number[]) : undefined,
            kitchenIds: applyKitchen ? (kitchenIds.map(Number) as number[]) : undefined,
        };
    }, [
        dateFrom,
        dateTo,
        clientIds,
        departmentIds,
        dietIds,
        mealTypeIds,
        kitchenIds,
        clients.length,
        departments.length,
        diets.length,
        mealTypes.length,
        kitchens.length,
    ]);

    return (
        <Layout pageKey="diet.meals_approval">
            <Breadcrumb items={[{ label: "Dietetyka" }, { label: "Zamówienia i akceptacja" }]} />

            {/* Header + refresh select (TOP RIGHT) */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Zamówienia i akceptacja</h1>
                    <p className="mt-1 text-muted-foreground">
                        Panel centralny: akceptacja korekt po czasie + tabela ilości posiłków.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs text-muted-foreground">Auto-refresh</span>
                    <RefreshSelect valueSec={refreshSec} onChangeSec={setRefreshSec} />
                </div>
            </div>

            {/* GLOBAL FILTERS */}
            <Card className="mb-6">
                <div className="border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtry globalne
                    </h2>

                    <Button variant="outline" className="gap-2" onClick={resetFilters}>
                        <X className="h-4 w-4" />
                        Reset (wszystkie)
                    </Button>
                </div>

                <div className="p-4">
                    {/* ✅ Kuchnia obok Posiłku: ustawiamy md:grid-cols-8 */}
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                        <div className="md:col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Data posiłku (od / do)</p>
                            <div className="flex gap-2">
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>

                        <MultiSelectDropdown
                            label="Szpital / Klient (multi)"
                            options={clientOptions}
                            selected={clientIds}
                            onChange={setClientIds}
                            placeholder="Wybierz klientów"
                            defaultAllSelected
                        />

                        <MultiSelectDropdown
                            label="Oddział (multi)"
                            options={deptOptions}
                            selected={departmentIds}
                            onChange={setDepartmentIds}
                            placeholder="Wybierz oddziały"
                            defaultAllSelected
                        />

                        <MultiSelectDropdown
                            label="Dieta (multi)"
                            options={dietOptions}
                            selected={dietIds}
                            onChange={setDietIds}
                            placeholder="Wybierz diety"
                            defaultAllSelected
                        />

                        {/* ✅ Posiłek */}
                        <MultiSelectDropdown
                            label="Posiłek (multi)"
                            options={mealTypeOptions}
                            selected={mealTypeIds}
                            onChange={setMealTypeIds}
                            placeholder="Wybierz posiłki"
                            defaultAllSelected
                        />

                        {/* ✅ Kuchnia obok Posiłku (ta sama linia) */}
                        <MultiSelectDropdown
                            label="Kuchnia (multi)"
                            options={kitchenOptions}
                            selected={kitchenIds}
                            onChange={setKitchenIds}
                            placeholder="Wybierz kuchnie"
                            defaultAllSelected
                        />
                    </div>

                </div>
            </Card>

            {/* AFTER CUTOFF APPROVAL */}
            <Card className="mb-6">
                <div className="border-b p-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Korekty po czasie – do akceptacji</h2>
                        <p className="text-sm text-muted-foreground">
                            <span className="ml-2 text-xs text-muted-foreground">(auto-odświeżanie: co {refreshSec}s)</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Pending: <span className="font-medium text-foreground">{loadingRows ? "…" : pendingCount}</span>
                        </p>
                    </div>

                    <div className="w-[360px]">
                        <MultiSelectDropdown
                            label="Status korekty (multi)"
                            options={statusOptions}
                            selected={statusMulti}
                            onChange={setStatusMulti}
                            placeholder="Wybierz statusy"
                            defaultAllSelected
                        />
                    </div>
                </div>

                <div className="p-4">
                    {loadingRows ? (
                        <div className="text-sm text-muted-foreground">Ładowanie korekt…</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Data</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Szpital</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Oddział</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Dieta</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Posiłek</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Ilość</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Różnica</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Zmiana</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Cutoff</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">+min</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-foreground">Status</th>
                                    <th className="pb-3 text-right text-xs font-semibold text-foreground">Akcje</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredRows.map((r) => {
                                    const before = r.qty_before ?? 0;
                                    const after = r.qty_after ?? 0;
                                    const d = (r.qty_diff ?? (after - before)) as number;

                                    const isUp = d > 0;
                                    const isDown = d < 0;

                                    const client = clientsMap[r.client_id];

                                    // global names for tooltip
                                    const globalDept = r.global_department_id ? departmentsMap[r.global_department_id] : null;
                                    const globalDiet = r.global_diet_id ? dietsMap[r.global_diet_id] : null;
                                    const globalMeal = r.global_meal_type_id ? mealTypesMap[r.global_meal_type_id] : null;

                                    // client names for display
                                    const deptLabel =
                                        clientDeptNames[key2(r.client_id, r.client_department_id)] ??
                                        (r.client_department_id ? `#${r.client_department_id}` : "—");

                                    const dietLabel =
                                        clientDietNames[key2(r.client_id, r.client_diet_id)] ??
                                        (r.client_diet_id ? `#${r.client_diet_id}` : "—");

                                    const mealLabel =
                                        clientMealTypeNames[key2(r.client_id, r.client_meal_type_id)] ??
                                        (r.client_meal_type_id ? `#${r.client_meal_type_id}` : "—");

                                    const deptTitle = `Globalna nazwa: ${globalDept?.name ?? "—"} (Global ID: ${
                                        r.global_department_id ?? "—"
                                    }) | Klientowe ID: ${r.client_department_id ?? "—"}`;
                                    const dietTitle = `Globalna nazwa: ${globalDiet?.name ?? "—"} (Global ID: ${
                                        r.global_diet_id ?? "—"
                                    }) | Klientowe ID: ${r.client_diet_id ?? "—"}`;
                                    const mealTitle = `Globalna nazwa: ${globalMeal?.name ?? "—"} (Global ID: ${
                                        r.global_meal_type_id ?? "—"
                                    }) | Klientowe ID: ${r.client_meal_type_id ?? "—"}`;

                                    const canAct = r.status === "pending_approval";
                                    const busy = actionBusy[r.after_id];
                                    const disableApprove = !canAct || !!busy;
                                    const disableReject = !canAct || !!busy;

                                    return (
                                        <tr key={r.after_id} className="border-b last:border-0">
                                            <td className="py-3 text-sm text-foreground whitespace-nowrap">{r.meal_date}</td>

                                            <td className="py-3 text-sm text-foreground">
                                                <span title={client?.full_name}>{client?.short_name ?? `#${r.client_id}`}</span>
                                            </td>

                                            <td className="py-3 text-sm text-foreground" title={deptTitle}>
                                                {deptLabel}
                                            </td>
                                            <td className="py-3 text-sm text-foreground" title={dietTitle}>
                                                {dietLabel}
                                            </td>
                                            <td className="py-3 text-sm text-foreground" title={mealTitle}>
                                                {mealLabel}
                                            </td>

                                            <td className="py-3 text-sm text-foreground whitespace-nowrap">
                                                {r.qty_before ?? "—"} → {r.qty_after}
                                            </td>

                                            <td className="py-3 text-sm whitespace-nowrap">
                          <span
                              className={cn(
                                  "inline-flex items-center gap-1",
                                  d === 0 ? "text-muted-foreground" : d > 0 ? "text-emerald-600" : "text-rose-600"
                              )}
                          >
                            {isUp && <ArrowUpRight className="h-4 w-4" />}
                              {isDown && <ArrowDownRight className="h-4 w-4" />}
                              {d > 0 ? `+${d}` : `${d}`}
                          </span>
                                            </td>

                                            <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">{r.updated_at}</td>
                                            <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">{hhmm(r.cutoff_at)}</td>
                                            <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                                                {r.minutes_after_cutoff ?? "—"}
                                            </td>

                                            <td className="py-3 text-sm whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded text-xs font-medium", statusBadgeClass(r.status))}>
                            {statusLabel(r.status)}
                          </span>
                                            </td>

                                            <td className="py-3 text-right whitespace-nowrap">
                                                <div className="inline-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="gap-2"
                                                        disabled={disableApprove}
                                                        onClick={() => applyDecision(r.after_id, "approve")}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        {busy === "approve" ? "Akceptuję..." : "Akceptuj"}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        disabled={disableReject}
                                                        onClick={() => applyDecision(r.after_id, "reject")}
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {busy === "reject" ? "Odrzucam..." : "Odrzuć"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!filteredRows.length && (
                                    <tr>
                                        <td className="py-6 text-center text-muted-foreground" colSpan={12}>
                                            Brak wyników dla wybranych filtrów
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </Card>

            {/* MEALS TABLE (widok globalny) */}
            <div className="inline-flex rounded-lg border bg-background p-1">
                <button
                    className={cn(
                        "px-3 py-1.5 text-sm rounded-md",
                        mealsView === "summary" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                    onClick={() => setMealsView("summary")}
                >
                    Widok ogólny
                </button>
                <button
                    className={cn(
                        "px-3 py-1.5 text-sm rounded-md",
                        mealsView === "details" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                    onClick={() => setMealsView("details")}
                >
                    Widok szczegółowy
                </button>
            </div>

            {/* === Content: komponent sam jest kartą === */}
            {mealsView === "summary" ? (
                <MealsPickedGlobalTotalsTable
                    key={`summary-${mealsTableKey}`}
                    filters={pickedFilters}
                    refreshMs={refreshMs}
                    limit={50000}
                    title="Suma posiłków (agregacja – wszystkie oddziały/klienci)"
                />
            ) : (
                <MealsPickedGlobalTable
                    key={`details-${mealsTableKey}`}
                    refreshMs={refreshMs}
                    filters={pickedFilters}
                />
            )}


        </Layout>
    );
};

export default MealsApproval;
