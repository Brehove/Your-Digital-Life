# Your Digital Life repository instructions

## Scope

This repository is the versioned source for the Your Digital Life public data,
website, and project governance. The production site is
`https://your-digital-life.org/`.

Legacy presentation decks, workbooks, quote-heavy research notes, and webinar
outlines are intentionally outside the public distribution. Do not reintroduce
them or copy third-party figures, papers, screenshots, or substantial excerpts
into this repository.

## Current sources of truth

- Root `data/` is the authoritative editable record for the live calculator:
  source catalog, activity values, device profiles, presets, method tables,
  schemas, and release metadata.
- `site/src/content/sources/` holds the general source registry.
- `site/src/content/facts/`, `scenarios/`, and `charts/` hold structured records
  used elsewhere on the site.
- `site/src/data/charts/` holds numeric chart series.
- `site/src/content/pages/`, `resources/`, and `updates/` hold public prose,
  resource entries, and the maintenance log.
- `data/generated/`, `data/exports/`, the site calculator snapshot, and public
  download files are generated from root canonical data and must not be edited
  by hand.

Some calculator fields and historical update entries retain labels such as
“Section 2” or “Section 3.” Those are provenance labels from the private
development archive, not pointers to public files and not update authorities.

See `docs/architecture.md` for the data flow and ownership boundaries.

## Data and content changes

1. Preserve stable IDs. Do not silently reuse an ID for a different activity,
   source, boundary, or meaning.
2. Record the unit, system boundary, source URL/DOI, precise source locator,
   calculation, confidence/status, and review date for quantitative changes.
3. Update the canonical content record rather than hardcoding values in an
   Astro component.
4. For calculator changes, update the canonical source record before changing
   dependent rows, then update every affected preset and method section in the
   same pull request.
5. Keep direct and indirect water, server/network and total-system energy, and
   measured and derived values explicitly separated.
6. Add an entry under `site/src/content/updates/` when public assumptions,
   methods, values, or visible copy change.
7. Do not hand-edit generated release outputs. Change their canonical input and
   regenerate them with the documented command.

Source citations establish evidence; they do not grant permission to copy the
source's expression. Follow `LICENSE.md`, `RIGHTS_AND_ATTRIBUTIONS.md`, and
`CONTRIBUTING.md`.

## Generated and ignored paths

Do not commit:

- `site/node_modules/`
- `site/dist/`
- `site/.astro/`
- local secrets, environment files, editor state, or OS metadata

Cloudflare serves `site/dist/`, but Git and the canonical source records—not the
built output or Cloudflare dashboard—remain the source of truth.

## Required verification

Use the Node version pinned in `site/.node-version`. From `site/`, run:

```bash
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run test:routes
```

Calculator or export changes must first run from the repository root:

```bash
npm ci
npm run data:verify
```

Review the generated route contract and any affected calculator output. Add
browser and accessibility checks for visible UI changes. The
`.github/workflows/validate-site.yml` workflow runs the baseline checks on pull
requests and on pushes to `main`.

## Deployment safety

Production uses Cloudflare Workers Builds with static assets:

- production branch: `main`
- build root: `site/`
- build command: `npm run build`
- output: `site/dist/`
- Worker name: `your-digital-life`
- custom domain: `https://your-digital-life.org/`

The normal deployment path is a reviewed merge to `main`. Do not add or use a
direct local production-deploy command, change the Worker name, alter the build
root/output, rewrite `main`, or change Cloudflare/GitHub settings as part of an
ordinary content or cleanup change. See `site/DEPLOYMENT.md`.

## Change discipline

- Keep pull requests small, reversible, and limited to one logical concern.
- Preserve unrelated user changes and do not rewrite history without a separate,
  backed-up, explicitly approved migration runbook.
- Treat the repository license map, citation metadata, governance documents,
  Issue Forms, and route contract as maintained product surfaces.
