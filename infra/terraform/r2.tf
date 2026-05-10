# R2 buckets — chat attachments and the briefing podcast feed.
#
# Briefings bucket holds MP3 episodes (Phase 4) and the master Markdown
# report (Phase 3). Public access is gated; the static intranet reads
# via signed URLs from fleet-api.
resource "cloudflare_r2_bucket" "briefings" {
  account_id = var.account_id
  name       = "luna-briefings"
  location   = "WNAM"
}

# Attachments bucket — files Lunites paste into /chat. Encrypted at
# rest by R2; access via signed URLs scoped to the uploading user.
resource "cloudflare_r2_bucket" "attachments" {
  account_id = var.account_id
  name       = "luna-attachments"
  location   = "WNAM"
}
