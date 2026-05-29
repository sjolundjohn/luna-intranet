/**
 * Content visibility helpers — the single source of truth for the
 * "hide until live" rule.
 *
 * Nothing that isn't actually built and functional should ever render on the
 * site. Every surface that lists agents, workflows, or tools MUST go through
 * these helpers rather than calling getCollection() directly, so a draft /
 * coming-soon item can never leak into the catalog, nav, fleet, org, hubs, or
 * dynamic-route generation.
 */
import { getCollection } from "astro:content";

/** The only agents that may appear anywhere: status === "live". */
export async function liveAgents() {
  return (await getCollection("agents"))
    .filter((a) => a.data.status === "live")
    .sort((a, b) => a.data.order - b.data.order);
}

/** The only workflows that may appear anywhere: status === "active". */
export async function activeWorkflows() {
  return (await getCollection("workflows"))
    .filter((w) => w.data.status === "active")
    .sort((a, b) => a.data.order - b.data.order);
}

/** The only tools that may appear anywhere: status === "live". */
export async function liveTools() {
  return (await getCollection("tools"))
    .filter((t) => t.data.status === "live")
    .sort((a, b) => a.data.order - b.data.order);
}
