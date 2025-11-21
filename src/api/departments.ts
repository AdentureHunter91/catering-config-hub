export type Department = {
    id: number;
    name: string;
    short_name: string;
    description?: string | null;
};

export async function getDepartments(): Promise<Department[]> {
    const r = await fetch("/Config/api/departments/list.php");
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load departments");
    return j.data || [];
}

/* --- NOWE FUNKCJE (bezpieczne) --- */

export async function getDepartment(id: number): Promise<Department> {
    const r = await fetch(`/Config/api/departments/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load department");
    return j.data;
}

export async function saveDepartment(data: Department): Promise<any> {
    const r = await fetch("/Config/api/departments/save.php", {
        method: "POST",
        body: JSON.stringify(data),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to save department");

    return j.data;
}

export async function deleteDepartment(id: number): Promise<any> {
    const r = await fetch("/Config/api/departments/delete.php", {
        method: "POST",
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete department");

    return j.data;
}
