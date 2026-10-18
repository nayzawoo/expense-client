# Expense Client

Angular frontend for the household expense API (`expense-api`).

## Stack

- Angular 22
- PrimeNG 22 (Aura theme via `@primeuix/themes`) + Tailwind CSS 4 (`tailwindcss-primeui`)
- `@ngx-translate` for English (`en`) and Myanmar (`my`)
- Session cookie auth + CSRF against Spring (`expense-session`)

## Quick start

Requires **Node.js ≥ 22.22.3**.

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

`npm start` uses `proxy.conf.json` to forward `/api` to `http://localhost:8080` (local `expense-api`).

### Scripts

| Command | Description |
| --- | --- |
| `npm start` | Dev server + API proxy |
| `npm run build` | Production build |
| `npm test` | Unit tests (placeholder) |

## Environment

| File | Role |
| --- | --- |
| `src/environments/environment.development.ts` | Local `ng serve` |
| `src/environments/environment.ts` | Production build |

| Setting | Description |
| --- | --- |
| `apiBaseUrl` | API origin **without** trailing slash. Leave empty for same-origin / proxy. Example: `https://api.example.com` |
| `primeNgLicenseKey` | Optional PrimeUI community/commercial license key for PrimeNG 22 |
| `defaultLanguage` | `en` or `my` |

Language choice is remembered in `localStorage` under `expense_lang`.

## Auth / API target

This client talks to **`expense-api`** (Spring Boot), not the Laravel `expense` token API.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/auth/csrf` | Bootstrap CSRF token + header name |
| `POST` | `/api/v1/auth/login` | Session cookie; requires CSRF |
| `GET` | `/api/v1/auth/me` | Current user |
| `POST` | `/api/v1/auth/logout` | End session; requires CSRF |
| `GET` | `/api/v1/household` | Active household (id, currency, timezone) |

Writes use cookie credentials and CSRF headers. Do not store session tokens in `localStorage`.

## App structure

```
src/app/
  core/           # auth, HTTP interceptors, i18n, API helpers
  shared/         # reusable UI helpers
  layout/         # authenticated shell
  features/
    auth/         # login + forced-password shell
    dashboard/    # lazy placeholder (parallel feature branch)
    expenses/     # lazy placeholder (parallel feature branch)
    categories/   # lazy placeholder (parallel feature branch)
```

## Cursor MCP (PrimeNG docs)

Committed at `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "primeng": {
      "command": "npx",
      "args": ["-y", "@primeng/mcp"]
    }
  }
}
```

Cloud Agents still need the same server enabled in the Agents MCP UI.
