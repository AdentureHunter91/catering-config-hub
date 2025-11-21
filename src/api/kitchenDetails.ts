// src/api/kitchenDetails.ts

const API = "/Config/api/kitchens";

export type KitchenPayload = {
    id?: number;
    name: string;
    city: string;
    address: string;
    nip: string;
};

export async function getKitchen(id: number): Promise<KitchenPayload> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load kitchen");
    }

    return j.data;
}

export async function saveKitchen(
    payload: KitchenPayload
): Promise<KitchenPayload> {
    const r = await fetch(`${API}/save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to save kitchen");
    }

    // zakładamy, że save.php zwraca pełny rekord kuchni
    return j.data;
}
