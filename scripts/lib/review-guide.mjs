import path from "node:path";
import { DATA_DIR, readJson } from "./data.mjs";

export const REVIEW_DATA_PATH = path.join(DATA_DIR, "review/source-evidence.json");
export const REVIEW_SCHEMA_PATH = path.join(DATA_DIR, "review/source-evidence.schema.json");
export const ACTIVITY_REVIEW_DATA_PATH = path.join(DATA_DIR, "review/activity-evidence.json");
export const ACTIVITY_REVIEW_SCHEMA_PATH = path.join(
  DATA_DIR,
  "review/activity-evidence.schema.json"
);
export const EXTERNAL_COMPARISON_DATA_PATH = path.join(
  DATA_DIR,
  "review/external-comparisons.json"
);
export const EXTERNAL_COMPARISON_SCHEMA_PATH = path.join(
  DATA_DIR,
  "schemas/external-comparisons.schema.json"
);

const REVIEW_STATUS_LABELS = Object.freeze({
  "reviewed-with-limitations": "Reviewed with limitations",
  "needs-primary-source": "Needs a primary source",
  "needs-update": "Needs an update",
  "illustrative-only": "Illustrative only",
  "internal-method": "Internal method"
});

const EVIDENCE_TYPE_LABELS = Object.freeze({
  "direct-measurement": "Direct measurement",
  "modeled-estimate": "Modeled estimate",
  "secondary-synthesis": "Secondary synthesis",
  "expert-analysis": "Expert analysis",
  "internal-method": "Internal method",
  "mixed-method": "Mixed method"
});

const FORMULA_STATUS_LABELS = Object.freeze({
  "source-value": "Direct source value",
  "documented-derivation": "Documented derivation",
  "partial-derivation": "Partially documented derivation",
  "undocumented-internal-coefficient": "Undocumented internal coefficient"
});

function markdownCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  return String(value);
}

