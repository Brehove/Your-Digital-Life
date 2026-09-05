# Repository architecture

Your Digital Life separates editable evidence, generated products, website
presentation, and hosting so each layer has one clear responsibility.

```text
data/ canonical records, schemas, release decisions, and review crosswalks
  -> scripts validate, assemble, and export
  -> data/exports versioned JSON, CSV, schemas, checksums, and ZIP
  -> site generated calculator snapshot and public data downloads
  -> Astro static build in site/dist
  -> Cloudflare Worker static assets
```

## Ownership boundaries

| Path | Responsibility | Edit directly? |
| --- | --- | --- |
| `data/activities`, `sources`, `device-profiles`, `presets`, `methods` | Canonical calculator records | Yes |
| `data/schemas` and `data/manifest.json` | Validation and dataset contract | Yes, with compatibility review |
| `data/releases` | Version-to-version scientific and collection change declarations | Yes, once per release |
| `data/review/external-comparisons.json` | Repeatable outside-claim crosswalk and disposition history; copied into portable releases | Yes |
| `data/generated` and `data/exports` | Reproducible generated products | No |
| `tests/fixtures` | Frozen deployed-baseline contract | No, except an explicit baseline migration |
| `site/src/content` | Public prose and non-calculator content collections | Yes |
| `site/src/data/charts` | Chart series awaiting later normalization | Yes |
| `site/src/content/calculators`, `site/public/data`, `site/public/schemas` | Generated site snapshot and public downloads | No |
| `site/dist` | Local build output | Never commit |

## Calculator compatibility

The first canonical data release reproduces every numeric and behavioral field
from the deployed calculator. Parity tests compare the assembled records with a
checksum-locked fixture plus three exact publication allowances: the public
scenario-methods URL, public provenance links, and canonical maintenance
instructions. The tests continue to work even if the private predecessor commit
is absent. Preset totals and device-specific streaming behavior are frozen as
explicit tests.

Later releases compare current canonical collections with the prior immutable
export. Added, modified, and removed stable IDs must match the current release
decision exactly. Historical version directories and archives remain
byte-identical while `latest/` advances.

Activity records may include `displayQualifier` for a visible qualification and
`shortLabel` for compact presentation. The portable activities CSV carries the
qualification as the optional `display_qualifier` column so consumers do not
lose a material boundary caveat when using the tabular export.

## Public contribution flow

GitHub Issues and Discussions collect evidence and scope proposals. Pull
requests change canonical inputs, regenerate derived artifacts, and pass the
same validation used locally. Cloudflare deploys reviewed `main`; it does not
accept direct data edits.

## Deferred normalization

Calculator data is canonical at root. Broader facts, scenarios, chart metadata,
chart series, and additional source records still live in the site collections.
They remain public and machine-readable, but should move into root data only in
small compatibility-tested slices rather than in a single destructive rewrite.
