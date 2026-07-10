#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
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
  generatedFrom: {
    commit: canonical.manifest.baseline.commit,
    fixtureRepositoryPath: canonical.manifest.baseline.fixture,
    fixtureSha256: canonical.manifest.baseline.fixtureSha256,
    productionUrl: canonical.manifest.baseline.productionUrl
  },
  lastReviewed: canonical.manifest.calculator.lastReviewed,
  counts: canonical.manifest.counts,
  order: canonical.manifest.order,
  collectionsIncluded: ["activities", "deviceProfiles", "presets", "methodSections", "sources"],
  collectionsDeferred: canonical.manifest.deferredCollections,
  notes: [
    "This is the first canonical public calculator-data release.",
    "The website reads a generated snapshot produced from the same root records.",
    "The scenario-methods URL is the sole source-record correction from the frozen deployed baseline; public provenance and maintenance metadata were also migrated, while numeric and behavioral fields are unchanged.",
    "Scenarios, claims, and charts remain deferred to the later normalization gates."
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
  ["manifest.json", canonicalJson(releaseManifest)],
  ["datapackage.json", canonicalJson(releasePackageDescriptor)],
  [
    "README.md",
    `# Your Digital Life data v${version}\n\nThis is the first canonical public calculator-data release. The website consumes a generated snapshot from these root records, and \`latest/\` is byte-identical to this versioned package. The frozen object captured from Git commit \`${canonical.manifest.baseline.commit}\` remains provenance metadata and a repository-only regression fixture; it is not an update authority.\n\nThe only source-record correction from that fixture is the \`scenario-methods\` URL, which now points to the public Sources & Method page. Publication metadata also replaces removed private-file pointers and stale maintenance instructions with public, canonical equivalents. Numeric values, record order, presets, methods, device behavior, and source relationships remain unchanged.\n\nProject-created structured data and schemas are offered under CC0-1.0. Original project prose fields are offered under CC BY 4.0. Third-party titles and bibliographic metadata are not relicensed. Quote-heavy research notes and presentation artifacts are intentionally excluded.\n`
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
outputFiles.set("SHA256SUMS", `${sha256(archive)}  ${archiveName}\n`);

const stableSchemaFiles = new Map(
  Object.values(COLLECTIONS).map((config) => [
    config.schema,
    fs.readFileSync(path.join(DATA_DIR, "schemas", config.schema))
  ])
);

syncGeneratedTree(path.join(DATA_DIR, "exports"), outputFiles, { check });
syncGeneratedTree(SITE_PUBLIC_DATA_DIR, outputFiles, { check });
syncGeneratedTree(path.join(SITE_PUBLIC_DATA_DIR, "..", "schemas"), stableSchemaFiles, { check });

console.log(
  `${check ? "Verified" : "Generated"} portable data products for v${version}: ${releaseFiles.size} release files; archive SHA-256 ${sha256(archive)}.`
);
