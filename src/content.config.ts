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

export const collections = { agents, platform, people, handbook, engineering, news };

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
