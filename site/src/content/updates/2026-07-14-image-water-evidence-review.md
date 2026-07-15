---
title: Revised image generation and documented the Ippolito water comparison
date: "2026-07-14"
summary: Replaced the previous image-generation coefficient with a pinned IEA benchmark and added a repeatable evidence crosswalk for external feedback.
changedItems:
  - Changed image generation from 0.48 Wh to 1.7 Wh for SD-XL 1.0-base under controlled H100 GPU-only test conditions
  - Recalculated image direct water from 0.48 to 1.7 mL and broader water from 2.88 to 10.2 mL under the retained water rule
  - Credited Jon Ippolito's What Uses More? source sheet for prompting the comparison while attributing the adopted value to the underlying IEA report
  - Documented Jon's 7 mL/Wh water synthesis, the corrected 11.84 mL/Wh cross-metric arithmetic, and the decision to retain the current split water method
  - Added versioned external-comparison and release-decision workflows for future feedback
reason: The existing image coefficient could not be reproduced from its included source chain. The Ippolito comparison exposed a stronger pinned benchmark and also showed why external synthesis, underlying evidence, and adopted project values need separate provenance.
impactOnPublicCopy: The calculator and Sources & Method page now show the revised image values, the IEA boundary, Jon Ippolito's role in the review, and the retained water-method decision.
---

The new workflow records whether an outside claim is adopted, adapted, retained,
rejected, left open, or judged non-comparable. That decision history can be
extended when new research appears or when further discussion changes the
underlying claim.
