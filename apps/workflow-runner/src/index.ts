/**
 * workflow-runner — Cloudflare Workflows definitions.
 *
 * Each `WorkflowEntrypoint` subclass is one durable workflow. Steps
 * inside `run()` get automatic retries, checkpointing, and
 * `step.sleep()` durability. Anything that needs to outlast a single
 * Worker invocation lives here, not in a regular Worker.
 *
 * Phase 0 ships typed scaffolds with the right step shape — Phase 3
 * fills in the concrete fetches, agent calls, and outputs. The
 * Cloudflare dashboard will show these workflows as soon as the
 * Worker is deployed; running them is an explicit `WORKFLOW.create()`
 * call from workflow-control.
 */
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";

interface Env {
  D1: D1Database;
  AGENT_ROUTER: { fetch: typeof fetch };
  BRIEFING_QUEUE: Queue;
  BRIEFINGS: R2Bucket;
  MORNING_BRIEFING: Workflow;
  DAILY_FLEET_BRIEFING: Workflow;
  SUPPORT_TRIAGE: Workflow;
}

// ---------------------------------------------------------------------------
// MorningBriefingWorkflow — per-Lunite, fans out via Queues. Cron trigger
// posts to the queue with one message per Lunite; each consumer message
// runs an instance of this workflow against that user.
// ---------------------------------------------------------------------------

interface MorningBriefingPayload {
  userEmail: string;
  /** ISO date for which the briefing is generated. */
  forDate: string;
}

export class MorningBriefingWorkflow extends WorkflowEntrypoint<Env, MorningBriefingPayload> {
  override async run(
    event: WorkflowEvent<MorningBriefingPayload>,
    step: WorkflowStep,
  ): Promise<{ delivered: boolean }> {
    const { userEmail, forDate } = event.payload;

    // Phase 3: real Gmail / Calendar / Notion / GitHub fetches via
    // service bindings. Each step is durable and retryable.
    const mail = await step.do("pull-mail", async () => ({
      since: forDate,
      messages: [] as { from: string; subject: string }[],
      stub: true,
    }));

    const calendar = await step.do("pull-calendar", async () => ({
      forDate,
      events: [] as { ts: string; title: string }[],
      stub: true,
    }));

    const decisions = await step.do("pull-pending-decisions", async () => ({
      pending_prs: 0,
      pending_notion_docs: 0,
      pending_hubspot_approvals: 0,
      stub: true,
    }));

    // Compose via the agent-router (so audit + kill-switch checks apply).
    const compose = await step.do("compose-briefing", async () => {
      const res = await this.env.AGENT_ROUTER.fetch("https://agent-router/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-access-authenticated-user-email": userEmail,
        },
        body: JSON.stringify({
          agent: "basal",
          messages: [
            {
              role: "user",
              content: `Compose a 250-word morning briefing for ${userEmail} on ${forDate}. Inputs: ${JSON.stringify({ mail, calendar, decisions })}.`,
            },
          ],
        }),
      });
      // Phase 3 streams + parses; today we 200 if reachable.
      return { ok: res.ok, status: res.status };
    });

    // Phase 3: Slack-DM delivery via a Slack-DM Worker service binding.
    await step.do("deliver-to-slack-dm", async () => ({
      delivered: false,
      stub: true,
      composed_ok: compose.ok,
    }));

    return { delivered: false };
  }
}

// ---------------------------------------------------------------------------
// DailyFleetBriefingWorkflow — fans out per-team summarizers via Queue,
// composes the master briefing, writes Markdown + (Phase 4) MP3 to R2.
// ---------------------------------------------------------------------------

interface DailyFleetBriefingPayload {
  forDate: string;
  cadence: "daily" | "weekly";
}

export class DailyFleetBriefingWorkflow extends WorkflowEntrypoint<
  Env,
  DailyFleetBriefingPayload
