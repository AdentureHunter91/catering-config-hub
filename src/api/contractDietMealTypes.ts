// src/api/contractDietMealTypes.ts
import { API_BASE } from "./apiBase";


const API = `${API_BASE}/contracts/diet_meal_types`;

/**
 * Pobiera pełną matrycę połączeń dieta–posiłek.
 */
export async function getContractDietMealTypes(contractId: number) {
    const r = await fetch(`${API}/list.php?contract_id=${contractId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data; // array: { contract_id, client_diet_id, client_meal_type_id, is_active }
}

/**
 * Ustawia ON/OFF dla kombinacji dieta–posiłek.
 */
export async function updateContractDietMealType(payload: {
    contract_id: number;
    client_diet_id: number;
    client_meal_type_id: number;
    is_active: number;
}) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
