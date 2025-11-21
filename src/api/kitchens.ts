// src/api/kitchens.ts

// Tutaj NIE ma folderu "kitchens", więc korzystamy z istniejącego pliku
// /Config/api/list_kitchens.php

export type Kitchen = {
    id: number;
    name: string;
};

export async function getKitchens(): Promise<Kitchen[]> {
    const r = await fetch("/Config/api/contracts/list_kitchens.php");
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load kitchens");
    }

    return j.data || [];
}
