#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  COLLECTIONS,
  DATA_DIR,
  SITE_PUBLIC_DATA_DIR,
  canonicalJson,
  csvDocument,
  deterministicZip,
  loadCanonicalData,
  readJson,
  sha256,
  syncGeneratedTree
} from "./lib/data.mjs";

const check = process.argv.includes("--check");
const canonical = loadCanonicalData();
const version = canonical.manifest.datasetVersion;
const releaseName = `your-digital-life-data-v${version}`;
const releaseDecision = readJson(path.join(DATA_DIR, "releases", `v${version}.json`));
const externalComparisons = readJson(path.join(DATA_DIR, "review", "external-comparisons.json"));
const publishedArchiveChecksums = readJson(
  path.join(DATA_DIR, "releases", "published-archive-sha256.json")
);

function records(key) {
  return canonical[key].map(({ record }) => record);
}

const activities = records("activities");
const activityRows = [
  [
    "id",
    "activity",
    "unit",
    "server_network_energy_wh",
    "total_system_energy_wh",
    "direct_water_ml",
    "total_water_ml",
    "status",
    "system_boundary",
    "source_ids",
    "last_reviewed"
  ],
  ...activities.map((activity) => [
    activity.id,
    activity.label,
    activity.unitLabel,
    activity.serverWhPerUnit,
    activity.totalWhPerUnit,
    activity.directWaterMlPerUnit,
    activity.totalWaterMlPerUnit,
    activity.status,
    activity.systemBoundary,
    activity.sourceIds.join("|"),
    activity.lastReviewed
  ])
];

const packageDescriptor = readJson(path.join(DATA_DIR, "datapackage.json"));
const releasePackageDescriptor = structuredClone(packageDescriptor);
for (const resource of releasePackageDescriptor.resources) {
  resource.path = resource.path.replace(/^exports\/latest\//, "");
}

const releaseManifest = {
  name: canonical.manifest.name,
  datasetVersion: canonical.manifest.datasetVersion,
  schemaVersion: canonical.manifest.schemaVersion,
  status: canonical.manifest.status,
  migrationMode: canonical.manifest.migrationMode,
  baselineProvenance: {
    commit: canonical.manifest.baseline.commit,
    fixtureRepositoryPath: canonical.manifest.baseline.fixture,
    fixtureSha256: canonical.manifest.baseline.fixtureSha256,
    productionUrl: canonical.manifest.baseline.productionUrl
  },
  releaseProvenance: {
    datasetVersion: version,
    decisionFile: "release.json",
    generatedFromCanonicalRootRecords: true
  },
  lastReviewed: canonical.manifest.calculator.lastReviewed,
  counts: canonical.manifest.counts,
  order: canonical.manifest.order,
  collectionsIncluded: ["activities", "deviceProfiles", "presets", "methodSections", "sources", "externalComparisons"],
  collectionsDeferred: canonical.manifest.deferredCollections,
  notes: [
    releaseDecision.summary,
    releaseDecision.scientificImpact,
    "The website reads a generated snapshot produced from the same root records.",
    `Behavior changes in this release: ${releaseDecision.behaviorChanges ? "yes" : "no"}.`,
    "Historical version directories and archives remain immutable and are carried forward unchanged."
  ]
};

const releaseFiles = new Map([
  ["VERSION", `${version}\n`],
  ["activities.json", canonicalJson(activities)],
  ["activities.csv", csvDocument(activityRows)],
  ["sources.json", canonicalJson(records("sources"))],
  ["device-profiles.json", canonicalJson(records("deviceProfiles"))],
  ["presets.json", canonicalJson(records("presets"))],
  ["methods.json", canonicalJson(records("methodSections"))],
  ["release.json", canonicalJson(releaseDecision)],
  ["external-comparisons.json", canonicalJson(externalComparisons)],
  ["manifest.json", canonicalJson(releaseManifest)],
  ["datapackage.json", canonicalJson(releasePackageDescriptor)],
  [
    "README.md",
    `# Your Digital Life data v${version}\n\n${releaseDecision.summary}\n\n${releaseDecision.scientificImpact}\n\nThe website consumes a generated snapshot from these root records, and \`latest/\` is byte-identical to this versioned package. Historical release directories and archives remain immutable. The frozen object captured from Git commit \`${canonical.manifest.baseline.commit}\` remains provenance metadata and a repository-only regression fixture; it is not an update authority.\n\n## Changes\n\n${releaseDecision.changes.map((change) => `- ${change}`).join("\n")}\n\nProject-created structured data and schemas are offered under CC0-1.0. Original project prose fields are offered under CC BY 4.0. Third-party titles and bibliographic metadata are not relicensed. Quote-heavy research notes and presentation artifacts are intentionally excluded.\n`
  ]
]);

for (const config of Object.values(COLLECTIONS)) {
  const schemaPath = path.join(DATA_DIR, "schemas", config.schema);
  releaseFiles.set(`schemas/${config.schema}`, fs.readFileSync(schemaPath));
}
releaseFiles.set(
  "schemas/activities-table.schema.json",
  fs.readFileSync(path.join(DATA_DIR, "schemas/activities-table.schema.json"))
);
releaseFiles.set(
  "schemas/release.schema.json",
  fs.readFileSync(path.join(DATA_DIR, "schemas/release.schema.json"))
);
releaseFiles.set(
  "schemas/external-comparisons.schema.json",
  fs.readFileSync(path.join(DATA_DIR, "schemas/external-comparisons.schema.json"))
);

const internalChecksums = [...releaseFiles.entries()]
  .sort(([left], [right]) => left.localeCompare(right, "en"))
  .map(([name, content]) => `${sha256(content)}  ${name}`)
  .join("\n");
releaseFiles.set("SHA256SUMS", `${internalChecksums}\n`);

const outputFiles = new Map();
for (const [name, content] of releaseFiles) {
  outputFiles.set(`latest/${name}`, content);
  outputFiles.set(`v${version}/${name}`, content);
}

const archiveEntries = new Map(
  [...releaseFiles.entries()].map(([name, content]) => [`${releaseName}/${name}`, content])
);
const archiveName = `${releaseName}.zip`;
const archive = deterministicZip(archiveEntries);
outputFiles.set(archiveName, archive);

function filesUnder(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) results.push(...filesUnder(path.join(directory, entry.name), relative));
    else results.push(relative);
  }
  return results;
}

