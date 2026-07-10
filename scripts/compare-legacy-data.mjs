#!/usr/bin/env node

import {
  applyBaselineAllowances,
  buildLegacyCalculator,
  computePresetTotals,
  crossCheckFixtureWithGit,
  firstDifference,
  loadBaselineFixture,
  readManifest
} from "./lib/data.mjs";

const manifest = readManifest();
const baseline = loadBaselineFixture(manifest);
const expectedCanonical = applyBaselineAllowances(baseline, manifest);
const canonical = buildLegacyCalculator();
const difference = firstDifference(expectedCanonical, canonical);

if (difference) {
  console.error(`Canonical parity failed against the allowance-adjusted frozen fixture ${manifest.baseline.fixture}: ${difference}`);
  process.exitCode = 1;
} else {
  console.log(
    `Strict canonical parity passed against ${manifest.baseline.fixture} plus ${manifest.baseline.allowedMetadataDeltas.length} declared metadata allowance(s): ${canonical.sourceCatalog.length} sources, ${canonical.deviceProfiles.length} devices, ${canonical.activities.length} activities, ${canonical.presets.length} presets, ${canonical.methodSections.length} methods.`
  );

  for (const preset of canonical.presets) {
    const totals = computePresetTotals(canonical, preset.id);
    console.log(
      `${preset.id}: server=${totals.serverEnergy} Wh, total=${totals.totalEnergy} Wh, direct=${totals.directWater} mL, water=${totals.totalWater} mL`
    );
  }
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
