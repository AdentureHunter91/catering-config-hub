// src/api/apiBase.ts
const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" albo "/Config"
const apiOverride = import.meta.env.VITE_API_BASE?.trim();
const apiBase = apiOverride ? apiOverride.replace(/\/$/, "") : `${base}/api`;

export const API_BASE = apiBase;
export const buildApiUrl = (path: string) => `${API_BASE}/${path.replace(/^\//, "")}`;
