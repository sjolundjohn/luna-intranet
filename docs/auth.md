# nightluna.com authentication

How the intranet gates access and identifies callers. Settled 2026-06-12.

## TL;DR

The site is **staff-only**, but Cloudflare Access is no longer the gate. A
first-party, HMAC-signed session cookie (`nl_session`) set by a Pages
middleware is the gate. Access does exactly one thing: run Google SSO at
`/auth/login`. Users authenticate **once per ~12h**, not on every navigation.

## Why it's built this way

When Cloudflare Access gated the whole apex, it never worked reliably:

- Access stores its `CF_Authorization` token as a cookie on the **team domain**
  (`lunadiabetes.cloudflareaccess.com`), then tries to mirror it onto
  `nightluna.com`. Modern browsers' third-party-cookie / bounce-tracking
  protections drop that mirrored cookie — confirmed in normal *and* incognito
  windows, on a dedicated app, with every SameSite setting.
- Result: every navigation silently re-ran the cross-origin login dance.
  Invisible for single-Google-account users; an account-picker prompt on
  **every click** for multi-account users; and fatal for same-origin XHR — the
  comment `POST` got 302'd to the login page and silently failed.

A wildcard in the Access app (`*.nightluna.com`) also blocks Access's
cookie-setting handshake for the apex. Splitting the apex out didn't fix the
underlying third-party-cookie problem. So we stopped depending on Access's
cookie entirely and issue our own first-party one.

## The Cloudflare Access setup

Three applications on the account (most-specific match wins):

| Application | Hostname / path | Policy | Why |
| --- | --- | --- | --- |
| `Luna Workers` (wildcard) | `*.nightluna.com`, `connect.`, `*.dev.` | **Allow** `@lunadiabetes.com` (Luna Staff) | Gates the internal Workers (fleet-api, router, ai-proxy…). Untouched by this design. |
| Apex | `nightluna.com` (no path) | **Bypass / Everyone** (`Intranet Bypass`) | Access stands aside; the middleware is the real gate. |
| Login | `nightluna.com` / `auth/login` | **Allow** `@lunadiabetes.com` (Luna Login) | The one path that runs Google SSO and forwards verified identity to the origin. |

> ⚠️ These three apps are configured **by hand in the Zero Trust dashboard** and
> are not yet in Terraform — they're IaC drift. If/when Access moves under
> Terraform (`Luna_AI_Workforce/docs/cf-access-terraform-plan.md`), model all
> three plus the session design.

To grant a new colleague access: add their email to the **Login app's** Allow
policy. To revoke: remove it there (their `nl_session` expires within 12h).

## The session flow

```
Unauthenticated visit to nightluna.com/<anything>
  → middleware: no valid nl_session
    → 302 /auth/login?redirect=<original path>
      → Access challenges (Google SSO, @lunadiabetes.com)
        → /auth/login function mints nl_session, 302 back to <original path>
          → middleware: nl_session valid → request proceeds
```

Once `nl_session` is set, every navigation and every same-origin XHR carries it
(first-party, `SameSite=Lax`), so there are no more bounces.

## Code map

- **[`functions/_middleware.ts`](../functions/_middleware.ts)** — the gate. Runs
  on every request. Verifies `nl_session`; document GETs without it redirect to
  `/auth/login`, everything else gets `401`. Forwards the verified email to
  downstream functions via the `x-nl-verified-email` header (stripped from
  inbound requests first, so it can't be spoofed). Sliding-refreshes the cookie
  past half its TTL. `/auth/login` is the only path it lets through unguarded.
- **[`functions/auth/login.ts`](../functions/auth/login.ts)** — the only
  Access-gated path. Reads Access's verified identity, mints `nl_session` (12h),
  redirects back (same-origin redirect guard).
- **[`functions/api/_session.ts`](../functions/api/_session.ts)** — HMAC
  sign/verify (`SESSION_SECRET`), cookie helpers, and `getVerifiedEmail` (cookie
  first, Access-header fallback). `SESSION_COOKIE = "nl_session"`.
- **[`functions/api/_lib.ts`](../functions/api/_lib.ts)** — `getCallerEmail`
  trusts `x-nl-verified-email` first (set by the middleware), then Access
  headers / IAP / legacy fallbacks.

### Gotcha: never double-wrap a body-bearing request

The middleware injects identity by rewriting the request. It must do this with a
**single** `new Request(ctx.request)` (mutable headers, body carried through).
Wrapping a `POST`/`PATCH` request twice strips its body, which silently breaks
comment posting and resolving. Probe identity on a separate **bodyless** request.

## Secret

`SESSION_SECRET` — a random HMAC key, set as a Pages **project secret**:

```bash
openssl rand -base64 48 | npx wrangler pages secret put SESSION_SECRET --project-name=luna-intranet
```

Rotating it invalidates all live sessions (everyone re-auths once). No code
change needed.

## Local dev

There's no Access and no `nl_session` cookie locally, so the middleware/API
can't resolve an identity — authenticated writes `401`. Seed D1 rows directly
for testing (see [`docs/ux-review-setup.md`](./ux-review-setup.md)).

## Deploy

CI deploy is broken (invalid `CLOUDFLARE_API_TOKEN`); deploy by hand:

```bash
npm run build
npx wrangler pages deploy dist --project-name=luna-intranet --branch=main
```
