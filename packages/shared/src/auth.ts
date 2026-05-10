/**
 * CF Access JWT extraction. Every Worker that fronts user traffic calls
 * `extractActor(request)` to get a typed `ActorIdentity` it can trust.
 *
 * What this does (Phase 0 cut):
 *   1. Reads `cf-access-authenticated-user-email` (set by Access).
 *   2. Reads `cf-access-groups` if present (comma-separated list).
 *   3. Returns `{ email, groups, verified: true }` when the email
 *      header is present, or a `verified: false` fallback when not
 *      (local dev, or a request bypassing Access — which itself
 *      shouldn't happen but defense-in-depth).
 *
 * What this does NOT do yet:
 *   - It does not cryptographically verify the `Cf-Access-Jwt-Assertion`
 *     JWT signature against Cloudflare's JWKS. CF Access strips the JWT
 *     for traffic that doesn't come through an Access app, so for any
 *     Worker behind Access, the email header is itself authoritative.
 *     For Workers exposed publicly (none today), we MUST add JWT
 *     verification before relying on this. Tracked on /roadmap as a
 *     Phase 0 hardening task.
 *
 * The `requireRole(actor, roles)` helper centralizes 403 logic so no
 * Worker has to re-implement role checks.
 */
import type { ActorIdentity, Role } from "./types.ts";

const KNOWN_ROLES = new Set<Role>([
  "employee",
  "manager",
  "ai-admin",
  "phi-authorized",
]);

const isRole = (s: string): s is Role => KNOWN_ROLES.has(s as Role);

export function extractActor(request: Request): ActorIdentity {
  const email = (
    request.headers.get("cf-access-authenticated-user-email") ?? ""
  )
    .trim()
    .toLowerCase();

  // CF Access can be configured to forward groups as a header. Format is
  // implementation-defined — we accept comma-separated; we ignore unknown
  // group names rather than throwing, so adding a new Workspace group
  // can't crash a Worker before we ship matching code.
  const rawGroups = (request.headers.get("cf-access-groups") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const groups: Role[] = rawGroups.filter(isRole);

  // Every Lunite gets the default `employee` role implicitly. Higher roles
  // require explicit Workspace group membership.
  if (email && !groups.includes("employee")) groups.push("employee");

  return {
    email: email || "unknown",
    groups,
    verified: Boolean(email),
  };
}

/**
 * Returns null on success; returns a Response (403) when the actor lacks
 * any of the allowed roles. Use as: `const fail = requireRole(actor, allowed); if (fail) return fail;`
 */
export function requireRole(
  actor: ActorIdentity,
  allowed: readonly Role[],
): Response | null {
  if (!actor.verified) {
    return new Response("Unauthenticated", {
      status: 401,
      headers: { "content-type": "text/plain" },
    });
  }
  const ok = allowed.some((r) => actor.groups.includes(r));
  if (ok) return null;
  return new Response(
    `Forbidden: requires one of [${allowed.join(", ")}]`,
    { status: 403, headers: { "content-type": "text/plain" } },
  );
}
