---
title: Moved calculator data into one canonical markdown record
date: "2026-03-08"
summary: Replaced the inventory tool's hardcoded activity rows and presets with a single markdown-backed calculator record derived from Section 2 and Section 3.
changedItems:
  - Added a calculators content collection with a canonical digital inventory markdown record
  - Rewired the inventory tool to load activities and presets from that record
  - Added a calculator source-of-truth section to the public Sources & Method page
  - Updated internal method metadata so the scenario synthesis record now points to the calculator method layer as well
reason: The calculator had become the focus of the site, but its live numbers still lived in component code instead of one editable content record.
impactOnPublicCopy: Visitors now see the calculator's activity table and method notes rendered from the same markdown record that drives the live tool values.
---

At the time of this update, the calculator became editable without touching the component by using one site-facing Markdown record derived from the private Section 2 and Section 3 research notes. The later open-data migration superseded that maintenance path with canonical root `data/` records and a generated site snapshot.
