# Vectorize — per-agent memory stores.
#
# One index per shared agent. Per-user namespacing happens at the
# query layer (filter on user_email metadata), not at the index layer.
# The Cloudflare-recommended embedding dimensionality for the
# Anthropic-side workflow is 1024 (Claude embeddings).

resource "cloudflare_vectorize_index" "basal_memory" {
  account_id  = var.account_id
  name        = "luna-basal-memory"
  description = "Per-user durable facts surfaced by Basal across conversations."

  config = {
    dimensions = 1024
    metric     = "cosine"
  }
}
