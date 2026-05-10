# Queues — async fan-out for workflows that emit per-team or per-user
# parallelism.

# Briefing fan-out: one message per team, consumed by per-team
# summarizer steps inside the daily-fleet-briefing workflow.
resource "cloudflare_queue" "briefing_fanout" {
  account_id = var.account_id
  name       = "luna-briefing-fanout"
}

# Audit ingest queue: optional buffer if D1 audit-log writes ever come
# under load. Phase 3 wires this if needed; today the audit writer goes
# straight to D1.
resource "cloudflare_queue" "audit_ingest" {
  account_id = var.account_id
  name       = "luna-audit-ingest"
}
