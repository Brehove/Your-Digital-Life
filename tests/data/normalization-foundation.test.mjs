import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ROOT, buildLegacyCalculator } from "../../scripts/lib/data.mjs";

function jsonFiles(relativeDirectory) {
  return fs
    .readdirSync(path.join(ROOT, relativeDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();
}

test("deferred site collection inventory remains explicit", () => {
  assert.equal(jsonFiles("site/src/content/sources").length, 41);
  assert.equal(jsonFiles("site/src/content/facts").length, 50);
  assert.equal(jsonFiles("site/src/content/scenarios").length, 4);
  assert.equal(jsonFiles("site/src/content/charts").length, 4);
  assert.equal(jsonFiles("site/src/data/charts").length, 4);
});

test("all duplicated calculator sources match on shared fields", () => {
  const calculator = buildLegacyCalculator();
  const sharedFields = [
    "title",
    "organization",
    "authors",
    "url",
    "publishedDate",
    "sourceTier",
    "sourceType",
    "notes",
    "tags"
  ];
  let matches = 0;
  const divergent = [];

  for (const source of calculator.sourceCatalog) {
    const registry = JSON.parse(
      fs.readFileSync(path.join(ROOT, "site/src/content/sources", `${source.id}.json`), "utf8")
    );
    const differingFields = sharedFields.filter(
      (field) => JSON.stringify(source[field]) !== JSON.stringify(registry[field])
    );
    if (differingFields.length === 0) matches += 1;
    else divergent.push({ id: source.id, differingFields });
  }

  assert.equal(matches, 25);
  assert.deepEqual(divergent, []);
});
