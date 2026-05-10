import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections for the Luna intranet.
 *
 * Adding a new agent / teammate / platform topic is a single MDX file — the
 * listing pages iterate these collections automatically.
 *
 * Future collections (handbook, engineering, news) are pre-wired here with
 * empty schemas so that dropping in an MDX file is all it takes.
 */

const TEAMS = [
  "exec",
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
    /** Optional path to a custom avatar image under /public. */
    avatar: z.string().optional(),
    /** Who owns / maintains this agent (stable id from people collection). */
    owner: z.string().optional(),
    /** Teams this agent is available to. "all" means every team. */
    teams: z.array(z.enum([...TEAMS, "all"])).default(["all"]),
    /** People who actively use this agent (ids from people collection). */
    usedBy: z.array(z.string()).default([]),
    order: z.number().default(99),
    /**
     * Class A = 1:many shared agent (e.g. Basal). Class B = 1:1 personal.
     * Drives change-control: Class A configure-edits require ai-admin review.
     */
    agentClass: z.enum(["A", "B"]).default("A"),
    /**
     * Per-role gates enforced server-side. Defaults align with default-deny
     * for shared (Class A) agents and self-serve for personal (Class B).
     */
    permissions: z
      .object({
        invoke: z.array(z.string()).default(["employee"]),
        configure: z.array(z.string()).default(["ai-admin"]),
        viewLogs: z.array(z.string()).default(["ai-admin"]),
      })
      .default({ invoke: ["employee"], configure: ["ai-admin"], viewLogs: ["ai-admin"] }),
    /** Patient/PHI scope. PHI agents require `phi-authorized` group. */
    piiScope: z.enum(["none", "employee", "phi"]).default("none"),
  }),
});

/**
 * Workflows: named, versioned multi-step tasks. Examples: morning Personal
 * Briefing, support-ticket triage, fleet briefing generation.
 *
 * Phase 1 stores definitions as MDX so the catalog page renders without a
 * backend; Phase 2 moves authoritative storage to D1 and treats MDX as seed.
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

export const collections = {
  agents,
  platform,
  people,
  handbook,
  engineering,
  news,
  workflows,
  onboarding,
};

/** Human-readable team labels (source of truth for UI). */
export const TEAM_LABELS: Record<(typeof TEAMS)[number], string> = {
  "exec": "Exec",
  "software": "Software",
  "data-science": "Data Science",
  "hardware": "Hardware",
  "regulatory": "Regulatory",
  "clinical": "Clinical",
  "electrical-engineering": "Electrical Engineering",
};

export const TEAM_ORDER: readonly (typeof TEAMS)[number][] = TEAMS;
