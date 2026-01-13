// src/api/apiBase.ts
const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" albo "/Config"
export const API_BASE = `${base}/api`;