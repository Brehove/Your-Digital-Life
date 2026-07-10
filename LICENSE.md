# Licensing

Your Digital Life is a multi-license project. A file's location and material
type determine its license. No license in this repository grants rights that
the project does not control.

## License map

| Material | Paths or scope | License |
| --- | --- | --- |
| Website and tooling code | `site/src/components/`, `site/src/layouts/`, `site/src/lib/`, `site/src/pages/`, `site/src/styles/`, `site/src/content.config.ts`, website configuration files, validation/export scripts, and GitHub workflow code | [MIT](LICENSES/MIT.txt) |
| Structured and generated data | `data/` except prose documentation; structured records in `site/src/content/facts/`, `site/src/content/sources/`, `site/src/content/scenarios/`, `site/src/content/charts/`, and `site/src/data/charts/` | [CC0 1.0 Universal](LICENSES/CC0-1.0.txt) |
| Calculator data | Canonical records and schemas under `data/`, plus generated calculator and download snapshots under `site/src/content/calculators/` and `site/public/` | [CC0 1.0 Universal](LICENSES/CC0-1.0.txt) |
| Original prose and documentation | Original project-authored prose in Markdown, including methodology, educational text, update notes, and community documentation | [CC BY 4.0](LICENSES/CC-BY-4.0.txt) |
| Third-party material | Quotations, source titles, externally authored excerpts, logos, trademarks, screenshots, photographs, charts, papers, dependency code, and other identified third-party material | Not relicensed; the original rightsholder's terms apply |
| License texts and Contributor Covenant | `LICENSES/` and the substantially unmodified Contributor Covenant portions of `CODE_OF_CONDUCT.md` | Their stated original terms apply |

### Mixed-content files

Some files combine facts, project prose, and quotations. In those files:

- factual values and project-created structured data are offered under CC0;
- original explanatory prose is offered under CC BY 4.0; and
- third-party quotations and excerpts are excluded from both grants.

For example, this rule applies to
`site/src/content/calculators/digital-inventory.json` and other content records
that combine numeric fields with explanatory strings.

## Material outside the public distribution

Legacy presentation-development artifacts and quote-heavy research notes are
intentionally omitted from this tree. Their omission does not apply a license to
private copies or to old Git objects. See `RIGHTS_AND_ATTRIBUTIONS.md` for the
exact historical paths that must not remain reachable in a public repository.

## Attribution for CC BY material

Unless a file supplies a more specific credit, use:

> Your Digital Life, Joel Gladd, licensed under CC BY 4.0. Source:
> https://github.com/Brehove/Your-Digital-Life

When sharing an adaptation, identify that you changed the material. CC BY does
not require attribution for material that is not protected by copyright, but
keeping record IDs and source citations is strongly encouraged.

## Third-party material

Source citations describe evidence; they do not imply that the linked or quoted
work is openly licensed. This project does not relicense:

- quoted language from research papers, reports, articles, posts, or videos;
- publisher-rendered charts or figures;
- institutional or company logos and trademarks;
- photographs or screenshots; or
- software dependencies installed through the package manager.

Review `RIGHTS_AND_ATTRIBUTIONS.md` before reusing any mixed-content or binary
file. If that file conflicts with this summary for a specifically identified
asset, the more specific rights entry controls.

## Contributions

By submitting a contribution, you agree that your contribution is made under
the license governing its destination:

- code contributions: MIT;
- data and schema contributions: CC0 1.0 Universal; and
- prose and documentation contributions: CC BY 4.0.

You must have the right to submit the contribution. Linking to a source does not
grant permission to copy it. See `CONTRIBUTING.md` for the evidence and rights
requirements.