> {
  override async run(
    event: WorkflowEvent<DailyFleetBriefingPayload>,
    step: WorkflowStep,
  ): Promise<{ episodeId: string }> {
    const { forDate, cadence } = event.payload;

    // (1) Aggregate audit + workflow-runs from D1. Aggregate-only —
    // user_email is never selected here.
    const audit = await step.do("aggregate-audit", async () => ({
      perAgent: [] as { agent_slug: string; invocations: number }[],
      perTeam: [] as { team: string; invocations: number; lunites: number }[],
      stub: true,
    }));

    // (2) Fan out to per-team summarizers via the queue. Each consumer
    // picks one team and writes a 3-bullet digest.
    await step.do("enqueue-team-summarizers", async () => {
      // Phase 3: actual queue.send for each team in audit.perTeam.
      return { enqueued: audit.perTeam.length };
    });

    // (3) Sleep until consumers complete. In a real flow we'd use a
    // wait-for-event pattern; for now, durable sleep + collect.
    await step.sleep("await-summarizers", "30 seconds");

    // (4) Compose the master briefing via agent-router → agent-basal.
    const compose = await step.do("compose-master-briefing", async () => {
      const res = await this.env.AGENT_ROUTER.fetch("https://agent-router/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: "basal",
          messages: [
            {
              role: "user",
              content: `Compose a ${cadence} fleet briefing for ${forDate}. Use the per-team digests just produced. Sections: shipped, hot, where humans intervened, anomalies, coming next. No individual employee names.`,
            },
          ],
        }),
      });
      return { ok: res.ok };
    });

    // (5) Write Markdown to D1 (briefing_episodes) and (Phase 4) MP3 to R2.
    const episodeId = `${cadence}-${forDate}`;
    await step.do("publish", async () => {
      // Phase 3: insert briefing_episodes row.
      // Phase 4: render TTS + write MP3 to R2 + regenerate RSS feed.
      return { episode_id: episodeId, composed_ok: compose.ok };
    });

    return { episodeId };
  }
}

// ---------------------------------------------------------------------------
// SupportTriageWorkflow — pulls HubSpot tickets, classifies, drafts replies
// with a non-skippable human-approval step.
// ---------------------------------------------------------------------------

export class SupportTriageWorkflow extends WorkflowEntrypoint<
  Env,
  { since: string }
> {
  override async run(
    event: WorkflowEvent<{ since: string }>,
    step: WorkflowStep,
  ): Promise<{ drafted: number }> {
    const { since } = event.payload;

    const tickets = await step.do("pull-tickets", async () => ({
      tickets: [] as { id: string; subject: string; sensitive: boolean }[],
      stub: true,
      since,
    }));

    const drafts: { id: string; ok: boolean }[] = [];
    for (const t of tickets.tickets) {
      // Regulatory-sensitive tickets bypass the agent and go straight
      // to a human escalation.
      if (t.sensitive) {
        await step.do(`escalate-${t.id}`, async () => ({ escalated: true }));
        continue;
      }
      const draft = await step.do(`draft-${t.id}`, async () => {
        const res = await this.env.AGENT_ROUTER.fetch("https://agent-router/", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            agent: "basal",
            messages: [
              {
                role: "user",
                content: `Draft a HubSpot reply to ticket ${t.id} ("${t.subject}"). PHI-redacted. The human will review before send.`,
              },
            ],
          }),
        });
        return { id: t.id, ok: res.ok };
      });
      drafts.push(draft);
    }

    // Non-skippable human approval — surfaces drafts in HubSpot, never auto-sends.
    await step.do("surface-for-review", async () => ({
      surfaced: drafts.length,
      stub: true,
    }));

    return { drafted: drafts.length };
  }
}

// ---------------------------------------------------------------------------
// Cron + Queue handlers — entry points that the runtime calls.
// ---------------------------------------------------------------------------

interface BriefingQueueMessage {
  forDate: string;
  team: string;
}

export default {
  /** Cron entrypoint — Cloudflare invokes once per scheduled tick. */
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const cron = event.cron;
    const today = new Date().toISOString().slice(0, 10);
    if (cron === "0 7 * * 1-5") {
      // Phase 3: enumerate Lunites and create one MorningBriefing instance each.
      // For now we only kick a single self-test instance.
      await env.MORNING_BRIEFING.create({
        params: { userEmail: "system@nightluna.com", forDate: today },
      });
    } else if (cron === "0 18 * * *") {
      await env.DAILY_FLEET_BRIEFING.create({
        params: { forDate: today, cadence: "daily" },
      });
    } else if (cron === "0 */2 * * *") {
      await env.SUPPORT_TRIAGE.create({
        params: { since: new Date(Date.now() - 7200_000).toISOString() },
      });
    }
  },

  /** Queue consumer — per-team summarizer fan-out target. */
  async queue(batch: MessageBatch<BriefingQueueMessage>, _env: Env): Promise<void> {
    for (const msg of batch.messages) {
      // Phase 3: call agent-router with a per-team summarization prompt,
      // write the resulting digest to D1, ack the message.
      msg.ack();
    }
  },

  /** HTTP entrypoint — used by workflow-control to inspect/start runs. */
  async fetch(_request: Request, _env: Env): Promise<Response> {
    return new Response("luna-workflow-runner", { status: 200 });
  },
};
