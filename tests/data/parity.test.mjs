import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  DATA_DIR,
  ROOT,
  applyBaselineAllowances,
  buildLegacyCalculator,
  computePresetTotals,
  loadBaselineFixture,
  readJson,
  readManifest,
  sha256
} from "../../scripts/lib/data.mjs";

const manifest = readManifest();
const baseline = loadBaselineFixture(manifest);
const expectedCanonical = applyBaselineAllowances(baseline, manifest);
const canonical = buildLegacyCalculator();

test("frozen baseline fixture is independent and checksum-locked", () => {
  assert.equal(manifest.baseline.commit, "063322e93e27704b447a495a838e552067928127");
  const fixture = fs.readFileSync(path.join(DATA_DIR, "..", manifest.baseline.fixture));
  assert.equal(sha256(fixture), manifest.baseline.fixtureSha256);
});

test("canonical records equal the fixture after three checksum-locked publication allowances", () => {
  assert.equal(manifest.baseline.allowedMetadataDeltas.length, 3);
  assert.deepEqual(
    manifest.baseline.allowedMetadataDeltas.map(({ collection, recordId, field }) => ({
      collection,
      recordId,
      field
    })),
    [
      { collection: "sourceCatalog", recordId: "scenario-methods", field: "url" },
      { collection: undefined, recordId: undefined, field: "sourceFiles" },
      { collection: undefined, recordId: undefined, field: "updateInstructions" }
    ]
  );
  assert.equal(
    manifest.baseline.allowedMetadataDeltas[1].baselineSha256,
    "a5e3039cdb2c8712319d6788ed6fd97b32dbfa88b7ff023e0ea621956d1a5520"
  );
  assert.equal(
    manifest.baseline.allowedMetadataDeltas[2].baselineSha256,
    "28caf0fcd0320fbb9c39b2a7871913722cc7efe8b72dbba04cf9e163f623ae0b"
  );
  assert.deepEqual(canonical, expectedCanonical);
  assert.notDeepEqual(canonical, baseline);
});

test("record counts and UI order are frozen", () => {
  assert.deepEqual(
    {
      sources: canonical.sourceCatalog.length,
      deviceProfiles: canonical.deviceProfiles.length,
      activities: canonical.activities.length,
      presets: canonical.presets.length,
      methodSections: canonical.methodSections.length
    },
    manifest.counts
  );
  assert.deepEqual(canonical.sourceCatalog.map(({ id }) => id), manifest.order.sources);
  assert.deepEqual(canonical.deviceProfiles.map(({ id }) => id), manifest.order.deviceProfiles);
  assert.deepEqual(canonical.activities.map(({ id }) => id), manifest.order.activities);
  assert.deepEqual(canonical.presets.map(({ id }) => id), manifest.order.presets);
  assert.deepEqual(canonical.methodSections.map(({ id }) => id), manifest.order.methodSections);
});

test("generated payload and Astro snapshot are exact canonical products", () => {
  const payload = readJson(path.join(DATA_DIR, "generated/calculator-payload.json"));
  assert.deepEqual(payload, {
    activities: canonical.activities,
    presets: canonical.presets,
    deviceProfiles: canonical.deviceProfiles
  });
  assert.deepEqual(
    readJson(path.join(ROOT, "site/src/content/calculators/digital-inventory.json")),
    canonical
  );
  assert.equal(fs.existsSync(path.join(ROOT, "site/src/content/calculators/digital-inventory.md")), false);
  assert.deepEqual(
    canonical.sourceFiles.map(({ path: sourcePath }) => sourcePath),
    ["https://your-digital-life.org/data/", "https://your-digital-life.org/sources-and-method/"]
  );
  assert.ok(canonical.updateInstructions.every((instruction) => !instruction.includes("this file")));
});

test("all preset totals match the production contract", () => {
  const expected = {
    clear: [0, 0, 0, 0],
    "gen-z-no-ai": [131.5, 244.75, 131.5, 789],
    "gen-z-moderate-ai": [133.94, 252.94, 132.94, 791.14],
    "gen-z-vibe-coder": [699.235, 797.61, 698.635, 4187.91],
    "worker-zoom-host": [223, 490, 223, 1338]
  };

  for (const [presetId, values] of Object.entries(expected)) {
    const totals = computePresetTotals(canonical, presetId);
    const actual = [totals.serverEnergy, totals.totalEnergy, totals.directWater, totals.totalWater];
    actual.forEach((value, index) => assert.ok(Math.abs(value - values[index]) < 1e-9));
  }
});

test("streaming device controls affect total energy only", () => {
  for (const activityId of ["youtube", "netflix"]) {
    const activity = canonical.activities.find(({ id }) => id === activityId);
    assert.ok(activity);
    assert.equal(activity.deviceMode, "selectable");
    assert.deepEqual(activity.deviceSelectableIds, ["phone", "laptop", "tv"]);
    assert.deepEqual(activity.deviceTotalWhOverrides, { phone: 26, laptop: 37, tv: 77 });
    assert.deepEqual(activity.deviceSelectionAffects, ["totalWhPerUnit"]);
    assert.equal(activity.serverWhPerUnit, 22);
    assert.equal(activity.directWaterMlPerUnit, 22);
    assert.equal(activity.totalWaterMlPerUnit, 132);
  }
});

test("every activity and method source relationship resolves", () => {
  const sourceIds = new Set(canonical.sourceCatalog.map(({ id }) => id));
  for (const activity of canonical.activities) {
    for (const sourceId of activity.sourceIds) assert.ok(sourceIds.has(sourceId), `${activity.id}: ${sourceId}`);
  }
  for (const method of canonical.methodSections) {
    for (const sourceId of method.sourceIds ?? []) assert.ok(sourceIds.has(sourceId), `${method.id}: ${sourceId}`);
  }
});
