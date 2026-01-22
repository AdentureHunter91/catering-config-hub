import { readFileSync, existsSync } from "fs";
import { spawn } from "child_process";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

process.env.ALLOW_INSERT_OPERATION ??= "false";
process.env.ALLOW_UPDATE_OPERATION ??= "false";
process.env.ALLOW_DELETE_OPERATION ??= "false";
process.env.ALLOW_DROP_TABLE_OPERATION ??= "false";

const isWin = process.platform === "win32";
const child = isWin
  ? spawn("cmd.exe", ["/c", "npx -y @benborla29/mcp-server-mysql@1.0.11"], {
      stdio: "inherit",
      env: process.env,
    })
  : spawn("npx", ["-y", "@benborla29/mcp-server-mysql@1.0.11"], {
      stdio: "inherit",
      env: process.env,
    });
child.on("exit", (code) => process.exit(code ?? 0));
