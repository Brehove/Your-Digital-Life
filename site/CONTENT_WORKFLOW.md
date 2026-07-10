# Content workflow

## Sources of truth

- Root `data/` owns calculator activities, sources, devices, presets, methods,
  schemas, and portable releases.
- `site/src/content/` owns public page copy, broader facts and sources,
  scenarios, chart metadata, resources, and update notes.
- `site/src/data/charts/` owns chart series that have not yet moved into root
  canonical data.
- The calculator content entry consumed by Astro is generated from root data.
  Do not edit it by hand.

Legacy webinar decks, workbooks, and quote-heavy research notes are outside the
public repository and are not update authorities.

## Update process

1. Change the canonical record, preserving its stable ID.
2. Record the source URL or DOI, precise locator, unit, boundary, calculation,
   confidence/status, and review date.
3. Run the root data build/export command when calculator data changes.
4. Update any affected public fact, scenario, chart, or explanation.
5. Add an entry under `src/content/updates/` for visible value, method, or copy
   changes.
6. Run root data verification and the site checks documented in `README.md`.

Generated outputs are reviewable artifacts, not editable inputs. A pull request
that changes them must also change the canonical input and state the generation
command.

## Status rules

- `verified`: directly supported by the cited source and correctly scoped
- `inferred`: derived from strong source data but not stated directly
- `estimated`: modeled or analogical
- `contested`: materially disputed or highly scope-sensitive

## Deployment implication

Cloudflare Workers Builds builds only the `site/` directory, but the full Git
repository is checked out first. Generated site snapshots and public downloads
must therefore be committed before a merge to `main`. Cloudflare is a delivery
layer, not a second data source.
