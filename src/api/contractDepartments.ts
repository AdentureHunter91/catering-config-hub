// src/api/contractDepartments.ts
import { API_BASE } from "./apiBase";


const API = `${API_BASE}/contracts/departments`;

export async function getContractDepartments(contractId: number) {
    const r = await fetch(`${API}/list.php?contract_id=${contractId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function updateContractDepartment(payload: {
    contract_id: number;
    client_department_id: number;
    is_active: number;
}) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
