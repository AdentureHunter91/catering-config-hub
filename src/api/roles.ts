const API = "/Config/api/roles";

export async function getRoles() {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function getRole(id: number) {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function createRole(payload: any) {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function updateRole(payload: any) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function deleteRole(id: number) {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function setRolePermissions(roleId: number, permissionIds: number[]) {
    const r = await fetch(`${API}/setPermissions.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, permissionIds }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}


