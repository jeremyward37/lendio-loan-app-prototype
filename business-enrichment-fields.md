# Business Enrichment Fields

## Required Input Fields

| Field | Required? |
|---|---|
| `businessName` | Required |
| `ownerName` | Required |
| `businessCity` | Required |
| `businessState` | Required |
| `businessZip` | Required |
| `businessPhone` | Required |
| `websiteUrl` | Optional |
| `ein` | Optional |

## Output Fields Returned

Each field includes a `value`, a `status` (`found` / `not_found` / `source_failed`), and `source` metadata.

| Field | Notes |
|---|---|
| `business_street_address` | |
| `business_city` | |
| `business_state` | |
| `business_zip_code` | |
| `business_start_date` | |
| `entity_type` | Normalized (LLC, Corp, etc.) |
| `number_of_locations` | |
| `is_franchise` | Boolean |
| `is_nonprofit` | Boolean |
| `has_bankruptcy` | Boolean |
| `business_industry` | Free-form |
| `naics_code` | Validated |
| `lendio_industry` | Constrained enum (26 values) |
| `number_of_employees` | |
| `annual_profits` | |
| `ein` | |
