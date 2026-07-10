---
title: Calculator switched to canonical open data
date: "2026-07-10"
summary: The website calculator now consumes a generated JSON snapshot from canonical root data, with versioned public downloads and contribution pages.
changedItems:
  - Replaced the hand-maintained calculator Markdown entry with a generated JSON entry.
  - Published matching latest and v0.1.0 JSON, CSV, schema, checksum, and ZIP downloads.
  - Added public Data and Contribute pages.
  - Replaced the scenario-methods placeholder URL with the public Sources & Method page.
reason: Establish one inspectable update authority and a reproducible path from reviewed records to the website and portable releases.
impactOnPublicCopy: Calculator numbers, preset totals, order, methods, and device behavior are unchanged. Public navigation, downloads, contribution guidance, and the scenario-methods link are new.
---

The checksum-locked pre-migration fixture remains in the repository for strict regression testing. Publication-only metadata migrations are explicitly enumerated; substantive calculator fields remain protected by deep parity tests.
