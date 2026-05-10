# AI Gateway — single egress for every model call.
#
# Caching, observability, rate limiting, and per-agent budget caps live
# in the gateway's dashboard config. Workers route through here via
# the AI binding rather than calling Anthropic directly.
#
# Important: Cloudflare's terraform-provider-cloudflare hasn't shipped
# a first-class `cloudflare_ai_gateway` resource as of this write
# (~5/2026). When it does, swap the local-exec stub below for the
# real resource. Until then, the gateway is created via dashboard or
# `wrangler ai-gateway create`, and Terraform records the chosen name
# as a known constant other resources can reference.

variable "ai_gateway_name" {
  description = "AI Gateway slug — must match what Workers bind to via [ai] binding."
  type        = string
  default     = "luna-ai-gateway"
}

# When the resource lands in the provider, replace this with:
#
# resource "cloudflare_ai_gateway" "luna" {
#   account_id = var.account_id
#   name       = var.ai_gateway_name
#   cache_ttl  = 0          # no caching by default; per-route opt-in
#   collect_logs = true     # observability on; metadata only
# }
#
# The placeholder below documents the intended config and exposes
# the name to outputs.tf so consumers don't have to hardcode it.
locals {
  ai_gateway_name = var.ai_gateway_name
  ai_gateway_endpoint = "https://gateway.ai.cloudflare.com/v1/${var.account_id}/${var.ai_gateway_name}"
}
