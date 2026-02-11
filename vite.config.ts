import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteMcp } from "vite-plugin-mcp";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBase = env.VITE_BASE || "/";
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

  return {
    base,
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      mode === "development" && ViteMcp(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
