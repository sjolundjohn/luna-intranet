resource "cloudflare_workers_kv_namespace" "kill_switch" {
  account_id = var.account_id
  title      = "luna-kill-switch"
}

resource "cloudflare_workers_kv_namespace" "platform_cache" {
  account_id = var.account_id
  title      = "luna-platform-cache"
}
