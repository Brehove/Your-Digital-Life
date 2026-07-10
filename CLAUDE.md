# Claude instructions for Your Digital Life

Follow `AGENTS.md`; it is the complete repository instruction set.

Critical rules:

- Work only from the public data and website sources in this repository. Legacy
  webinar decks, workbooks, outlines, and quote-heavy research notes are
  intentionally excluded and must not be reintroduced.
- The live calculator's editable source is root `data/`. Generated calculator
  snapshots and export files must not be edited by hand. General facts,
  sources, scenarios, chart metadata, and chart series live in their
  corresponding `site/src/content/` and `site/src/data/` directories.
- Historical “Section 2” and “Section 3” labels are provenance only; no public
  parent-folder research files exist.
- Never hardcode public values in components when a content record owns them.
- Never commit `site/node_modules/`, `site/dist/`, or `site/.astro/`.
- Before handing off a change, run from `site/`:

  ```bash
  npm ci
  ASTRO_TELEMETRY_DISABLED=1 npm run check
  ASTRO_TELEMETRY_DISABLED=1 npm run build
  npm run test:routes
  ```

- Calculator or export changes must first run `npm ci` and
  `npm run data:verify` from the repository root.

- Production is a Cloudflare Worker built from `site/` after a reviewed merge
  to `main`. Do not deploy directly or alter the Worker/build contract during
  unrelated work.
- Follow `LICENSE.md`, `RIGHTS_AND_ATTRIBUTIONS.md`, `CONTRIBUTING.md`, and
  `docs/architecture.md` for rights, evidence, and data-flow requirements.
