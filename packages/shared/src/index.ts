/**
 * @luna/shared — public re-exports.
 *
 * Worker code should import from the deep entry points (e.g.
 * `@luna/shared/auth`) rather than the barrel where possible — keeps
 * Wrangler's bundler from pulling in unused modules.
 */
export * from "./types.ts";
export { extractActor, requireRole } from "./auth.ts";
export { writeAudit, sha256Hex, nowUtcIso } from "./audit.ts";
export { isKilled, setKilled } from "./killswitch.ts";
