// src/api/apiBase.ts
const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" albo "/Config"
const apiOverride = import.meta.env.VITE_API_BASE?.trim();
const authOverride = import.meta.env.VITE_AUTH_BASE?.trim();
const apiBase = apiOverride ? apiOverride.replace(/\/$/, "") : `${base}/api`;
const authFromApi = apiOverride ? apiOverride.replace(/\/api\/?$/, "") : "";
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const authBase = authOverride
  ? authOverride.replace(/\/$/, "")
  : authFromApi || browserOrigin;

export const API_BASE = apiBase;
export const AUTH_BASE = authBase;
export const buildApiUrl = (path: string) => `${API_BASE}/${path.replace(/^\//, "")}`;
export const buildAuthUrl = (path: string) => `${AUTH_BASE}/${path.replace(/^\//, "")}`;
