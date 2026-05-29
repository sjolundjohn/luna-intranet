import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections for the Luna intranet.
 *
 * Source of truth for agent identity and persona is the
 * `Luna_AI_Workforce_Config` repo (facets/<slug>.md). The Intranet's
 * agents collection mirrors that schema 1:1 so this site can be
 * generated/synced from facets without translation. Field names
 * match facets frontmatter.
 *
 * Future collections (handbook, engineering, news) are pre-wired here with
 * empty schemas so that dropping in an MDX file is all it takes.
 */

const TEAMS = [
  "exec",
  "platform",
  "software",
  "data-science",
  "hardware",
  "regulatory",
  "clinical",
  "electrical-engineering",
] as const;

const agents = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/agents" }),
  schema: z.object({
    name: z.string(),
    status: z.enum(["live", "coming-soon", "by-request"]),
    summary: z.string(),
    accessHint: z.string().optional(),
    /** Path to a custom avatar image under /public. */
    avatar: z.string().optional(),
    /** Stable id from the people collection. */
    owner: z.string().optional(),
    /**
     * Workforce-aligned: 1:many = shared (Class A), 1:1 = personal (Class B).
     * Drives change-control and the per-agent UI surface.
     */
    scope: z.enum(["1:many", "1:1"]).default("1:many"),
    /**
     * Lowercased emails authorized to invoke this agent. Matches
     * `allowed_users` in `Luna_AI_Workforce_Config/facets/<slug>.md`.
     */
    allowedUsers: z.array(z.string()).default([]),
    /** Single department this agent reports into. Maps to TEAMS. */
    department: z.enum(TEAMS),
    /** Skills loaded by this agent's prompt at runtime. */
    skills: z.array(z.string()).default([]),
    /** People who actively use this agent (ids from people collection). */
    usedBy: z.array(z.string()).default([]),
    order: z.number().default(99),
    /**
     * Patient/PHI scope. PHI agents are gated to the `phi-authorized`
     * Workspace group at the agent-router. Today only Lancel (data) is
     * piiScope=phi.
     */
    piiScope: z.enum(["none", "employee", "phi"]).default("none"),
  }),
});

/**
 * Workflows: named, versioned multi-step tasks. Examples: morning Personal
 * Briefing, support-ticket triage, fleet briefing generation.
 */
const workflows = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/workflows" }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    owner: z.string().optional(),
    /** Trigger model. */
    trigger: z.enum(["manual", "scheduled", "event"]),
    /** Cron expression if trigger=scheduled. */
    schedule: z.string().optional(),
    status: z.enum(["active", "paused", "drafting"]).default("drafting"),
    /** Ordered list of step descriptors used by WorkflowStepList. */
    steps: z
      .array(
        z.object({
          name: z.string(),
          agent: z.string().optional(),
          kind: z
            .enum(["agent", "fetch", "decision", "human-approval", "transform", "deliver"])
            .default("agent"),
          summary: z.string().optional(),
        }),
      )
      .default([]),
    order: z.number().default(99),
  }),
});

/**
 * Onboarding role tracks. One MDX per role (eng, ops, clinical, exec, admin).
 * Each track is 3–5 modules; the first module is always
 * "What we're not asking you to do."
 */
const onboarding = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/onboarding" }),
  schema: z.object({
    role: z.string(),
    title: z.string(),
    summary: z.string(),
    /** Each module ends in a real concrete task the reader does. */
    modules: z.array(
      z.object({
        title: z.string(),
        body: z.string(),
        task: z.string().optional(),
      }),
    ),
    order: z.number().default(99),
  }),
});

const platform = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/platform" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(99),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    team: z.enum(TEAMS),
    email: z.string().optional(),
    avatar: z.string().optional(),
    order: z.number().default(99),
  }),
});

const handbook = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/handbook" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    order: z.number().default(99),
  }),
});

const engineering = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/engineering" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    order: z.number().default(99),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
  }),
});

/**
 * Tools: the extensible registry of internal apps built on the platform
 * (Chat, UX Review, Telescope, Kegerator, …). Mirrors the agents/workflows
 * pattern so adding a tool = dropping an MDX file. Only `status: live` ever
 * renders — the "don't expose it until it works" rule. A tool can be internal
 * (href like "/tools/chat") or external (a full URL on another subdomain).
 */
const tools = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    status: z.enum(["live", "building", "planned"]).default("planned"),
    summary: z.string(),
    /** Internal path ("/tools/chat") or external URL ("https://…"). */
    href: z.string(),
    /** External tools open in a new tab with an ↗ affordance. */
    external: z.boolean().default(false),
    /** Optional preview thumbnail under /public (e.g. "/tools/telescope.png"). */
    screenshot: z.string().optional(),
    eyebrow: z.string().optional(),
    icon: z.string().optional(),
    owner: z.string().optional(),
    department: z.enum(TEAMS).optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  agents,
  platform,
  people,
  handbook,
  engineering,
  news,
  workflows,
  onboarding,
  tools,
};

/** Human-readable team labels (source of truth for UI). */
export const TEAM_LABELS: Record<(typeof TEAMS)[number], string> = {
  "exec": "Exec",
  "platform": "Platform",
  "software": "Software",
  "data-science": "Data Science",
  "hardware": "Hardware",
  "regulatory": "Regulatory",
  "clinical": "Clinical",
  "electrical-engineering": "Electrical Engineering",
};

export const TEAM_ORDER: readonly (typeof TEAMS)[number][] = TEAMS;
