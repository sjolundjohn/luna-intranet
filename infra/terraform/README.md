# Luna AI Workplace — Terraform

Infrastructure-as-code for the Cloudflare resources behind the AI workplace
platform. **Nothing in this directory is applied yet.** John runs
`terraform plan` and reviews the diff before any `terraform apply`.

## Layout

- `main.tf` — provider config + variables
- `d1.tf` — D1 database (`luna-platform`)
- `kv.tf` — KV namespaces (`luna-kill-switch`, `luna-platform-cache`)
- `r2.tf` — R2 buckets (`luna-briefings`, `luna-attachments`)
- `vectorize.tf` — Vectorize indexes (`luna-basal-memory`)
- `queues.tf` — Queues (`luna-briefing-fanout`, `luna-audit-ingest`)
- `ai_gateway.tf` — AI Gateway (`luna-ai-gateway`)
- `analytics_engine.tf` — Workers Analytics Engine dataset (`luna_fleet_events`)
- `outputs.tf` — exports the resource ids the wrangler.tomls need

## How to run

```bash
cd infra/terraform
export CLOUDFLARE_API_TOKEN=...        # token with edit perms for the resources below
export TF_VAR_account_id=a4142411ce45e09b846536e0a1aba208
terraform init
terraform plan -out=plan.tfplan        # review the diff
# When ready:
terraform apply plan.tfplan
```

## After apply: wiring the wrangler.tomls

Several `wrangler.toml` files have `id = "PLACEHOLDER_FILL_VIA_TERRAFORM"`
where Terraform-created resource ids belong. After `terraform apply`,
run:

```bash
terraform output -json > ../../docs/infra-outputs.json
```

…and fill the placeholder ids in:

- `apps/agent-router/wrangler.toml` — KV (KILL_SWITCH), D1
- `apps/agent-basal/wrangler.toml` — KV, D1, Vectorize, AI Gateway
- `apps/config-api/wrangler.toml` — KV, D1
- `apps/fleet-api/wrangler.toml` — D1, Analytics Engine
- `apps/workflow-control/wrangler.toml` — D1
- `apps/workflow-runner/wrangler.toml` — D1, Queue, R2

A small script in `scripts/wire-bindings.ts` (Phase 2) automates this so
nobody has to hand-edit the placeholders.

## Cost shape

All resources here are pay-per-use Cloudflare primitives. At Luna's
current scale, the steady-state monthly cost is dominated by AI Gateway
LLM calls (which are billed by the model provider, not Cloudflare). The
infrastructure layer itself is essentially free — D1 and KV reads,
Workers invocations, and R2 storage all sit well under the free tiers
for an internal-only product at our team size.
