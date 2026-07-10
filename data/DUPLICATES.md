# Duplicate representations retained after calculator canonicalization

This document records representations that remain separate after the calculator moved to canonical root data. Consolidating them would change broader site maintenance behavior and belongs in a later compatibility-tested slice.

## Calculator source catalog and site source registry

All 12 calculator sources also have a file under `site/src/content/sources/`.
They match exactly on the shared fields: title, organization, authors, URL,
publication date, source tier, source type, notes, and tags. The canonical
calculator source additionally carries its stable ID, collection order, and
`usedFor` relationships. The `scenario-methods` URL correction is explicitly
enumerated in the frozen-baseline parity allowances.

## Presets and scenarios

Calculator presets and the four site scenario records overlap conceptually but are not duplicate datasets. Their totals differ because the current calculator has device-aware total-energy behavior. They remain separate until an explicit methodology decision is made.

## Charts

Chart metadata, numeric arrays, and some derived copy are currently split among:

- `site/src/content/charts/*.json`
- `site/src/data/charts/*.json`
- `site/src/lib/chart-data.ts`

This canonical calculator slice does not move or reconcile them.

## Claims and source citations

Fact records currently repeat source metadata rather than referencing only stable source IDs. This slice does not normalize those 50 records.
