import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { COLLECTIONS, DATA_DIR, ROOT, sha256 } from "../../scripts/lib/data.mjs";

function filesUnder(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const child of filesUnder(absolute)) files.push(path.join(entry.name, child));
    } else {
      files.push(entry.name);
    }
  }
  return files.sort();
}

test("latest and immutable v0.1.0 exports are byte-identical", () => {
  const latest = path.join(DATA_DIR, "exports/latest");
  const versioned = path.join(DATA_DIR, "exports/v0.1.0");
  assert.deepEqual(filesUnder(latest), filesUnder(versioned));
  for (const name of filesUnder(latest)) {
    assert.deepEqual(fs.readFileSync(path.join(latest, name)), fs.readFileSync(path.join(versioned, name)), name);
  }
});

test("website downloads are byte-identical to repository exports", () => {
  const exportsDirectory = path.join(DATA_DIR, "exports");
  const publicDirectory = path.join(ROOT, "site/public/data");
  assert.deepEqual(filesUnder(publicDirectory), filesUnder(exportsDirectory));
  for (const name of filesUnder(exportsDirectory)) {
    assert.deepEqual(
      fs.readFileSync(path.join(publicDirectory, name)),
      fs.readFileSync(path.join(exportsDirectory, name)),
      name
    );
  }

  for (const { schema } of Object.values(COLLECTIONS)) {
    assert.deepEqual(
      fs.readFileSync(path.join(ROOT, "site/public/schemas", schema)),
      fs.readFileSync(path.join(DATA_DIR, "schemas", schema)),
      schema
    );
  }
});

test("committed generated files are current and deterministic", () => {
  execFileSync(process.execPath, ["scripts/build-data.mjs", "--check"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/export-data.mjs", "--check"], { stdio: "pipe" });
});

test("release checksums and archive are valid", () => {
  const releaseDir = path.join(DATA_DIR, "exports/v0.1.0");
  const lines = fs.readFileSync(path.join(releaseDir, "SHA256SUMS"), "utf8").trim().split("\n");
  for (const line of lines) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    assert.ok(match, line);
    assert.equal(sha256(fs.readFileSync(path.join(releaseDir, match[2]))), match[1], match[2]);
  }

  const archive = path.join(DATA_DIR, "exports/your-digital-life-data-v0.1.0.zip");
  execFileSync("unzip", ["-t", archive], { stdio: "pipe" });
  const topChecksum = fs.readFileSync(path.join(DATA_DIR, "exports/SHA256SUMS"), "utf8").trim();
  assert.equal(topChecksum, `${sha256(fs.readFileSync(archive))}  ${path.basename(archive)}`);
});

test("activity CSV has one header and twelve stable-ID rows", () => {
  const csv = fs.readFileSync(path.join(DATA_DIR, "exports/latest/activities.csv"), "utf8").trim().split("\n");
  assert.equal(csv.length, 13);
  assert.equal(
    csv[0],
    "id,activity,unit,server_network_energy_wh,total_system_energy_wh,direct_water_ml,total_water_ml,status,system_boundary,source_ids,last_reviewed"
  );
  assert.ok(csv[1].startsWith("text-prompts,"));
  assert.ok(csv[12].startsWith("zoom-host,"));
});

test("portable package excludes private research notes and Git history dependencies", () => {
  const releaseDir = path.join(DATA_DIR, "exports/v0.1.0");
  const descriptor = JSON.parse(fs.readFileSync(path.join(releaseDir, "datapackage.json"), "utf8"));
  const serialized = JSON.stringify(descriptor);
  assert.equal(serialized.includes("github.com/"), false);
  assert.deepEqual(
    descriptor.sources.map(({ path: sourcePath }) => sourcePath),
    [
      "https://your-digital-life.org/sources-and-method/",
      "README.md"
    ]
  );
  for (const source of descriptor.sources) {
    if (!source.path.startsWith("https://")) {
      assert.ok(fs.existsSync(path.join(releaseDir, source.path)), source.path);
    }
  }
  for (const resource of descriptor.resources) {
    assert.ok(fs.existsSync(path.join(releaseDir, resource.path)), resource.path);
    if (typeof resource.schema === "string") {
      assert.ok(fs.existsSync(path.join(releaseDir, resource.schema)), resource.schema);
    }
    if (typeof resource.custom?.jsonSchema === "string") {
      assert.ok(fs.existsSync(path.join(releaseDir, resource.custom.jsonSchema)), resource.custom.jsonSchema);
    }
  }
  assert.equal(
    descriptor.custom.productionBaseline.fixtureRepositoryPath,
    "tests/fixtures/deployed-calculator-063322e.json"
  );

  const releaseFiles = filesUnder(releaseDir);
  assert.equal(releaseFiles.some((name) => name.startsWith("research/")), false);
  assert.equal(releaseFiles.some((name) => name.startsWith("fixtures/")), false);
  for (const name of releaseFiles.filter((candidate) => !candidate.endsWith(".zip"))) {
    const content = fs.readFileSync(path.join(releaseDir, name), "utf8");
    assert.equal(content.includes("Exact quote"), false, name);
    assert.equal(content.includes("Section 2 - Cost of Prompting - Sources.md"), false, name);
    assert.equal(content.includes("Section 3 - Scenarios.md"), false, name);
  }
  assert.equal(descriptor.custom.migrationMode, "canonical");
  assert.equal(descriptor.custom.siteConsumer, "generated-snapshot");
  assert.equal(serialized.includes("example.com/internal-scenario-method"), false);
  assert.equal(serialized.includes("digital-inventory.md"), false);
});
