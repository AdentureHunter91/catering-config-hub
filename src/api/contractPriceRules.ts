import { API_BASE } from "./apiBase";

const API = `${API_BASE}/contracts/price_rules`;

export type VariantColumn = {
  key: string;
  label: string;
  data_type: "number" | "text" | "json" | "date" | "bool";
};

export type ContractPriceRuleRow = {
  id: number;
  contract_id: number;
  name: string;
  client_meal_type_id: number | null;
  client_diet_id: number | null;
  client_department_id: number | null;
  variant_key: string | null;
  variant_operator: string | null;
  variant_value: string | null;
  amount: number;
  use_date_range: number;
  valid_from: string | null;
  valid_to: string | null;
};

export async function getContractPriceRules(contractId: number) {
  const r = await fetch(`${API}/list.php?contract_id=${contractId}`);
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to load price rules");
  return (j.data || []) as ContractPriceRuleRow[];
}

export async function saveContractPriceRule(payload: any) {
  const r = await fetch(`${API}/save.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to save price rule");
  return j.data as ContractPriceRuleRow;
}

export async function deleteContractPriceRule(id: number) {
  const form = new FormData();
  form.append("id", String(id));
  const r = await fetch(`${API}/delete.php`, {
    method: "POST",
    body: form,
  });
  return r.json();
}

export async function getMealVariantColumns() {
  const r = await fetch(`${API}/variant_columns.php`);
  const j = await r.json();
  if (!j.success) throw new Error(j.error || "Failed to load variant columns");
  return (j.data || []) as VariantColumn[];
}
