---
title: Open Data
slug: data
navLabel: Data
description: Download the versioned calculator data, schemas, checksums, and portable release archive.
order: 6
lastReviewed: "2026-07-14"
heroSummary: The calculator is driven by public, versioned records that can be inspected, reused, and checked independently.
keyTakeaways:
  - "Root data records are the calculator's update authority."
  - "The latest downloads are byte-identical to the current v0.2.0 release; v0.1.0 remains available as the immutable baseline."
  - "Checksums and schemas are included so consumers can verify what they received."
---

## Current release: version 0.2.0

Version 0.2.0 revises the image-generation row to the IEA's 1.7 Wh controlled GPU-only benchmark, records Jon Ippolito's role in prompting the comparison, preserves the generic water rule pending stronger boundary-matched evidence, and adds a portable external-comparison history. The website calculator reads a generated snapshot from these same root records.

- [Complete v0.2.0 ZIP archive](/data/your-digital-life-data-v0.2.0.zip)
- [Release decision](/data/v0.2.0/release.json)
- [Release manifest](/data/v0.2.0/manifest.json)
- [Data Package descriptor](/data/v0.2.0/datapackage.json)
- [Checksums for every v0.2.0 release file](/data/v0.2.0/SHA256SUMS)
- [External comparison history](/data/v0.2.0/external-comparisons.json)

## Historical release: version 0.1.0

Version 0.1.0 is the first canonical public release and the preserved pre-review baseline. It remains available for reproducibility; `latest` no longer points to it.

- [Complete v0.1.0 ZIP archive](/data/your-digital-life-data-v0.1.0.zip)
- [Release manifest](/data/v0.1.0/manifest.json)
- [Data Package descriptor](/data/v0.1.0/datapackage.json)
- [Checksums for every release file](/data/v0.1.0/SHA256SUMS)

[Archive checksums for every published version](/data/SHA256SUMS)

## Latest machine-readable files

- [Activities as JSON](/data/latest/activities.json)
- [Activities as CSV](/data/latest/activities.csv)
- [Sources as JSON](/data/latest/sources.json)
- [Device profiles as JSON](/data/latest/device-profiles.json)
- [Presets as JSON](/data/latest/presets.json)
- [Method sections as JSON](/data/latest/methods.json)
- [Current release decision](/data/latest/release.json)
- [External comparison history](/data/latest/external-comparisons.json)

## Schemas

- [Activity JSON Schema](/data/latest/schemas/activity.schema.json)
- [Activity CSV Table Schema](/data/latest/schemas/activities-table.schema.json)
- [Source JSON Schema](/data/latest/schemas/source.schema.json)
- [Device-profile JSON Schema](/data/latest/schemas/device-profile.schema.json)
- [Preset JSON Schema](/data/latest/schemas/preset.schema.json)
- [Method JSON Schema](/data/latest/schemas/method.schema.json)
- [Release-decision JSON Schema](/data/latest/schemas/release.schema.json)
- [External-comparison JSON Schema](/data/latest/schemas/external-comparisons.schema.json)

Project-created structured data and schemas are offered under CC0 1.0. Original project prose fields are available under CC BY 4.0. Third-party titles and bibliographic metadata retain their original terms. See the repository's [license map](https://github.com/Brehove/Your-Digital-Life/blob/main/LICENSE.md) before redistributing mixed-content records.

The frozen v0.1.0 release remains a regression fixture and historical download, not the current update authority. Every later release declares its changed stable IDs, publishes its evidence decision, and preserves earlier version directories and archives byte-for-byte.

[Read the public update history](/updates/).
