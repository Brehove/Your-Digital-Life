---
title: Open Data
slug: data
navLabel: Data
description: Download the versioned calculator data, schemas, checksums, and portable release archive.
order: 6
lastReviewed: "2026-07-23"
heroSummary: The calculator is driven by public, versioned records that can be inspected, reused, and checked independently.
keyTakeaways:
  - "Root data records are the calculator's update authority."
  - "The latest downloads are byte-identical to the current v0.4.0 release; v0.1.0 through v0.3.0 remain available as immutable historical releases."
  - "Checksums and schemas are included so consumers can verify what they received."
---

## Current release: version 0.4.0

Version 0.4.0 adds one hour of the existing fixed Xbox Series X plus reference television activity to the Gen Z (no AI use) starter mix. It does not change any calculator coefficient, formula, source relationship, or activity boundary. The website calculator reads a generated snapshot from these same root records.

- [Complete v0.4.0 ZIP archive](/data/your-digital-life-data-v0.4.0.zip)
- [Release decision](/data/v0.4.0/release.json)
- [Release manifest](/data/v0.4.0/manifest.json)
- [Data Package descriptor](/data/v0.4.0/datapackage.json)
- [Checksums for every v0.4.0 release file](/data/v0.4.0/SHA256SUMS)
- [External comparison history](/data/v0.4.0/external-comparisons.json)

## Historical releases

- [Version 0.3.0](/data/v0.3.0/manifest.json) added the fixed Xbox Series X plus reference television activity and its evidence record. [Download archive.](/data/your-digital-life-data-v0.3.0.zip)
- [Version 0.2.0](/data/v0.2.0/manifest.json) revised the image-generation row and added the external-evidence comparison workflow. [Download archive.](/data/your-digital-life-data-v0.2.0.zip)
- [Version 0.1.0](/data/v0.1.0/manifest.json) is the first canonical public release and preserved pre-review baseline. [Download archive.](/data/your-digital-life-data-v0.1.0.zip)

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