function verifyVersionDirectoryAgainstArchive(versionNumber, directory, archivePath) {
  const archiveRoot = `your-digital-life-data-v${versionNumber}/`;
  const archivedFiles = execFileSync("unzip", ["-Z1", archivePath], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((name) => name.startsWith(archiveRoot) && !name.endsWith("/"))
    .map((name) => name.slice(archiveRoot.length))
    .sort();
  const directoryFiles = filesUnder(directory).map((name) => name.split(path.sep).join("/")).sort();
  if (JSON.stringify(archivedFiles) !== JSON.stringify(directoryFiles)) {
    throw new Error(`Historical v${versionNumber} directory does not match its archive file list.`);
  }
  for (const name of directoryFiles) {
    const archived = execFileSync("unzip", ["-p", archivePath, `${archiveRoot}${name}`]);
    const stored = fs.readFileSync(path.join(directory, name));
    if (!archived.equals(stored)) {
      throw new Error(`Historical v${versionNumber}/${name} differs from its published archive.`);
    }
  }
}

const existingExportDirectory = path.join(DATA_DIR, "exports");
for (const [publishedName, expectedHash] of Object.entries(publishedArchiveChecksums)) {
  if (publishedName === archiveName) continue;
  const archivePath = path.join(existingExportDirectory, publishedName);
  const versionMatch = publishedName.match(/-v(\d+\.\d+\.\d+)\.zip$/);
  if (!fs.existsSync(archivePath) || !versionMatch) {
    throw new Error(`Missing pinned historical archive ${publishedName}.`);
  }
  const actualHash = sha256(fs.readFileSync(archivePath));
  if (actualHash !== expectedHash) {
    throw new Error(`Pinned archive ${publishedName} has SHA-256 ${actualHash}; expected ${expectedHash}.`);
  }
  verifyVersionDirectoryAgainstArchive(
    versionMatch[1],
    path.join(existingExportDirectory, `v${versionMatch[1]}`),
    archivePath
  );
}
for (const name of filesUnder(existingExportDirectory)) {
  const isHistoricalVersion = /^v\d+\.\d+\.\d+\//.test(name) && !name.startsWith(`v${version}/`);
  const isHistoricalArchive = /^your-digital-life-data-v\d+\.\d+\.\d+\.zip$/.test(name) && name !== archiveName;
  if (isHistoricalVersion || isHistoricalArchive) {
    outputFiles.set(name, fs.readFileSync(path.join(existingExportDirectory, name)));
  }
}

const archiveChecksums = [...outputFiles.entries()]
  .filter(([name]) => /^your-digital-life-data-v\d+\.\d+\.\d+\.zip$/.test(name))
  .sort(([left], [right]) => left.localeCompare(right, "en"))
  .map(([name, content]) => `${sha256(content)}  ${name}`);
outputFiles.set("SHA256SUMS", `${archiveChecksums.join("\n")}\n`);

const currentPinnedHash = publishedArchiveChecksums[archiveName];
const currentArchiveHash = sha256(archive);
if (!currentPinnedHash || currentPinnedHash !== currentArchiveHash) {
  throw new Error(
    `Current archive ${archiveName} has SHA-256 ${currentArchiveHash}; update data/releases/published-archive-sha256.json intentionally before publication.`
  );
}

const stableSchemaFiles = new Map(
  Object.values(COLLECTIONS).map((config) => [
    config.schema,
    fs.readFileSync(path.join(DATA_DIR, "schemas", config.schema))
  ])
);
stableSchemaFiles.set(
  "release.schema.json",
  fs.readFileSync(path.join(DATA_DIR, "schemas/release.schema.json"))
);
stableSchemaFiles.set(
  "external-comparisons.schema.json",
  fs.readFileSync(path.join(DATA_DIR, "schemas/external-comparisons.schema.json"))
);

syncGeneratedTree(path.join(DATA_DIR, "exports"), outputFiles, { check });
syncGeneratedTree(SITE_PUBLIC_DATA_DIR, outputFiles, { check });
syncGeneratedTree(path.join(SITE_PUBLIC_DATA_DIR, "..", "schemas"), stableSchemaFiles, { check });

console.log(
  `${check ? "Verified" : "Generated"} portable data products for v${version}: ${releaseFiles.size} release files; archive SHA-256 ${sha256(archive)}.`
);
