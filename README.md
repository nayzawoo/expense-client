# Expense Client

Angular frontend for the household expense API (`expense-api`).

## Stack

- Angular 22
- Tailwind CSS 4 + project-owned reusable UI components (semantic HTML; Angular CDK available for complex interactions)
- `@ngx-translate` for English (`en`) and Myanmar (`my`)
- Session cookie auth + CSRF against Spring (`expense-session`)
- Progressive Web App (`@angular/service-worker`) — installable online app shell

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
| `npm run build` | Production build (includes service worker + `ngsw.json`) |
| `npm test` | Unit tests (placeholder) |

## Progressive Web App

Production builds register Angular’s service worker (`ngsw-worker.js`) from `ngsw-config.json`. Development (`ng serve`) does **not** enable the worker (`isDevMode()`).

### Install / verify

1. `npm run build` then serve the `dist/expense-client/browser` output over **HTTPS** (or `localhost`).
2. Open the app in Chrome/Edge → Application → Manifest / Service Workers.
3. Use “Install app” / Add to Home Screen when the browser offers it.

Manifest: `public/manifest.webmanifest` (copied to the build root). Icons live under `public/icons/`.

### Caching model (online PWA)

| Cached | Not cached |
| --- | --- |
| App shell: `index.html`, hashed JS/CSS, favicon, manifest | `/api/**` (session, CSRF, financial JSON) |
| Static assets under `/assets/**` and `/icons/**` (including i18n JSON) | Authenticated or sensitive API responses |

There are **no** `dataGroups` in `ngsw-config.json`, so the worker never runtime-caches API traffic. Navigation fallback excludes `/api/**` so API paths are not rewritten to `index.html`.

**Tradeoffs**

- Offline: the shell (and static assets) may load; **API calls still require the network**. There is no offline write queue or replay.
- Session/CSRF stay on HttpOnly cookies + request headers; the service worker does not store credentials or inject tokens.
- Cached i18n/static files can be briefly stale until the next service-worker update cycle after a deploy.
- iOS standalone PWAs use the browser cookie jar for the install origin — same-origin session rules still apply; there is no localStorage session fallback.

This is an **online** PWA: installability and faster repeat loads of the shell, not offline-first finance.

## Environment

| File | Role |
| --- | --- |
| `src/environments/environment.development.ts` | Local `ng serve` |
| `src/environments/environment.ts` | Production build |

| Setting | Description |
| --- | --- |
| `apiBaseUrl` | API origin **without** trailing slash. Leave empty for same-origin / proxy. Example: `https://api.example.com` |
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
  shared/         # reusable UI components, icons, pipes
  layout/         # authenticated shell
  features/
    auth/         # login + forced password change
    dashboard/    # household overview and reports
    expenses/     # expense list / create / edit / void
    incomes/      # income list / create / void
    transfers/    # transfer list / create / void
    categories/   # category list and admin form
    accounts/     # account balances list + admin create
```
