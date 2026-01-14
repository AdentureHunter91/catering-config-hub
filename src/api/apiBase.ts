// src/api/apiBase.ts
const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" albo "/Config"
const apiOverride = import.meta.env.VITE_API_BASE?.trim();
const authOverride = import.meta.env.VITE_AUTH_BASE?.trim();
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const browserHost = typeof window !== "undefined" ? window.location.hostname : "";
const lovableHostSuffixes = [".lovable.app", ".lovable.dev", ".lovableproject.com"];
const isLovableHost = lovableHostSuffixes.some((suffix) =>
  browserHost.endsWith(suffix)
);
const lovableBackend = "https://srv83804.seohost.com.pl";
const appBase = base || "";
const apiBase = apiOverride
  ? apiOverride.replace(/\/$/, "")
  : isLovableHost
    ? `${lovableBackend}/api`
    : `${appBase}/api`;
const authFromApi = apiOverride ? apiOverride.replace(/\/api\/?$/, "") : "";
const authBase = authOverride
  ? authOverride.replace(/\/$/, "")
  : isLovableHost
    ? lovableBackend
    : authFromApi || browserOrigin;

export const API_BASE = apiBase;
export const AUTH_BASE = authBase;
export const buildApiUrl = (path: string) => `${API_BASE}/${path.replace(/^\//, "")}`;
export const buildAuthUrl = (path: string) => `${AUTH_BASE}/${path.replace(/^\//, "")}`;
