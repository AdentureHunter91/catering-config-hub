// src/api/kitchensAll.ts

const API = "/Config/api/kitchens";

export async function getKitchenAll(id: number) {
    const r = await fetch(`${API}/get_all.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function saveKitchenAll(payload: any) {
    const r = await fetch(`${API}/save_all.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
