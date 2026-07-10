# Governance

Your Digital Life uses a maintainer-led model designed for a small evidence and
software project.

## Roles

### Initial final maintainer

Joel Gladd is the initial final maintainer. He has final responsibility for:

- repository administration and releases;
- data model and system-boundary decisions;
- acceptance or rejection of contributions;
- moderation and Code of Conduct enforcement;
- security response;
- appointment or removal of maintainers; and
- resolving deadlocks.

The final-maintainer role is explicit because pretending that a one-maintainer
project is consensus-governed would make decisions less transparent, not more.

### Maintainers

Maintainers may triage issues, review pull requests, moderate Discussions, and
approve changes within the scopes recorded in `CODEOWNERS`. A maintainer must:

- make evidence-based decisions;
- disclose relevant conflicts of interest;
- preserve stable identifiers and release history;
- follow the rights and security policies; and
- document material methodology decisions.

### Contributors

Anyone who follows `CONTRIBUTING.md` may propose evidence, data, documentation,
or code. A merged contribution does not automatically confer maintainer status.

## Decision process

Routine corrections can be decided in an issue and pull request. Significant
methodology, schema, licensing, governance, or compatibility changes use this
sequence:

1. open a Methodology Discussion or proposal issue;
2. state the problem, evidence, alternatives, and compatibility consequences;
3. allow reasonable public review;
4. record the maintainer's decision and rationale; and
5. implement through a reviewed pull request.

The maintainer can reject a proposal because evidence is insufficient, the
system boundary is incompatible, maintenance cost is disproportionate, rights
are unclear, or the change falls outside project scope. The rationale should be
specific enough to revisit if new evidence appears.

## Conflicts of interest

Reviewers must disclose employment, funding, authorship, vendor, advocacy, or
other relationships that could reasonably affect a data or methodology
decision. Disclosure does not automatically disqualify participation. The final
maintainer may assign another reviewer, require independent evidence, or defer a
change.

## Becoming a maintainer

The final maintainer may invite a contributor who has demonstrated sustained,
constructive work; sound evidence judgment; dependable review; and respect for
the project's licenses and conduct rules. Scope and permissions are recorded in
a pull request that updates this file and `CODEOWNERS`.

## Removing a maintainer

A maintainer may step down at any time. The final maintainer may remove access
for inactivity, security risk, repeated policy violations, unmanaged conflicts,
or loss of trust. When safe and appropriate, the governance change and its
project-facing rationale are recorded in the repository.

## Releases and reversibility

Protected-branch review is required for production changes. Released dataset
versions are immutable. Errors are corrected in a new version with transparent
notes; published artifacts and tags are not silently replaced. Emergency site
rollback restores service first, followed by a normal revert pull request that
restores repository consistency.

## Amendments

Governance changes use the significant-change process above. Until additional
maintainers are appointed, Joel Gladd resolves any ambiguity in this document.
