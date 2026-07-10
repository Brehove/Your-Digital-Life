# Your Digital Life

Your Digital Life is an evidence-traceable dataset and website for comparing
the energy and water implications of common digital activities. The public
website is [your-digital-life.org](https://your-digital-life.org/).

The project has two connected products:

1. a portable, reviewable dataset with stable records, source metadata, and
   explicit system boundaries; and
2. an Astro website and calculator that present those records for a general
   audience.

GitHub is the canonical place to inspect data, propose corrections, discuss
methods, and review changes. The website is the public reading and exploration
layer. Cloudflare receives built website output; it is not a second source of
truth.

## Repository status

This tree is the public project surface. Legacy presentation
development files—including decks, workbooks, outlines, bibliographic scratch
files, and quote-heavy research notes—are intentionally omitted because they
are not required to run, inspect, or improve the site and contain mixed or
unresolved third-party rights.

The public repository starts from a clean history that has never contained
those excluded paths. The private predecessor history is preserved separately
and must never be merged into this repository. See
`RIGHTS_AND_ATTRIBUTIONS.md`.

## Repository map

| Path | Purpose |
| --- | --- |
| `data/` | Canonical calculator data, schemas, generated releases, and documentation |
| `docs/` | Current architecture documentation and clearly marked historical project plans |
| `site/` | Astro website and the current production-facing content records |
| `site/src/content/` | Facts, sources, scenarios, calculator records, pages, and updates consumed by the site |
| `site/src/data/` | Numeric chart series consumed by the website |
| `.github/` | CI, contribution forms, ownership, labels, and review templates |

See [`docs/architecture.md`](docs/architecture.md) for the current data flow and
the boundary between canonical input and generated output.

## Current data authority

Root `data/` owns the calculator activities, source records, devices, presets,
methods, schemas, and portable releases. The site consumes a generated snapshot
of those records, and the public downloads are generated from the same inputs.

General source, fact, scenario, and chart records remain in the site content
collections, while numeric chart series remain in `site/src/data/charts/`.
They are public and machine-readable, but are deferred from root normalization
until each collection has its own compatibility tests. Historical labels such
as “Section 2” and “Section 3” remain in some frozen provenance fields; they do
not refer to public files or current update authorities.

## Run the website locally

The supported Node version is recorded in `site/.node-version`.

```bash
npm ci
npm run data:verify
cd site
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run dev
```

The production build contract is:

- build root: `site/`
- build command: `npm run build`
- static asset output: `site/dist/`
- hosting integration: Cloudflare Workers Builds

A pull request must not change that contract unintentionally.

## Inspect or improve the data

Use the matching GitHub channel:

- questionable value: open a **Data correction** issue;
- missing activity or source: open a **New data or source** issue;
- methodological question: start a **Methodology** Discussion;
- concrete change: open an issue first, then submit a pull request.

Every proposed value needs a stable record ID, unit, system boundary, primary
source when available, precise source locator, intermediate calculation, and a
right-to-submit affirmation. See `CONTRIBUTING.md`.

## Licensing

This repository is deliberately multi-licensed:

- code: MIT;
- project-created data and schemas: CC0 1.0 Universal;
- original prose and methodology: CC BY 4.0; and
- third-party material: not relicensed.

The exact path and mixed-content rules are in `LICENSE.md`. Known third-party
and excluded legacy assets are in `RIGHTS_AND_ATTRIBUTIONS.md`.

## Citation

GitHub can read `CITATION.cff`. The first versioned dataset release is v0.1.0.
No DOI has been assigned.

## Governance and support

Joel Gladd is the initial final maintainer. The decision process and path to
additional maintainers are described in `GOVERNANCE.md`. Use `SUPPORT.md` to
choose a support channel and `SECURITY.md` for private vulnerability reports.
