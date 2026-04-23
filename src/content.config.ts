import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections for the Luna intranet.
 *
 * Adding a new agent or a new platform topic is a single MDX file — the
 * listing pages iterate these collections automatically.
 *
 * Future collections (handbook, engineering, people, news) are pre-wired
 * here with empty schemas so that dropping in an MDX file is all it takes
 * to start a new section.
 */

const agents = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/agents" }),
  schema: z.object({
    name: z.string(),
    status: z.enum(["live", "coming-soon", "by-request"]),
    summary: z.string(),
    accessHint: z.string().optional(),
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

const people = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
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

export const collections = { agents, platform, handbook, engineering, people, news };
