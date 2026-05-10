output "d1_database_id" {
  value       = cloudflare_d1_database.luna_platform.id
  description = "Drop into every wrangler.toml's [[d1_databases]].database_id."
}

output "kv_kill_switch_id" {
  value       = cloudflare_workers_kv_namespace.kill_switch.id
  description = "Drop into wrangler.toml [[kv_namespaces]].id where binding=KILL_SWITCH."
}

output "kv_platform_cache_id" {
  value       = cloudflare_workers_kv_namespace.platform_cache.id
  description = "Drop into wrangler.toml [[kv_namespaces]].id where binding=CACHE."
}

output "r2_briefings_name" {
  value       = cloudflare_r2_bucket.briefings.name
  description = "Bucket name; reference in wrangler.toml as bucket_name."
}

output "r2_attachments_name" {
  value       = cloudflare_r2_bucket.attachments.name
  description = "Bucket name; reference in wrangler.toml as bucket_name."
}

output "vectorize_basal_memory_name" {
  value       = cloudflare_vectorize_index.basal_memory.name
  description = "Vectorize index name for the basal memory binding."
}

output "queue_briefing_fanout" {
  value       = cloudflare_queue.briefing_fanout.name
  description = "Queue name used by workflow-runner for briefing fan-out."
}

output "ai_gateway_endpoint" {
  value       = local.ai_gateway_endpoint
  description = "AI Gateway base URL — used by the [ai] binding's overridden gateway."
}

output "analytics_engine_dataset" {
  value       = local.analytics_engine_dataset
  description = "Dataset name for fleet-api's [[analytics_engine_datasets]].dataset."
}
