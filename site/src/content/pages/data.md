---
title: Open Data
slug: data
navLabel: Data
description: Download the versioned calculator data, schemas, checksums, and portable release archive.
order: 6
lastReviewed: "2026-07-10"
heroSummary: The calculator is driven by public, versioned records that can be inspected, reused, and checked independently.
keyTakeaways:
  - Root data records are the calculator's update authority.
  - The latest and v0.1.0 downloads are byte-identical for this first release.
  - Checksums and schemas are included so consumers can verify what they received.
---

## Version 0.1.0

This is the first canonical public release of the calculator data. It contains 12 activities, 12 source records, 5 device profiles, 5 presets, 6 method sections, JSON Schemas, a Frictionless Data Package descriptor, and checksums. The website calculator reads a generated snapshot from the same root records.

- [Complete ZIP archive](/data/your-digital-life-data-v0.1.0.zip)
- [Archive checksum](/data/SHA256SUMS)
- [Release manifest](/data/v0.1.0/manifest.json)
- [Data Package descriptor](/data/v0.1.0/datapackage.json)
- [Checksums for every release file](/data/v0.1.0/SHA256SUMS)

## Latest machine-readable files

- [Activities as JSON](/data/latest/activities.json)
- [Activities as CSV](/data/latest/activities.csv)
- [Sources as JSON](/data/latest/sources.json)
- [Device profiles as JSON](/data/latest/device-profiles.json)
- [Presets as JSON](/data/latest/presets.json)
- [Method sections as JSON](/data/latest/methods.json)

## Schemas

- [Activity JSON Schema](/data/latest/schemas/activity.schema.json)
- [Activity CSV Table Schema](/data/latest/schemas/activities-table.schema.json)
- [Source JSON Schema](/data/latest/schemas/source.schema.json)
- [Device-profile JSON Schema](/data/latest/schemas/device-profile.schema.json)
- [Preset JSON Schema](/data/latest/schemas/preset.schema.json)
- [Method JSON Schema](/data/latest/schemas/method.schema.json)

Project-created structured data and schemas are offered under CC0 1.0. Original project prose fields are available under CC BY 4.0. Third-party titles and bibliographic metadata retain their original terms. See the repository's [license map](https://github.com/Brehove/Your-Digital-Life/blob/main/LICENSE.md) before redistributing mixed-content records.

The frozen deployed baseline remains a regression fixture, not an update authority. The only source-record correction in v0.1.0 replaces the old `scenario-methods` placeholder URL with this site's Sources & Method page. Publication metadata also points to the new public data and maintenance paths; numerical values and calculator behavior are unchanged.
