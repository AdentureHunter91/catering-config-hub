import { API_BASE } from "./apiBase";

const API = `${API_BASE}/measurement_units`;

export type MeasurementUnit = {
  id: number;
  symbol: string;
  name: string;
  type: "mass" | "volume" | "piece";
  base_unit_symbol: string | null;
  to_base_factor: number;
  sort_order: number;
  status: "active" | "archived";
};

export async function getMeasurementUnits(status: string = "active"): Promise<MeasurementUnit[]> {
  const r = await fetch(`${API}/list.php?status=${status}`);
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to load units");
  return j.data || [];
}

export async function saveMeasurementUnit(unit: Partial<MeasurementUnit> & { symbol: string; name: string }): Promise<{ id: number }> {
  const r = await fetch(`${API}/save.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(unit),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to save unit");
  return j.data;
}

export async function deleteMeasurementUnit(id: number): Promise<void> {
  const r = await fetch(`${API}/delete.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to delete unit");
}
