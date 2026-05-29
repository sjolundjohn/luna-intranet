/**
 * GET /api/whoami — the caller's verified CF Access email, a name guess, and
 * whether they're an AI admin. Used by the UX Review client (exclude own
 * activity from notifications, pre-fill the name prompt) and the Kegerator
 * (show the admin-only "Make Order" button). No DB.
 */
import { getCallerEmail, isCallerAdmin } from "./_lib";

export const onRequestGet: PagesFunction = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  return new Response(
    JSON.stringify({
      email,
      nameGuess: email ? email.split("@")[0] : "",
      isAdmin: email ? isCallerAdmin(email) : false,
    }),
    { headers: { "content-type": "application/json", "cache-control": "no-store" } },
  );
};
