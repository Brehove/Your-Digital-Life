# Your Digital Life data v0.2.0

Adds a repeatable external-evidence comparison workflow and revises the image-generation row using a pinned IEA benchmark surfaced through comparison with Jon Ippolito's What Uses More? calculator.

The image-generation coefficient changes from an unreconstructable 0.48 Wh to 1.7 Wh for SD-XL 1.0-base under controlled H100 GPU-only test conditions. The generic water coefficients remain unchanged, but their evidence and the Ippolito comparison are now explicit.

The website consumes a generated snapshot from these root records, and `latest/` is byte-identical to this versioned package. Historical release directories and archives remain immutable. The frozen object captured from Git commit `063322e93e27704b447a495a838e552067928127` remains provenance metadata and a repository-only regression fixture; it is not an update authority.

## Changes

- Changed image-generation energy from 0.48 Wh to 1.7 Wh and recalculated its direct and broader water values to 1.7 mL and 10.2 mL under the retained water rule.
- Labeled the 1.7 Wh result as GPU-only and carried it through both energy totals only as a conservative floor, not as measured server-plus-network or total-system energy.
- Advanced the backward-compatible activity schema to v0.2.0 with optional per-row energy-boundary fields.
- Added Jon Ippolito's source sheet as explicit secondary provenance while attributing the adopted coefficient to the underlying IEA report.
- Added an external-comparison overlay with adopt, adapt, retain, reject, open, and not-comparable dispositions for future feedback cycles.
- Expanded the water method with Google, Mistral, LBNL, and Ippolito evidence, including the corrected 11.84 mL/Wh cross-metric arithmetic.
- Preserved the 1 mL/Wh direct and 6 mL/Wh broader generic water rules pending boundary-matched evidence.

Project-created structured data and schemas are offered under CC0-1.0. Original project prose fields are offered under CC BY 4.0. Third-party titles and bibliographic metadata are not relicensed. Quote-heavy research notes and presentation artifacts are intentionally excluded.
