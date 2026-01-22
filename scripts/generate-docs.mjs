import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";

const repoRoot = process.cwd();
const docPath = path.join(repoRoot, "DOCS.md");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
};

const toPosix = (p) => p.replace(/\\/g, "/");
const rel = (p) => toPosix(path.relative(repoRoot, p));

const packageJson = readJson(path.join(repoRoot, "package.json"));
const deps = packageJson.dependencies || {};
const devDeps = packageJson.devDependencies || {};

const stack = [
  "Vite",
  "React",
  "TypeScript",
  "PHP",
  "MySQL (remote)",
  deps["tailwindcss"] || devDeps["tailwindcss"] ? "Tailwind CSS" : null,
].filter(Boolean);

const srcFiles = walk(path.join(repoRoot, "src"))
  .filter((p) => /\.(ts|tsx|js|jsx)$/.test(p));

const loadText = (p) => readFileSync(p, "utf8");

const collectEndpoints = (baseDir, baseUrl) => {
  if (!statSync(baseDir, { throwIfNoEntry: false })) return [];
  const files = walk(baseDir).filter((p) => p.endsWith(".php"));
  return files.map((filePath) => {
    const relative = rel(filePath);
    const urlPath = `${baseUrl}/${toPosix(path.relative(baseDir, filePath))}`;
    const dirParts = toPosix(path.dirname(urlPath)).split("/");
    const dirName = dirParts[dirParts.length - 1];
    const fileName = path.basename(urlPath);
    let description = "";
    try {
      const text = loadText(filePath).split(/\r?\n/).slice(0, 5).join("\n");
      const m = text.match(/^\s*\/\/\s*(.+)$/m);
      if (m) description = m[1].trim();
    } catch {
      // ignore
    }
    const usedIn = [];
    for (const src of srcFiles) {
      const content = loadText(src);
      const hasFile = content.includes(fileName);
      const hasDir = dirName ? content.includes(`/${dirName}`) || content.includes(dirName) : false;
      if (hasFile && (hasDir || urlPath.includes("/Login/"))) {
        usedIn.push(rel(src));
      }
    }
    return {
      urlPath,
      fileName,
      description: description || "",
      usedIn: Array.from(new Set(usedIn)).slice(0, 8),
      source: relative,
    };
  });
};

const apiBase = path.join(repoRoot, "public", "api");
const loginBase = path.join(repoRoot, "public", "Login");

const apiEndpoints = collectEndpoints(apiBase, "/api");
const loginEndpoints = collectEndpoints(loginBase, "/Login");

const renderTable = (rows) => {
  const header = [
    "| Endpoint | Description | Called from |",
    "|---|---|---|",
  ];
  const lines = rows.map((r) => {
    const desc = r.description || "—";
    const used = r.usedIn.length ? r.usedIn.join(", ") : "—";
    return `| \`${r.urlPath}\` | ${desc} | ${used} |`;
  });
  return header.concat(lines).join("\n");
};

const doc = [
  "# Project Documentation",
  "",
  "## Stack",
  `- ${stack.join("\n- ")}`,
  "",
  "## Structure",
  "- `public/` (web root)",
  "- `public/api/` (PHP API endpoints)",
  "- `public/Login/` (login UI + auth endpoints)",
  "- `src/` (React app)",
  "",
  "## Auth",
  "- Frontend uses `Login/me.php` and `Login/access.php` (see `src/auth/authConfig.ts`).",
  "- Sessions are cookie-based (see `public/Login/*.php`).",
  "",
  "## DB",
  "- DB connection is configured in `public/api/db.php` (PDO MySQL).",
  "- Credentials are not documented here; they come from the server config.",
  "",
  "## API endpoints",
  renderTable(apiEndpoints),
  "",
  "## Login endpoints",
  renderTable(loginEndpoints),
  "",
  "_Note: endpoint usage is detected heuristically from `src/` and may require manual verification._",
  "",
].join("\n");

writeFileSync(docPath, doc, "utf8");
