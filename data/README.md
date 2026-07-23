# Your Digital Life canonical calculator data

This directory is the update authority for the public calculator. Root generation
produces the checked-in Astro snapshot at
`site/src/content/calculators/digital-inventory.json`, the portable releases in
`data/exports/`, and byte-identical downloads under `site/public/data/`.

Git commit `063322e93e27704b447a495a838e552067928127` and the checksum-locked fixture
under `tests/fixtures/` record the deployed pre-migration baseline. They are
regression provenance, not current update authorities.

## Current release: v0.4.0

- 13 calculator activities
- 24 calculator source records
- 6 device profiles
- 5 presets, including Clear
- 8 method sections
- JSON Schemas for every included record type
- deterministic JSON and CSV exports
- matching `latest` and immutable `v0.4.0` export trees
- preserved immutable `v0.1.0` export tree and archive
- a release decision and portable external-comparison history
- deterministic ZIP archive and SHA-256 checksums
- a generated Astro calculator entry and public download tree
- a checksum-locked deployed-baseline fixture for parity tests (repository only,
  not included in portable exports)

Scenarios, claims/facts, charts, and the broader site source registry are intentionally deferred to later normalization gates. Their current representations are not modified here.

## Reviewer evidence overlay

`review/source-evidence.json` is a validated, one-to-one review overlay for the
24 calculator source IDs. It adds corrected citations, precise locators,
evidence type, review status, measurement boundary, workload and hardware
scope, geography, derivation, and limitations. `review/activity-evidence.json`
adds row-level provenance summaries, formula-traceability status, additional
review-only source relationships, and unresolved findings for all 13
activities. Each overlay has a matching schema in `review/`.

`review/external-comparisons.json` records outside claims, project values before
and after review, evidence relationships, dispositions, and unresolved
questions. It is the reusable intake surface for recurring feedback from
reviewers and other calculators. See `../docs/evidence-update-workflow.md`.

The overlays are intentionally **not** calculator or website inputs. Beginning
with v0.2.0, `external-comparisons.json` and its schema are copied into each
portable release so the evidence-decision history is preserved. The broader
activity and source review overlays remain repository-only working records.

The root `DATA-REVIEW-GUIDE.md` is generated from the canonical calculator
records plus these overlays. It is the recommended human-readable starting
point.

Use these update rules:

- correct citations, locators, evidence classifications, or review findings in
  `review/`, then run `npm run data:build`;
- change `sources/`, activities, methods, or calculator values only through a
  new versioned data release with the required parity and downstream review.

## Canonical versus generated files

Authoritative records live in:

- `activities/`
- `sources/`
- `device-profiles/`
- `presets/`
- `methods/`
- `manifest.json`
- `VERSION`
- `schemas/`
- `review/`

The following are generated and must never be hand-edited:

- `datapackage.json`
- `generated/`
- `exports/`
- `../DATA-REVIEW-GUIDE.md`
- `site/src/content/calculators/digital-inventory.json`
- `site/public/data/`
- `site/public/schemas/`

Portable releases deliberately exclude the frozen fixture, private development
research notes, presentation files, and other legacy artifacts. Their
`datapackage.json` points to the public Sources & Method page and the package's
own `README.md` instead of an old Git object. This keeps the release usable
after a clean-history publication and avoids redistributing quote-heavy source
notes.

The package metadata scopes CC0-1.0 to project-created structured data and
schemas, and CC BY 4.0 to original project prose fields. Third-party titles and
bibliographic metadata remain under their original terms and are not
relicensed.

The canonical calculator metadata points to the public data and Sources &
Method pages. Removed private research-file paths remain only in the frozen
baseline fixture.

`manifest.json` preserves collection order explicitly. Each record also has an `order` field. `systemBoundary` and `lastReviewed` are migration metadata added to activity records; the legacy adapter removes those fields when reconstructing the deployed calculator object.

## Verification

From the repository root:

```bash
npm ci
npm run data:build
npm run data:export
npm run data:verify
```

For v0.1.0, `data:parity` reconstructs and deep-compares the checksum-locked
baseline fixture. For later versions, it compares current canonical collections
with the prior immutable release and permits only stable IDs declared in
`releases/vX.Y.Z.json`. Undeclared numeric, source, or method drift fails.

While the original commit remains available, maintainers can optionally verify the fixture against it:

```bash
node scripts/compare-legacy-data.mjs --cross-check-git
```

If history is later sanitized and that commit no longer exists, the optional check is skipped; fixture-based parity continues to work.

`data:check-generated` reconstructs every generated artifact in memory and fails if a committed generated file is missing, stale, unexpected, or hand-edited.

The Data Package descriptors are valid Frictionless packages. To check both the
root descriptor and immutable release with the official CLI:

```bash
uvx --from frictionless frictionless validate data/datapackage.json
uvx --from frictionless frictionless validate data/exports/v0.1.0/datapackage.json
uvx --from frictionless frictionless validate data/exports/v0.2.0/datapackage.json
```

The CSV uses a Frictionless Table Schema. JSON resources retain their full JSON
Schema references in `custom.jsonSchema`, so the package does not misrepresent a
JSON Schema as a table schema.

## Metrics and system boundaries

Version 0.2.0 intentionally changes the image row and documents its GPU-only
boundary. The public CSV retains the established compatibility fields:

- `server_network_energy_wh`
- `total_system_energy_wh`
- `direct_water_ml`
- `total_water_ml`

The exact row-level scope remains in the preserved `note`, source relationships, and method records. The normalized `system_boundary` value is `legacy-row-specific` so consumers do not mistake heterogeneous legacy row boundaries for a newly standardized methodology.

## Versioning

The current release is `0.4.0`; releases `0.1.0` through `0.3.0` remain immutable.

Each later release has a machine-readable decision under `releases/`. The
release-diff verifier compares it with the prior immutable export and rejects
undeclared record changes. Older release directories and archives are preserved
when `latest/` advances.

- MAJOR: breaking schema, unit, stable-ID, or system-boundary change
- MINOR: backward-compatible activity, field, or source addition
- PATCH: corrections or metadata/value revisions that preserve schema

Scientific significance must be described separately from technical compatibility in future release notes.
