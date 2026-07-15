import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { COLLECTIONS, DATA_DIR, ROOT, readManifest, sha256 } from "../../scripts/lib/data.mjs";

const manifest = readManifest();
const currentVersion = manifest.datasetVersion;
const publishedArchiveChecksums = {
  "your-digital-life-data-v0.1.0.zip": "7c8a1b55683681b91e86b47156d865adc380dd09cf1f177f22305ce84a1f5689",
  "your-digital-life-data-v0.2.0.zip": "4fa0360701d9349a045db03c1708473a7faca43f3fc72dc31e805c131b95b79d",
  "your-digital-life-data-v0.3.0.zip": "7f40c677395feeb81d7d2e2583fec2c0a150ae584ae770f0e3d383798e787d76"
};

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

test("latest and current immutable exports are byte-identical", () => {
  const latest = path.join(DATA_DIR, "exports/latest");
  const versioned = path.join(DATA_DIR, `exports/v${currentVersion}`);
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

test("all versioned release checksums and archives are valid", () => {
  const exportsDirectory = path.join(DATA_DIR, "exports");
  const versionDirectories = fs
    .readdirSync(exportsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+\.\d+\.\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  assert.ok(versionDirectories.includes("v0.1.0"));
  assert.ok(versionDirectories.includes(`v${currentVersion}`));

  for (const versionDirectory of versionDirectories) {
    const releaseDir = path.join(exportsDirectory, versionDirectory);
    const lines = fs.readFileSync(path.join(releaseDir, "SHA256SUMS"), "utf8").trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^([a-f0-9]{64})  (.+)$/);
      assert.ok(match, line);
      assert.equal(sha256(fs.readFileSync(path.join(releaseDir, match[2]))), match[1], match[2]);
    }

    const archive = path.join(
      exportsDirectory,
      `your-digital-life-data-${versionDirectory}.zip`
    );
    execFileSync("unzip", ["-t", archive], { stdio: "pipe" });
    const archiveRoot = `your-digital-life-data-${versionDirectory}/`;
    const archivedFiles = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter((name) => name.startsWith(archiveRoot) && !name.endsWith("/"))
      .map((name) => name.slice(archiveRoot.length))
      .sort();
    assert.deepEqual(archivedFiles, filesUnder(releaseDir), `${versionDirectory} archive file list`);
    for (const name of archivedFiles) {
      assert.deepEqual(
        execFileSync("unzip", ["-p", archive, `${archiveRoot}${name}`]),
        fs.readFileSync(path.join(releaseDir, name)),
        `${versionDirectory}/${name}`
      );
    }
  }

  const topChecksums = fs.readFileSync(path.join(exportsDirectory, "SHA256SUMS"), "utf8").trim().split("\n");
  assert.equal(topChecksums.length, versionDirectories.length);
  for (const line of topChecksums) {
    const match = line.match(/^([a-f0-9]{64})  (your-digital-life-data-v\d+\.\d+\.\d+\.zip)$/);
    assert.ok(match, line);
    assert.equal(sha256(fs.readFileSync(path.join(exportsDirectory, match[2]))), match[1]);
  }

  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(DATA_DIR, "releases/published-archive-sha256.json"), "utf8")),
    publishedArchiveChecksums
  );
  for (const [name, expectedHash] of Object.entries(publishedArchiveChecksums)) {
    assert.equal(sha256(fs.readFileSync(path.join(exportsDirectory, name))), expectedHash, name);
  }
});

test("activity CSV has one header and thirteen stable-ID rows", () => {
  const csv = fs.readFileSync(path.join(DATA_DIR, "exports/latest/activities.csv"), "utf8").trim().split("\n");
  assert.equal(csv.length, 14);
  assert.equal(
    csv[0],
    "id,activity,unit,server_network_energy_wh,total_system_energy_wh,direct_water_ml,total_water_ml,status,system_boundary,source_ids,last_reviewed"
  );
  assert.ok(csv[1].startsWith("text-prompts,"));
  assert.ok(csv[12].startsWith("zoom-host,"));
  assert.ok(csv[13].startsWith("gaming-console-xbox-series-x,"));
});

test("portable package excludes private research notes and Git history dependencies", () => {
  const releaseDir = path.join(DATA_DIR, `exports/v${currentVersion}`);
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
