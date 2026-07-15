# Your Digital Life canonical calculator data

This directory is the update authority for the public calculator. Root generation
produces the checked-in Astro snapshot at
`site/src/content/calculators/digital-inventory.json`, the portable releases in
`data/exports/`, and byte-identical downloads under `site/public/data/`.

Git commit `063322e93e27704b447a495a838e552067928127` and the checksum-locked fixture
under `tests/fixtures/` record the deployed pre-migration baseline. They are
regression provenance, not current update authorities.

## Included in v0.1.0

- 12 calculator activities
- 12 calculator source records
- 5 device profiles
- 5 presets, including Clear
- 6 method sections
- JSON Schemas for every included record type
- deterministic JSON and CSV exports
- matching `latest` and immutable `v0.1.0` export trees
- deterministic ZIP archive and SHA-256 checksums
- a generated Astro calculator entry and public download tree
- a checksum-locked deployed-baseline fixture for parity tests (repository only,
  not included in portable exports)

Scenarios, claims/facts, charts, and the broader site source registry are intentionally deferred to later normalization gates. Their current representations are not modified here.

## Reviewer evidence overlay

`review/source-evidence.json` is a validated, one-to-one review overlay for the
12 calculator source IDs. It adds corrected citations, precise locators,
evidence type, review status, measurement boundary, workload and hardware
scope, geography, derivation, and limitations. `review/activity-evidence.json`
adds row-level provenance summaries, formula-traceability status, additional
review-only source relationships, and unresolved findings for all 12
activities. Each overlay has a matching schema in `review/`.

The overlay is intentionally **not** a calculator input, website input, or
v0.1.0 release artifact. Keeping it separate allows reviewers to inspect
bibliographic corrections and evidence limitations without rewriting the
immutable release or changing the deployed site. A future dataset version may
merge reviewed fields only through the normal release and compatibility
process.

The root `DATA-REVIEW-GUIDE.md` is generated from the canonical calculator
records plus these overlays. It is the recommended human-readable starting
point.

While v0.1.0 remains frozen, use these update rules:

- correct citations, locators, evidence classifications, or review findings in
  `review/`, then run `npm run data:build`;
- do not edit `sources/` merely to make frozen bibliographic metadata match the
  overlay; and
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

`data:parity` reads the checksum-locked fixture at
`tests/fixtures/deployed-calculator-063322e.json`, applies three precisely
declared publication allowances, and then deep-compares the complete object.
Those allowances cover the `scenario-methods` public URL, replacement of dead
private research-file pointers, and canonical maintenance instructions. Every
numeric value, ID, order, preset, device setting, source relationship,
substantive method note, and method table remains strict. Normal tests do not
need the historical Git object to exist.

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
```

The CSV uses a Frictionless Table Schema. JSON resources retain their full JSON
Schema references in `custom.jsonSchema`, so the package does not misrepresent a
JSON Schema as a table schema.

## Metrics and system boundaries

No numerical value or calculator behavior changed during canonicalization. The public CSV uses the deployed calculator's existing fields:

- `server_network_energy_wh`
- `total_system_energy_wh`
- `direct_water_ml`
- `total_water_ml`

The exact row-level scope remains in the preserved `note`, source relationships, and method records. The normalized `system_boundary` value is `legacy-row-specific` so consumers do not mistake heterogeneous legacy row boundaries for a newly standardized methodology.

## Versioning

The first canonical public release is `0.1.0`.

- MAJOR: breaking schema, unit, stable-ID, or system-boundary change
- MINOR: backward-compatible activity, field, or source addition
- PATCH: corrections or metadata/value revisions that preserve schema

Scientific significance must be described separately from technical compatibility in future release notes.
