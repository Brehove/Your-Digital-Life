# Contributing to Your Digital Life

Contributions are welcome when they make a value, source, method, explanation,
or interface more accurate and reusable. Evidence quality and traceability take
priority over the number of records.

## Choose the right channel

1. **Questionable existing value:** submit the Data correction Issue Form.
2. **New activity, source, or dataset field:** submit the New data or source
   Issue Form.
3. **Methodological question or open-ended proposal:** start a Methodology
   Discussion.
4. **Website defect:** submit the Website bug Issue Form.
5. **Documentation problem:** submit the Documentation Issue Form.
6. **Security or private-data problem:** do not open a public issue; follow
   `SECURITY.md`.

For non-trivial work, wait for a maintainer to confirm scope before investing in
a pull request. This avoids parallel changes to canonical and generated files.

## Evidence required for a data change

A correction or addition must identify:

- the stable record ID, or a proposed ID for a new record;
- current and proposed values;
- unit and system boundary;
- source URL or DOI;
- exact page, table, figure, appendix, or section;
- publication date and, for web sources, access date;
- calculation with intermediate values and unit conversions;
- confidence/status and material limitations;
- affected scenarios, charts, exports, and public explanations;
- relevant affiliation or conflict of interest; and
- affirmation that you have the right to submit every copied or adapted part.

Prefer primary, peer-reviewed, standards, or institutional sources. A secondary
source can be useful, but explain why the primary source is unavailable. Do not
convert a company claim into an independently verified measurement.

## Rights and licensing

Your contribution is submitted under the license governing its destination:

- code: MIT;
- data and schemas: CC0 1.0 Universal; and
- original prose and documentation: CC BY 4.0.

By submitting, you represent that you have the right to do so. You retain rights
in your contribution while granting the destination license. Do not submit
confidential information, personal data, paywalled full text, publisher charts,
logos, screenshots, or substantial quotations without documented permission.
Facts can be cited; a citation does not grant permission to copy the source's
expression.

## Development workflow

1. Create or link the issue/Discussion that defines the change.
2. Branch from the current protected default branch.
3. Change the appropriate authority, not only a generated file. For
   reviewer-only citation, provenance, or evidence-status corrections, edit
   `data/review/`. Changes to canonical calculator
   records under `data/` require the normal versioned release process.
   When feedback comes from another calculator, reviewer, or recurring
   conversation, also update the structured crosswalk in
   `data/review/external-comparisons.json`; that history is copied into each
   portable release from v0.2.0 onward. See
   `docs/evidence-update-workflow.md`.
4. Regenerate derived files with the repository script.
5. Run the relevant validations and inspect the diff for unrelated output.
6. Submit one logically reversible change per pull request.

For the website baseline:

```bash
cd site
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

If a change affects public behavior, also test the affected routes and include
screenshots for visible changes. Data changes must include schema, referential
integrity, generated-artifact, and calculator parity tests when those scripts
are available.

## Pull request requirements

Complete every applicable field in the pull request template, including:

- linked issue or Discussion;
- affected stable IDs and system boundaries;
- source and calculation summary;
- schema or compatibility impact;
- generated files and command used;
- public output impact;
- tests run;
- screenshots for UI changes;
- release-note/changelog impact; and
- right-to-submit affirmation.

Maintainers may request a smaller pull request, additional evidence, or a
methodology Discussion before accepting a change. Acceptance means the change
fits the project's current evidence and maintenance standards; it is not a
guarantee that the estimate will never change.

## Review and decision record

Material methodology changes require public rationale in the issue, Discussion,
pull request, changelog, or Architecture Decision Record. Stable IDs are not
silently reused for a different concept. Breaking data changes require a major
data-version increment and migration notes.

Every version after v0.1.0 also requires a release decision under
`data/releases/`. Its declared collection changes are checked against the prior
immutable export, so an unrelated value or source cannot drift into the release.
