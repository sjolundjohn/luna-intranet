# Workers Analytics Engine — high-volume per-event metrics for /fleet.
#
# D1 holds the queryable audit log. Analytics Engine holds the rollup-
# friendly stream that drives the per-team aggregates and daily
# briefing inputs. We declare the dataset name; provisioning happens
# automatically when a Worker writes its first event.

variable "analytics_engine_dataset" {
  description = "Workers Analytics Engine dataset for fleet rollups."
  type        = string
  default     = "luna_fleet_events"
}

locals {
  analytics_engine_dataset = var.analytics_engine_dataset
}
