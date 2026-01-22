# Project agent notes (catering-config-hub)

## Local dev (PHP + Vite)
- PHP: `php -S 127.0.0.1:8000 -t public`
- Vite: `npm run dev` (default port 8080)
- App URL: `http://127.0.0.1:8080`
- API base: `/api` (proxied by Vite to PHP in dev)
- Auth base: `/Login` (proxied by Vite to PHP in dev)

## VS Code tasks
- `dev: php` starts PHP server
- `dev: vite` starts Vite
- `dev: all` runs both (default build task, `Ctrl+Shift+B`)

## Login location
- Login UI and endpoints are served from `public/Login/`.
- Do not keep a second copy in repo root.

## Backend + DB
- PHP entrypoints live under `public/api/*` and `public/Login/*`.
- DB config is hardcoded in `public/api/db.php` (PDO MySQL).
- If you see `could not find driver`, enable `pdo_mysql` in `php.ini`.

## Build / deploy
- `npm run build` outputs SPA to `dist/`.
- Ensure web root points to `public/`.
- Deploy `public/api` and `public/Login` alongside the built SPA.

## Notes
- `.env.production` keeps absolute API/AUTH base for hosting.
- `.env.development` leaves overrides empty for local dev.

## MCP (workspace)
- MCP config: `.vscode/mcp.json`.
- Servers: `mysql-ro`, `docs`, `playwright`, `vite`.
- `mysql-ro` loads DB creds from `.env` via `scripts/mcp-mysql.mjs` (read-only).
- `docs` uses `uvx` (path: `C:\Users\lukasz.graczyk\.local\bin\uvx.exe`).
- `vite` MCP works only when `npm run dev` is running.

## MCP troubleshooting
- If MCP servers don't appear: reload window (`Developer: Reload Window`).
- If `docs` fails: check `uvx` path and restart VS Code.
- If `mysql-ro` fails: confirm `.env` has `MYSQL_*` and workspace is opened at repo root.
- If `vite` MCP fails: ensure Vite dev server is running on `127.0.0.1:8080`.
