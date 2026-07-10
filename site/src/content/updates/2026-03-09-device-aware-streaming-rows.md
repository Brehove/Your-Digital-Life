---
title: Device-aware streaming rows in the calculator
date: "2026-03-09"
summary: The calculator now lets YouTube and Netflix switch total-system energy by device and stores device intent inside the starter mixes.
changedItems:
  - Added device selectors for YouTube and Netflix in the live calculator
  - Lowered the default YouTube row to a phone-style total and the default Netflix row to a laptop-style total
  - Stored row-level and preset-level device assumptions in the calculator source-of-truth file
reason: Streaming rows were carrying one-size-fits-all total-system values even though the scenario work already showed that device choice changes those totals substantially.
impactOnPublicCopy: Visitors now see device selectors on the high-impact streaming rows, and the starter mixes apply the scenario-aligned device context for those rows automatically.
---
