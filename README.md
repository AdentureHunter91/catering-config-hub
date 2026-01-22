# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d017e342-c02f-476a-94a1-a72ec0222267

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d017e342-c02f-476a-94a1-a72ec0222267) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Local development (PHP + Vite)

Run the backend (PHP):

```sh
php -S 127.0.0.1:8000 -t public
```

Run the frontend (Vite):

```sh
npm run dev
```

Open the app:
- http://127.0.0.1:8080

## MCP quick start (5 lines)
1) Fill `MYSQL_*` in `.env` (use read-only `mcp_ro`).
2) Start PHP + Vite (`dev: all` task or two terminals).
3) Point your MCP client to `.vscode/mcp.json`.
4) Check MySQL MCP by listing schemas or running a `SELECT`.
5) Check Vite MCP at `http://127.0.0.1:8080/__mcp/sse` (HTTP 200).

## MCP lifecycle (when you return to the project)
- `mysql-ro`, `docs`, `playwright` are started by VS Code on demand when you select them or use them in Chat.
- `vite` MCP works only while `npm run dev` is running (SSE endpoint).
- If Playwright auth expires, regenerate `.auth/storageState.json`.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Base paths and API endpoints

By default, the app assumes it is served from the domain root and calls `/api`.
If you deploy it under a subpath (e.g. `/Config`) or need to point the frontend
to a different backend (e.g. Lovable preview or local dev), set the following
environment variables before building or running:

```sh
# Base URL for the frontend router and assets
VITE_BASE=/

# Optional absolute or relative API base (overrides VITE_BASE)
VITE_API_BASE=https://your-domain.example.com/api

# Optional auth/login base (overrides auto-detection from API base)
# Use an absolute URL if auth lives on a different origin.
VITE_AUTH_BASE=https://your-domain.example.com
```

> ⚠️ If you load the frontend from a different origin (e.g. Lovable preview) and
> call `Login/*` on your backend, your backend must send CORS headers allowing
> that preview origin and enable credentials (cookies) for session-based auth.
> Example headers:
> - `Access-Control-Allow-Origin: https://<preview-host>`
> - `Access-Control-Allow-Credentials: true`
> - `Access-Control-Allow-Headers: Content-Type`
> - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
> Also ensure cookies are set with `SameSite=None; Secure` if you rely on them.

When serving the built SPA from an Apache host, ensure the server rewrites
unknown routes to `index.html` (see `public/.htaccess`) so deep links like
`/kontrakty/3` work on refresh.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d017e342-c02f-476a-94a1-a72ec0222267) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
