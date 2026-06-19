/**
 * GET  /api/comments?screen_id=…[&design_version=…]  — list a screen's thread
 * POST /api/comments                                  — create a comment/reply
 */
import {
  type CommentsEnv,
  type CommentRow,
  toDTO,
  json,
  err,
  requireDb,
  getVerifiedEmail,
  LIMITS,
} from "./_shared";

export const onRequestGet: PagesFunction<CommentsEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const url = new URL(ctx.request.url);
  const screenId = url.searchParams.get("screen_id");
  if (!screenId) return err("missing 'screen_id' query param");

  const designVersion = url.searchParams.get("design_version");

  const query = designVersion
    ? db
        .prepare(
          "SELECT * FROM comments WHERE screen_id = ? AND design_version = ? ORDER BY created_at ASC",
        )
        .bind(screenId, designVersion)
    : db
        .prepare("SELECT * FROM comments WHERE screen_id = ? ORDER BY created_at ASC")
        .bind(screenId);

  const { results } = await query.all<CommentRow>();
  return json({ comments: (results ?? []).map(toDTO) });
};

/** Turn a verified email into a human display name: "jane.smith@x.com" → "Jane Smith". */
function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] || email;
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return name || local;
}

interface CreateBody {
  screenId?: string;
  body?: string;
  authorName?: string;
  anchorX?: number | null;
  anchorY?: number | null;
  parentId?: string | null;
  designVersion?: string | null;
}

export const onRequestPost: PagesFunction<CommentsEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const email = await getVerifiedEmail(ctx.request, ctx.env);
  if (!email) return err("unauthenticated", 401);

  let b: CreateBody;
  try {
    b = (await ctx.request.json()) as CreateBody;
  } catch {
    return err("invalid JSON body");
  }

  const screenId = (b.screenId ?? "").trim();
  const body = (b.body ?? "").trim();
  // Attribution is driven by the VERIFIED identity, Google-Docs-style: when a
  // real email is forwarded we derive the display name from it and ignore any
  // client-supplied name (no spoofing). Only the pre-identity fallback
  // (`gcp-iap:<uid>` — IAP forwards no email yet) accepts a typed name.
  const hasRealEmail = email.includes("@") && !email.startsWith("gcp-iap:");
  const authorName = hasRealEmail
    ? displayNameFromEmail(email)
    : (b.authorName ?? "").trim() || "Anonymous";

  if (!screenId || screenId.length > LIMITS.screenId) return err("invalid 'screenId'");
  if (!body) return err("comment body is empty");
  if (body.length > LIMITS.body) return err(`comment too long (max ${LIMITS.body} chars)`);
  if (authorName.length > LIMITS.name) return err("author name too long");

  // Anchor coords are optional but must be valid 0..1 fractions if present.
  const inFrac = (v: unknown): v is number =>
    typeof v === "number" && v >= 0 && v <= 1 && Number.isFinite(v);
  const hasAnchor = b.anchorX != null && b.anchorY != null;
  if (hasAnchor && !(inFrac(b.anchorX) && inFrac(b.anchorY))) {
    return err("anchorX/anchorY must be fractions in [0,1]");
  }
  const anchorX = hasAnchor ? (b.anchorX as number) : null;
  const anchorY = hasAnchor ? (b.anchorY as number) : null;

  // A reply must point at an existing top-level comment on the same screen.
  let parentId: string | null = null;
  if (b.parentId) {
    const parent = await db
      .prepare("SELECT id, screen_id, parent_id FROM comments WHERE id = ?")
      .bind(b.parentId)
      .first<{ id: string; screen_id: string; parent_id: string | null }>();
    if (!parent) return err("parentId not found");
    if (parent.screen_id !== screenId) return err("parent belongs to a different screen");
    if (parent.parent_id) return err("replies are one level deep");
    parentId = parent.id;
  }

  const row: CommentRow = {
    id: crypto.randomUUID(),
    screen_id: screenId,
    author_name: authorName,
    author_email: email,
    body,
    anchor_x: anchorX,
    anchor_y: anchorY,
    parent_id: parentId,
    resolved: 0,
    resolved_at: null,
    design_version: b.designVersion ?? null,
    created_at: Date.now(),
  };

  await db
    .prepare(
      `INSERT INTO comments
        (id, screen_id, author_name, author_email, body, anchor_x, anchor_y, parent_id, resolved, resolved_at, design_version, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.screen_id,
      row.author_name,
      row.author_email,
      row.body,
      row.anchor_x,
      row.anchor_y,
      row.parent_id,
      row.resolved,
      row.resolved_at,
      row.design_version,
      row.created_at,
    )
    .run();

  return json({ comment: toDTO(row) }, 201);
};
