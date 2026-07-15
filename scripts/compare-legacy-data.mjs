#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  DATA_DIR,
  applyBaselineAllowances,
  buildLegacyCalculator,
  computePresetTotals,
  crossCheckFixtureWithGit,
  firstDifference,
  loadBaselineFixture,
  loadCanonicalData,
  readJson,
  readManifest
} from "./lib/data.mjs";

const manifest = readManifest();
const canonicalData = loadCanonicalData();
const version = manifest.datasetVersion;

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

function collectionDiff(previous, current) {
  const previousById = new Map(previous.map((record) => [record.id, record]));
  const currentById = new Map(current.map((record) => [record.id, record]));
  const added = [...currentById.keys()].filter((id) => !previousById.has(id));
  const removed = [...previousById.keys()].filter((id) => !currentById.has(id));
  const modified = [...currentById.keys()].filter(
    (id) => previousById.has(id) && firstDifference(previousById.get(id), currentById.get(id))
  );
  return { added: sorted(added), modified: sorted(modified), removed: sorted(removed) };
}

if (version === "0.1.0") {
  const baseline = loadBaselineFixture(manifest);
  const expectedCanonical = applyBaselineAllowances(baseline, manifest);
  const canonical = buildLegacyCalculator(canonicalData);
  const difference = firstDifference(expectedCanonical, canonical);

  if (difference) {
    console.error(
      `Canonical parity failed against the allowance-adjusted frozen fixture ${manifest.baseline.fixture}: ${difference}`
    );
    process.exitCode = 1;
  } else {
    console.log(`Strict v0.1.0 baseline parity passed against ${manifest.baseline.fixture}.`);
  }
} else {
  const release = readJson(path.join(DATA_DIR, "releases", `v${version}.json`));
  const externalComparisons = readJson(path.join(DATA_DIR, "review", "external-comparisons.json"));
  const configurations = {
    activities: { file: "activities.json", records: canonicalData.activities },
    sources: { file: "sources.json", records: canonicalData.sources },
    deviceProfiles: { file: "device-profiles.json", records: canonicalData.deviceProfiles },
    presets: { file: "presets.json", records: canonicalData.presets },
    methodSections: { file: "methods.json", records: canonicalData.methodSections },
    externalComparisons: {
      file: "external-comparisons.json",
      records: externalComparisons.records.map((record) => ({ record })),
      optionalPrevious: true
    }
  };

  let failed = false;
  for (const [key, configuration] of Object.entries(configurations)) {
    const previousPath = path.join(
      DATA_DIR,
      "exports",
      `v${release.previousVersion}`,
      configuration.file
    );
    const previous = configuration.optionalPrevious && !fs.existsSync(previousPath)
      ? []
      : readJson(previousPath).records ?? readJson(previousPath);
    const current = configuration.records.map(({ record }) => record);
    const actual = collectionDiff(previous, current);
    const expected = Object.fromEntries(
      Object.entries(release.collectionChanges[key]).map(([changeType, ids]) => [
        changeType,
        sorted(ids)
      ])
    );
    const difference = firstDifference(expected, actual, `$.collectionChanges.${key}`);
    if (difference) {
      console.error(`Release diff declaration failed: ${difference}`);
      failed = true;
    } else {
      console.log(
        `${key}: declared release diff verified (added ${actual.added.length}, modified ${actual.modified.length}, removed ${actual.removed.length}).`
      );
    }
  }
  if (failed) process.exitCode = 1;
}

const calculator = buildLegacyCalculator(canonicalData);
for (const preset of calculator.presets) {
  const totals = computePresetTotals(calculator, preset.id);
  console.log(
    `${preset.id}: server=${totals.serverEnergy} Wh, total=${totals.totalEnergy} Wh, direct=${totals.directWater} mL, water=${totals.totalWater} mL`
  );
}

if (process.argv.includes("--cross-check-git")) {
  const result = crossCheckFixtureWithGit(manifest);
  if (!result.available) {
    console.log(`Optional Git cross-check skipped: ${manifest.baseline.commit} is not available.`);
  } else if (result.difference) {
    console.error(`Frozen fixture differs from the optional Git object: ${result.difference}`);
    process.exitCode = 1;
  } else {
    console.log(`Optional Git cross-check passed for ${manifest.baseline.commit}.`);
  }
}
