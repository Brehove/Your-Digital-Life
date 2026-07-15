# Evidence update workflow

This workflow preserves the reasoning behind calculator changes when a reviewer,
external calculator, new paper, or conversation challenges an existing value.
The outside source can prompt a review without being mislabeled as the primary
authority for the adopted coefficient.

## Decision sequence

1. Identify the stable activity or method ID and record the current value, unit,
   boundary, derivation, and status.
2. Add or update the external comparator in
   `data/review/external-comparisons.json`. Record its claim separately from the
   project's before and after claims. Record the exact external URL, sheet or
   section locator, and access date on each comparison record.
3. Assign a disposition: `adopt`, `adapt`, `retain`, `reject`, `open`, or
   `not-comparable`.
4. Add every underlying study to `data/sources/` before changing a dependent
   activity or method. Give each source a matching evidence-review record with
   precise locators and limitations.
5. Put accepted scientific logic in a canonical method record. Review overlays
   explain the audit; canonical methods explain the live calculator.
6. Change canonical activity values only after the functional unit and boundary
   match. Recalculate every derived field and affected preset in the same change.
7. Create `data/releases/vX.Y.Z.json` declaring every added, modified, and
   removed stable ID. Undeclared collection drift fails verification.
8. Regenerate, verify, inspect the public Sources & Method page, and add a public
   update entry.

## Updating an existing conversation

Do not overwrite why an earlier decision was made. Update the existing stable
comparison record when a new message only adds evidence to the same claim. Add
a new dated comparison record when the external claim, functional unit,
boundary, or disposition changes materially. Preserve the earlier released
record in its immutable versioned export and describe the reversal in the new
release decision.

## Evidence hierarchy

- Attribute adopted measurements to the underlying measurement or model.
- Attribute the path of discovery or comparative synthesis to the reviewer or
  calculator that surfaced it.
- Never describe agreement between two calculators as independent confirmation
  when one calculator borrowed the other's value or source chain.
- Keep measured, modeled, secondary, and internal values visibly distinct.
- Record arithmetic corrections without implying that they validate an
  otherwise mismatched system boundary.

## Release safety

`latest/` must equal the current versioned directory. Older version directories,
ZIP archives, and checksums are carried forward byte-for-byte. The release-diff
validator compares the current canonical collections with the prior immutable
release and permits only the stable IDs declared in the release decision. The
external-comparison crosswalk and schema ship inside each release beginning
with v0.2.0, so a later revision cannot erase the portable history.

Run from the repository root:

```bash
npm run data:build
npm run data:export
npm run data:verify
```

Then run the required Astro checks from `site/`.
