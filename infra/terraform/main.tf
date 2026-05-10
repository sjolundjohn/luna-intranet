terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }

  # Phase 0 leaves state in the local filesystem. Phase 2 moves it to
  # an R2-backed remote state once the bucket is provisioned (the
  # bootstrap chicken-and-egg is solved by applying r2.tf first
  # locally, then re-running with the backend block enabled).
  #
  # backend "s3" {
  #   bucket                      = "luna-tfstate"
  #   key                         = "ai-workplace/terraform.tfstate"
  #   region                      = "auto"
  #   endpoint                    = "https://<account>.r2.cloudflarestorage.com"
  #   skip_credentials_validation = true
  #   skip_region_validation      = true
  #   skip_metadata_api_check     = true
  # }
}

variable "account_id" {
  description = "Cloudflare account id (resolves to John Sjolund's personal CF account today)."
  type        = string
}

variable "environment" {
  description = "Logical environment name. Single-environment today."
  type        = string
  default     = "production"
}

provider "cloudflare" {
  # API token comes from the CLOUDFLARE_API_TOKEN env var; never
  # committed. Token must have edit access on: Workers, KV, D1, R2,
  # Vectorize, Queues, AI Gateway, Analytics Engine.
}
