export type MealType = {
    id: number;
    name: string;
    short_name: string;
    sort_order: number;
    description?: string | null;
};

export async function getMealTypes(): Promise<MealType[]> {
    const r = await fetch("/Config/api/meal_types/list.php");
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load meal types");
    return j.data || [];
}

export async function getMealType(id: number): Promise<MealType> {
    const r = await fetch(`/Config/api/meal_types/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load meal type");
    return j.data;
}

export async function saveMealType(data: MealType): Promise<any> {
    const r = await fetch("/Config/api/meal_types/save.php", {
        method: "POST",
        body: JSON.stringify(data),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to save meal type");

    return j.data;
}

export async function deleteMealType(id: number): Promise<any> {
    const r = await fetch("/Config/api/meal_types/delete.php", {
        method: "POST",
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete meal type");

    return j.data;
}
