/**
 * POST /api/chat  —  Cloudflare Pages Function
 *
 * Proxies browser chat requests from the intranet into luna-ai-proxy, which
 * forwards to the luna-agents AI Gateway, which forwards to Anthropic.
 *
 * Why: keeps PROXY_BEARER on the server so the browser never sees it.
 * CF Access gates the site, so we trust the caller is a @lunadiabetes.com user.
 *
 * Required secrets (set via `wrangler pages secret put` or CF dashboard):
 *   - PROXY_BEARER: shared bearer for luna-ai-proxy
 *
 * Optional env:
 *   - AI_PROXY_URL: override default https://ai-proxy.nightluna.com
 *   - MODEL: Claude model id (defaults to claude-opus-4-7)
 */

interface Env {
  PROXY_BEARER?: string;
  AI_PROXY_URL?: string;
  MODEL?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  agent?: string;
  messages?: ChatMessage[];
  systemPrompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Basal, an internal assistant for Luna Health Inc. You are speaking with an employee of Luna Health who has authenticated with their @lunadiabetes.com Google Workspace account.

Be concise and direct. Only respond to what is asked — do not volunteer suggestions or list capabilities. Use plain text; no markdown headings or bullet lists unless the user asks for them. Luna is a venture-backed medical device startup focused on diabetes care; you can help with drafting, summarizing, brainstorming, and general questions.`;

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;

  if (!env.PROXY_BEARER) {
    return new Response(
      "Chat not configured: PROXY_BEARER secret is missing. Set it via the Cloudflare Pages dashboard.",
      { status: 503, headers: { "content-type": "text/plain" } },
    );
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.messages || body.messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  // Identify the caller via Cloudflare Access JWT (set when the site is
  // deployed behind Access). Falls back to "unknown" in local preview.
  const userEmail = (request.headers.get("cf-access-authenticated-user-email") ?? "unknown").toLowerCase();

  const model = env.MODEL ?? "claude-opus-4-7";
  const aiProxyUrl = (env.AI_PROXY_URL ?? "https://ai-proxy.nightluna.com").replace(/\/+$/, "");
  const upstreamUrl = `${aiProxyUrl}/anthropic/v1/messages`;

  const upstreamReq = {
    model,
    max_tokens: 2048,
    stream: true,
    system: body.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.PROXY_BEARER}`,
      "x-user-id": userEmail,
      "x-luna-agent": body.agent ?? "basal",
    },
    body: JSON.stringify(upstreamReq),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return new Response(`Upstream error ${upstream.status}: ${text.slice(0, 500)}`, {
      status: 502,
      headers: { "content-type": "text/plain" },
    });
  }

  // Pass SSE stream straight through — same content-type + body.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/event-stream",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
};

// Everything except POST: 405.
export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  return ctx.next();
};
