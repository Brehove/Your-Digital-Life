# Your Digital Life website

Astro site for [your-digital-life.org](https://your-digital-life.org/), deployed
as static assets on a Cloudflare Worker.

## Run locally

Use the Node version in `.node-version`:

```bash
npm ci
npm run dev
```

Before handoff:

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run test:routes
```

Calculator data is maintained at repository root under `data/`. Run the root
data generation and verification commands before these site checks when that
data changes.

## Content model

Astro content collections provide pages, calculators, facts, scenarios,
charts, resources, updates, and sources. Numeric chart series currently live
under `src/data/charts/`. Public values belong in data or content records, not
component code.

See `CONTENT_WORKFLOW.md` for editing rules and `DEPLOYMENT.md` for the verified
Git-first Cloudflare contract. Direct production deployment is intentionally
not exposed as a package script.
