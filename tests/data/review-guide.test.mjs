import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ROOT, loadCanonicalData } from "../../scripts/lib/data.mjs";
import {
  buildDataReviewGuide,
  loadActivityEvidence,
  loadExternalComparisons,
  loadSourceEvidence
} from "../../scripts/lib/review-guide.mjs";

const canonical = loadCanonicalData();
const review = loadSourceEvidence();
const activityReview = loadActivityEvidence();
const externalComparisons = loadExternalComparisons();
const generatedGuide = buildDataReviewGuide(
  canonical,
  review,
  activityReview,
  externalComparisons
);

test("review overlay is complete, ordered, and isolated from runtime consumers", () => {
  assert.equal(review.datasetVersion, canonical.manifest.datasetVersion);
  assert.deepEqual(
    review.records.map(({ sourceId }) => sourceId),
    canonical.manifest.order.sources
  );
  assert.deepEqual(review.compatibility, {
    calculatorInput: false,
    websiteInput: false,
    releaseArtifact: false
  });
});

test("activity review overlay covers every frozen row without becoming a runtime input", () => {
  assert.equal(activityReview.datasetVersion, canonical.manifest.datasetVersion);
  assert.deepEqual(
    activityReview.records.map(({ activityId }) => activityId),
    canonical.manifest.order.activities
  );
  assert.deepEqual(activityReview.compatibility, {
    calculatorInput: false,
    websiteInput: false,
    releaseArtifact: false
  });
});

test("external comparison overlay is isolated, linked, and reusable", () => {
  assert.equal(externalComparisons.datasetVersion, canonical.manifest.datasetVersion);
  assert.deepEqual(externalComparisons.compatibility, {
    calculatorInput: false,
    websiteInput: false,
    releaseArtifact: true
  });
  assert.ok(externalComparisons.records.some(({ disposition }) => disposition === "adapt"));
  assert.ok(externalComparisons.records.some(({ disposition }) => disposition === "retain"));
});

test("checked-in review guide is the exact deterministic build product", () => {
  const checkedIn = fs.readFileSync(path.join(ROOT, "DATA-REVIEW-GUIDE.md"), "utf8");
  assert.equal(checkedIn, generatedGuide);
});

test("review guide exposes every activity and source through stable anchors", () => {
  for (const activityId of canonical.manifest.order.activities) {
    assert.ok(generatedGuide.includes(`<a id="activity-${activityId}"></a>`), activityId);
  }
  for (const sourceId of canonical.manifest.order.sources) {
    assert.ok(generatedGuide.includes(`<a id="source-${sourceId}"></a>`), sourceId);
  }
});

test("review guide keeps general contribution channels while exposing specific evidence lineage", () => {
  assert.ok(generatedGuide.includes("template=data-correction.yml"));
  assert.ok(generatedGuide.includes("template=new-data-or-source.yml"));
  assert.ok(generatedGuide.includes("Ippolito"));
  assert.ok(generatedGuide.includes("What Uses More"));
  assert.ok(generatedGuide.includes("External comparison decisions"));
});
