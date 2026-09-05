import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { ROOT, DATA_DIR, buildLegacyCalculator, computePresetTotals, readJson } from "../../scripts/lib/data.mjs";

const calculator = buildLegacyCalculator();
const requestId = "coding-agent-requests-intensive";

function requestDay(quantity) {
  return { ...calculator, presets: [{ id: "request-test", values: { [requestId]: quantity }, deviceSelections: {} }] };
}

test("requests multiply energy once and total water already includes direct water", () => {
  for (const quantity of [0, 1, 2, 10]) {
    assert.deepEqual(computePresetTotals(requestDay(quantity), "request-test"), {
      serverEnergy: 150 * quantity,
      totalEnergy: 150 * quantity,
      directWater: 150 * quantity,
      totalWater: 900 * quantity
    });
  }
  const row = calculator.activities.find(({ id }) => id === requestId);
  assert.equal(row.deviceMode, "not-modeled");
  assert.equal(row.defaultDeviceId, undefined);
  assert.equal(row.unitLabel, "requests");
  assert.equal(row.step, 1);
  assert.equal(row.status, "inferred");
  assert.equal(row.displayQualifier, "Intensive-use example");
  assert.match(row.shortLabel, /intensive/i);
});

test("fractional requests are rejected without changing legitimate fractional hours", () => {
  for (const quantity of [0.5, -1, Infinity, NaN]) {
    assert.throws(() => computePresetTotals(requestDay(quantity), "request-test"), /whole request count/);
  }
  const day = { ...calculator, presets: [{ id: "hours", values: { netflix: 0.75 }, deviceSelections: { netflix: "laptop" } }] };
  assert.equal(computePresetTotals(day, "hours").totalEnergy, 27.75);
});

test("the historical hourly record remains an hour and is not silently reinterpreted", () => {
  const previous = readJson(path.join(DATA_DIR, "exports/v0.4.1/activities.json"));
  const old = previous.find(({ id }) => id === "vibe-coding");
  assert.equal(old.unitLabel, "hours");
  assert.equal(old.totalWhPerUnit, 355);
  assert.equal(calculator.activities.some(({ id }) => id === "vibe-coding"), false);
  const preset = calculator.presets.find(({ id }) => id === "gen-z-vibe-coder");
  assert.equal(preset.values[requestId], 15);
  assert.equal(preset.values["vibe-coding"], undefined);
  assert.equal(preset.deviceSelections[requestId], undefined);
});

test("the public vibe-coder scenario agrees with the canonical starter and its own rows", () => {
  const scenario = readJson(path.join(ROOT, "site/src/content/scenarios/vibe-coder.json"));
  const totals = computePresetTotals(calculator, "gen-z-vibe-coder");
  for (const [field, metric] of Object.entries({ serverEnergyWh: "serverEnergy", totalEnergyWh: "totalEnergy", directWaterMl: "directWater", totalWaterMl: "totalWater" })) {
    assert.ok(Math.abs(scenario[field] - totals[metric]) < 1e-8, field);
    assert.ok(Math.abs(scenario.activities.reduce((sum, row) => sum + row[field], 0) - scenario[field]) < 1e-8, `${field} row sum`);
  }
});
