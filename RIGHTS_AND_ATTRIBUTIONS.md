# Rights and attributions

This file separates material the project can license from material that is
only cited or was intentionally kept outside the public repository. A source
citation documents evidence; it does not grant permission to copy the source.

## Public repository classes

| Material | Rights basis | Project terms | Reuse note |
| --- | --- | --- | --- |
| Website and tooling code | Project-authored | MIT | Retain the copyright and license notice |
| Project-created structured records, calculations, schemas, and exports | Project-authored compilation of facts and cited evidence | CC0 1.0 Universal | Preserve stable IDs and citations when practical so values remain auditable |
| Original project prose and methodology | Project-authored | CC BY 4.0 | Credit Your Digital Life and Joel Gladd, link to the source and license, and identify adaptations |
| Source titles, author names, URLs, publication facts, and short attributed references | Third-party bibliographic metadata | Not relicensed | Use only as evidence metadata; do not imply endorsement |
| Software dependencies and their notices | Respective dependency authors | Their upstream terms | The project licenses do not replace dependency licenses |
| Product, company, and institutional names or marks | Respective owners | Not relicensed | Descriptive use only; no endorsement is implied |

Some JSON and Markdown files mix structured values, original project prose,
and third-party bibliographic metadata. The project licenses apply only to the
parts the project controls. See `LICENSE.md` for the path-based license map.

## Material intentionally excluded

The following legacy presentation-development paths were present in the
private predecessor repository and are intentionally absent from the public
distribution:

- `Webinar7.pptx`
- `webinar7-chart-data-first-pass.xlsx`
- `References.md`
- `Section 1 - Data Centers - Sources.md`
- `Section 2 - Cost of Prompting - Sources.md`
- `Section 3 - Scenarios.md`
- `Section 4 - Pedagogy Tips.md`
- `Webinar 7 Outline.md`

These files are not required to build the website or reproduce the public
calculator data. They were excluded because they contain quote-heavy working
notes, mixed-rights presentation material, or unresolved third-party assets.
No project license is granted to private copies.

The audited legacy presentation included a Global Water Intelligence chart
marked against copying without permission, an unresolved aerial photograph,
and unresolved stock-style icons. It must never be copied into this repository
or any public Git history without separate rights clearance.

## Publication-history rule

Deleting a file from a branch tip does not remove it from Git history. The
public repository must therefore begin with a clean history that has never
contained the excluded paths. The predecessor repository and its verified
bundle remain private as an archival record; they are not the public upstream.

Before any future visibility or repository migration, scan the exact public
commit and all reachable refs for secrets, personal data, archives, and excluded
paths. Do not merge or push branches based on the private predecessor history
into the clean public repository.

## Reporting an omission

Open a documentation issue if an attribution is missing. If the omission
exposes private information or a non-public URL, use the private security
advisory channel in `SECURITY.md` instead of a public issue.
