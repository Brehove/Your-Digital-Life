---
title: Moved calculator citations into the calculator markdown record
date: "2026-03-08"
summary: Embedded the calculator's citation catalog directly into the digital inventory markdown file so values, method notes, and source metadata can now be updated together.
changedItems:
  - Added an inline sourceCatalog to the digital inventory calculator record
  - Rewired calculator citations on the live tool and Sources & Method page to resolve from that local catalog
  - Added a public calculator source registry table derived from the same markdown record
  - Updated maintenance notes so calculator updates now happen in one file
reason: The first source-of-truth refactor still split calculator values from their full citation metadata, which made future research updates harder to manage safely.
impactOnPublicCopy: Visitors now see calculator citations and method references rendered from the same markdown record that drives the live calculator values.
---

At the time of this update, `src/content/calculators/digital-inventory.md` was the single site-facing maintenance file derived from private Section 2 and Section 3 research notes. The later open-data migration moved editable calculator records to root `data/` and made the site entry a generated snapshot.
