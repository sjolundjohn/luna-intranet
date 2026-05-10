resource "cloudflare_d1_database" "luna_platform" {
  account_id = var.account_id
  name       = "luna-platform"
}