function joinNatural(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function sourceAnchor(sourceId) {
  return `source-${sourceId}`;
}

function renderSourceLinks(sourceIds, sourceById, reviewById) {
  return sourceIds
    .map((sourceId) => {
      const source = sourceById.get(sourceId);
      const reviewedTitle = reviewById.get(sourceId)?.citation.title;
      return `[${reviewedTitle ?? source?.title ?? sourceId}](#${sourceAnchor(sourceId)})`;
    })
    .join("; ");
}

function sourceReviewFlags(activity, reviewById) {
  return activity.sourceIds
    .map((sourceId) => ({ sourceId, review: reviewById.get(sourceId) }))
    .filter(({ review }) => review && review.reviewStatus !== "reviewed-with-limitations");
}

function renderReviewFlags(activity, reviewById) {
  const flags = sourceReviewFlags(activity, reviewById);
  if (!flags.length) return "No unresolved status flag";
  return flags
    .map(
      ({ sourceId, review }) =>
        `[${sourceId}](#${sourceAnchor(sourceId)}): ${REVIEW_STATUS_LABELS[review.reviewStatus]}`
    )
    .join("; ");
}

function renderActivityReviewWarning(activity, reviewById) {
  const flags = sourceReviewFlags(activity, reviewById);
  if (!flags.length) {
    return "No listed source has an unresolved review-status flag, but every source's stated limitations still apply.";
  }
  const details = flags
    .map(
      ({ sourceId, review }) =>
        `\`${sourceId}\` is **${REVIEW_STATUS_LABELS[review.reviewStatus]}**`
    )
    .join("; ");
  return `${details}. Treat the current interpretation below as a claim to review, not as independent confirmation.`;
}

function renderCitation(citation) {
  const parts = [
    `${joinNatural(citation.authors)}. [“${citation.title}”](${citation.url}).`,
    citation.venue ? `${citation.venue}.` : null,
    `${citation.organization}, ${citation.publishedDate}.`,
    citation.lastUpdatedDate ? `Updated ${citation.lastUpdatedDate}.` : null,
    citation.doi ? `DOI: [${citation.doi}](https://doi.org/${citation.doi}).` : null,
    citation.reportNumber ? `Report ${citation.reportNumber}.` : null
  ];
  return parts.filter(Boolean).join(" ");
}

function renderLocator(locator) {
  return locator.startsWith("data/") ? `[${locator}](${locator})` : locator;
}

function renderDeviceOptions(activity, deviceById) {
  const overrides = activity.deviceTotalWhOverrides ?? {};
  const deviceIds = (activity.deviceSelectableIds ?? []).filter((deviceId) => deviceId in overrides);
  if (!deviceIds.length) return "No separate end-user device option is modeled.";
  return deviceIds
    .map((deviceId) => `${deviceById.get(deviceId)?.label ?? deviceId}: ${formatNumber(overrides[deviceId])} Wh`)
    .join("; ");
}

export function loadSourceEvidence() {
  return readJson(REVIEW_DATA_PATH);
}

export function loadActivityEvidence() {
  return readJson(ACTIVITY_REVIEW_DATA_PATH);
}

export function loadExternalComparisons() {
  return readJson(EXTERNAL_COMPARISON_DATA_PATH);
}

export function buildDataReviewGuide(
  canonical,
  review = loadSourceEvidence(),
  activityReview = loadActivityEvidence(),
  externalComparisons = loadExternalComparisons()
) {
  const sources = canonical.sources.map(({ record }) => record);
  const activities = canonical.activities.map(({ record }) => record);
  const methods = canonical.methodSections.map(({ record }) => record);
  const devices = canonical.deviceProfiles.map(({ record }) => record);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const reviewById = new Map(review.records.map((record) => [record.sourceId, record]));
  const activityReviewById = new Map(
    activityReview.records.map((record) => [record.activityId, record])
  );
  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const activitiesBySource = new Map(sources.map((source) => [source.id, []]));
  const methodsBySource = new Map(sources.map((source) => [source.id, []]));

  for (const activity of activities) {
    for (const sourceId of activity.sourceIds) activitiesBySource.get(sourceId)?.push(activity);
  }
  for (const method of methods) {
    for (const sourceId of method.sourceIds ?? []) methodsBySource.get(sourceId)?.push(method);
  }

  const lines = [
    "# Your Digital Life data review guide",
    "",
    "> [!IMPORTANT]",
    "> This file is generated by `npm run data:build`. Do not edit it by hand. Edit the canonical records under `data/` or the reviewer metadata under `data/review/`, then regenerate it.",
    "",
    `This is the human-readable review surface for calculator dataset **v${review.datasetVersion}**, evidence overlays **v${review.overlayVersion}**, reviewed **${review.reviewedOn}**. It combines the current canonical values with review-only evidence and external-comparison records.`,
    "",
    "The reviewer metadata is deliberately separate from the release data. It is not a calculator input, website input, or release artifact. A future data release may merge reviewed metadata only through the normal versioned release process.",
    "",
    "## Start here",
    "",
    "- [Activity table (CSV)](data/exports/latest/activities.csv) — the quickest machine-readable view of all calculator rows and values.",
    "- [Activity records](data/activities/) — canonical row-by-row inputs, including source IDs and device behavior.",
    "- [Activity evidence review](data/review/activity-evidence.json) — row-level provenance, formula traceability, and unresolved findings.",
    "- [Source evidence review](data/review/source-evidence.json) — corrected citations, precise locators, boundaries, derivations, and limitations.",
    "- [External comparisons](data/review/external-comparisons.json) — repeatable crosswalks recording outside claims, project values before and after review, evidence, dispositions, and unresolved questions.",
    "- [Activity](data/review/activity-evidence.schema.json), [source](data/review/source-evidence.schema.json), and [external comparison](data/schemas/external-comparisons.schema.json) schemas — the machine-readable contracts for the overlays.",
    "- [Method records](data/methods/) — the calculator's bridge calculations and synthesis choices.",
    `- [Current immutable v${canonical.manifest.datasetVersion} release](data/exports/v${canonical.manifest.datasetVersion}/) — the portable, checksum-locked current dataset.`,
    "- [Original immutable v0.1.0 release](data/exports/v0.1.0/) — the preserved pre-review baseline.",
    "- [Public Sources & Method page](https://your-digital-life.org/sources-and-method/) — the current website explanation.",
    "",
    "## How to read the numbers",
    "",
    "The calculator preserves legacy row-specific boundaries. These columns are useful for comparison, but they are not all measurements of one standardized end-to-end system.",
    "",
    "| Field | Current definition |",
    "| --- | --- |",
    ...Object.entries(canonical.manifest.metricBoundaries).map(
      ([field, definition]) => `| \`${markdownCell(field)}\` | ${markdownCell(definition)} |`
    ),
    "",
    "The strongest review question is therefore not only “is this number right?” It is also: **right for which workload, hardware, date, geography, and system boundary?**",
    "",
    "## Calculator activity index",
    "",
    "| Activity | Functional unit | Cloud/server or server+network (Wh) | Stored total-system default (Wh) | Direct water (mL) | Broader total water (mL) | Activity status | Formula traceability | Source review flags | Sources |",
    "| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |",
    ...activities.map(
      (activity) => {
        const activityEvidence = activityReviewById.get(activity.id);
        return `| [${markdownCell(activity.label)}](#activity-${activity.id}) | ${markdownCell(activity.unitHint)} (${markdownCell(activity.unitLabel)}) | ${formatNumber(activity.serverWhPerUnit)} | ${formatNumber(activity.totalWhPerUnit)} | ${formatNumber(activity.directWaterMlPerUnit)} | ${formatNumber(activity.totalWaterMlPerUnit)} | ${markdownCell(activity.status)} | ${FORMULA_STATUS_LABELS[activityEvidence.formulaStatus]} | ${renderReviewFlags(activity, reviewById)} | ${renderSourceLinks(activity.sourceIds, sourceById, reviewById)} |`;
      }
    ),
    "",
    "## Activity records",
    ""
  ];

  for (const activity of activities) {
    const activityEvidence = activityReviewById.get(activity.id);
    const additionalSources = activityEvidence.additionalSourceIds;
    lines.push(
      `<a id="activity-${activity.id}"></a>`,
      `### ${activity.label}`,
      "",
      `- **Stable ID:** \`${activity.id}\` ([canonical JSON](data/activities/${activity.id}.json))`,
      `- **Functional unit:** ${activity.unitHint}; quantities are entered as ${activity.unitLabel}.`,
      `- **Stored values:** ${formatNumber(activity.serverWhPerUnit)} Wh cloud/server or server+network; ${formatNumber(activity.totalWhPerUnit)} Wh stored total-system default; ${formatNumber(activity.directWaterMlPerUnit)} mL direct water; ${formatNumber(activity.totalWaterMlPerUnit)} mL broader total water.`,
      `- **Device model:** ${activity.deviceMode}. ${renderDeviceOptions(activity, deviceById)}`,
      `- **System-boundary marker:** \`${activity.systemBoundary}\`. ${activity.deviceNote}`,
      `- **Evidence status:** \`${activity.status}\`; last reviewed ${activity.lastReviewed}.`,
      `- **Sources:** ${renderSourceLinks(activity.sourceIds, sourceById, reviewById)}.`,
      `- **Formula traceability:** ${FORMULA_STATUS_LABELS[activityEvidence.formulaStatus]} (\`${activityEvidence.formulaStatus}\`).`,
      `- **Reviewer provenance summary:** ${activityEvidence.provenanceSummary}`,
      `- **Review-only additional sources:** ${additionalSources.length ? renderSourceLinks(additionalSources, sourceById, reviewById) : "None"}. These do not change the current activity's \`sourceIds\`.`,
      `- **Evidence-review warning:** ${renderActivityReviewWarning(activity, reviewById)}`,
      "- **Review findings:**",
      ...activityEvidence.reviewFindings.map((finding) => `  - ${finding}`),
      `- **Current v${canonical.manifest.datasetVersion} interpretation:** ${activity.note}`,
      ""
    );
  }

  const comparatorById = new Map(
    externalComparisons.comparators.map((comparator) => [comparator.id, comparator])
  );
  lines.push(
    "## External comparison decisions",
    "",
    "These records make outside feedback repeatable. A comparator can prompt an update without being misrepresented as the primary evidentiary authority.",
    "",
    "| Topic | Comparator | Target | Disposition | Before | Comparator claim | After |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...externalComparisons.records.map((record) => {
      const comparator = comparatorById.get(record.comparatorId);
      return `| ${markdownCell(record.topic)} | [${markdownCell(comparator?.name ?? record.comparatorId)}](${record.evidenceUrl ?? comparator?.evidenceUrl ?? "#"}) | \`${record.targetType}:${record.targetId}\` | \`${record.disposition}\` | ${markdownCell(record.projectClaimBefore.displayValue)} ${markdownCell(record.projectClaimBefore.unit)} | ${markdownCell(record.comparatorClaim.displayValue)} ${markdownCell(record.comparatorClaim.unit)} | ${markdownCell(record.projectClaimAfter.displayValue)} ${markdownCell(record.projectClaimAfter.unit)} |`;
    }),
    ""
  );

  for (const record of externalComparisons.records) {
    const comparator = comparatorById.get(record.comparatorId);
    lines.push(
      `### ${record.topic}`,
      "",
      `- **Stable comparison ID:** \`${record.id}\``,
      `- **Comparator:** [${comparator?.name ?? record.comparatorId}](${comparator?.calculatorUrl ?? "#"}) by ${comparator?.author ?? "unknown"}`,
      `- **Target:** \`${record.targetType}:${record.targetId}\``,
      `- **Disposition:** \`${record.disposition}\``,
      `- **External evidence:** [${record.evidenceLocator}](${record.evidenceUrl}) (accessed ${record.accessedOn})`,
      `- **Before:** ${record.projectClaimBefore.displayValue} ${record.projectClaimBefore.unit}; boundary: ${record.projectClaimBefore.boundary}; derivation: ${record.projectClaimBefore.derivation}`,
      `- **Comparator claim:** ${record.comparatorClaim.displayValue} ${record.comparatorClaim.unit}; boundary: ${record.comparatorClaim.boundary}; derivation: ${record.comparatorClaim.derivation}`,
      `- **After:** ${record.projectClaimAfter.displayValue} ${record.projectClaimAfter.unit}; boundary: ${record.projectClaimAfter.boundary}; derivation: ${record.projectClaimAfter.derivation}`,
      `- **Decision:** ${record.decisionSummary}`,
      `- **Evidence:** ${renderSourceLinks(record.evidenceSourceIds, sourceById, reviewById)}`,
      "- **Rationale:**",
      ...record.rationale.map((item) => `  - ${item}`),
      "- **Unresolved questions:**",
      ...(record.unresolvedQuestions.length
        ? record.unresolvedQuestions.map((item) => `  - ${item}`)
        : ["  - None recorded."]),
      ""
    );
  }

  lines.push(
    "## Source evidence review",
    "",
    "The citation below is the reviewed citation. Review overlays may preserve corrections or limitations that should not silently rewrite a released source record.",
    "",
    "Review-status meanings:",
    "",
    "- **Reviewed with limitations:** useful evidence when its stated boundary and caveats are preserved.",
    "- **Needs a primary source:** useful context, but not adequate as the exact source for the current coefficient.",
    "- **Needs an update:** method or technology has materially aged, or the source itself now warns against the inherited use.",
    "- **Illustrative only:** a rough comparison, not evidence strong enough to anchor a calculator value by itself.",
    "- **Internal method:** a transparent project derivation, not independent empirical evidence.",
    ""
  );

  for (const source of sources) {
    const evidence = reviewById.get(source.id);
    const usedActivities = activitiesBySource.get(source.id) ?? [];
    const usedMethods = methodsBySource.get(source.id) ?? [];
    lines.push(
      `<a id="${sourceAnchor(source.id)}"></a>`,
      `### ${evidence.citation.title}`,
      "",
      `- **Stable source ID:** \`${source.id}\` ([canonical record](data/sources/${source.id}.json))`,
      `- **Review status:** ${REVIEW_STATUS_LABELS[evidence.reviewStatus]} (\`${evidence.reviewStatus}\`)`,
      `- **Evidence type:** ${EVIDENCE_TYPE_LABELS[evidence.evidenceType]} (\`${evidence.evidenceType}\`)`,
      `- **Legacy publication classification:** ${source.sourceTier}; ${source.sourceType}.`,
      `- **Reviewed citation:** ${renderCitation(evidence.citation)}`,
      `- **Used by activities:** ${usedActivities.length ? usedActivities.map((activity) => `[${activity.label}](#activity-${activity.id})`).join("; ") : "No activity directly lists this source."}`,
      `- **Used by methods:** ${usedMethods.length ? usedMethods.map((method) => `[${method.id}](data/methods/${method.id}.json)`).join(", ") : "No method directly lists this source."}`,
      `- **Canonical \`usedFor\` descriptions:** ${source.usedFor.join("; ")}.`,
      "",
      "**Precise locators**",
      "",
      ...evidence.preciseLocators.map(
        ({ locator, relevance }) => `- **${renderLocator(locator)}:** ${relevance}`
      ),
      "",
      `**Measurement boundary:** ${evidence.measurementBoundary}`,
      "",
      `**Workload and hardware:** ${evidence.workloadAndHardware}`,
      "",
      `**Geography:** ${evidence.geography}`,
      "",
      `**How the calculator uses or derives it:** ${evidence.derivation}`,
      "",
      "**Limitations**",
      "",
      ...evidence.limitations.map((limitation) => `- ${limitation}`),
      ""
    );
  }

  lines.push(
    "## Propose a correction or addition",
    "",
    "GitHub is the review and contribution surface. You do not need to edit code to flag a problem.",
    "",
    "- [Propose a correction to an existing value, source, boundary, or derivation](https://github.com/Brehove/Your-Digital-Life/issues/new?template=data-correction.yml)",
    "- [Propose a new activity or source](https://github.com/Brehove/Your-Digital-Life/issues/new?template=new-data-or-source.yml)",
    "- [Read the contribution requirements](CONTRIBUTING.md)",
    "",
    "A useful proposal identifies the stable record ID, exact source locator, publication date, functional unit, system boundary, workload, hardware, geography, intermediate arithmetic, uncertainty, and every downstream row that could change.",
    ""
  );

  return `${lines.join("\n").trimEnd()}\n`;
}
