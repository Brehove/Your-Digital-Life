#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  COLLECTIONS,
  DATA_DIR,
  ROOT,
  loadCanonicalData,
  readJson,
  sha256
} from "./lib/data.mjs";

const canonical = loadCanonicalData();
const errors = [];
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

function fail(message) {
  errors.push(message);
}

for (const [key, config] of Object.entries(COLLECTIONS)) {
  const schema = readJson(path.join(DATA_DIR, "schemas", config.schema));
  const validate = ajv.compile(schema);
  const entries = canonical[key];
  const expectedOrder = canonical.manifest.order[key];
  const actualOrder = entries.map(({ record }) => record.id);

  if (JSON.stringify(actualOrder) !== JSON.stringify(expectedOrder)) {
    fail(`${key} order differs from manifest: ${JSON.stringify(actualOrder)}`);
  }
  if (entries.length !== canonical.manifest.counts[key]) {
    fail(`${key} count ${entries.length} differs from manifest count ${canonical.manifest.counts[key]}`);
  }

  const ids = new Set();
  for (const [index, { file, record }] of entries.entries()) {
    if (!validate(record)) {
      const details = ajv.errorsText(validate.errors, { separator: "; " });
      fail(`${config.directory}/${file} failed ${config.schema}: ${details}`);
    }
    if (ids.has(record.id)) fail(`Duplicate ${key} ID: ${record.id}`);
    ids.add(record.id);
    if (file !== `${record.id}.json`) fail(`${config.directory}/${file} must be named ${record.id}.json`);
    if (record.order !== index + 1) fail(`${config.directory}/${file} order ${record.order} must equal ${index + 1}`);
  }
}

const version = fs.readFileSync(path.join(DATA_DIR, "VERSION"), "utf8").trim();
if (version !== canonical.manifest.datasetVersion) {
  fail(`VERSION ${version} differs from manifest datasetVersion ${canonical.manifest.datasetVersion}`);
}

const fixturePath = path.join(ROOT, canonical.manifest.baseline.fixture);
if (!fs.existsSync(fixturePath)) {
  fail(`Missing frozen baseline fixture ${canonical.manifest.baseline.fixture}`);
} else if (sha256(fs.readFileSync(fixturePath)) !== canonical.manifest.baseline.fixtureSha256) {
  fail(`Frozen baseline fixture checksum differs from manifest`);
}

const sourceIds = new Set(canonical.sources.map(({ record }) => record.id));
const deviceIds = new Set(canonical.deviceProfiles.map(({ record }) => record.id));
const activityMap = new Map(canonical.activities.map(({ record }) => [record.id, record]));

const sourceFingerprints = new Map();
for (const { record } of canonical.sources) {
  const fingerprint = JSON.stringify({
    title: record.title,
    organization: record.organization,
    authors: record.authors,
    url: record.url,
    publishedDate: record.publishedDate,
    sourceTier: record.sourceTier,
    sourceType: record.sourceType
  });
  const existing = sourceFingerprints.get(fingerprint);
  if (existing) fail(`Duplicate source bibliography metadata: ${existing} and ${record.id}`);
  sourceFingerprints.set(fingerprint, record.id);
}

for (const { record: activity } of canonical.activities) {
  for (const sourceId of activity.sourceIds) {
    if (!sourceIds.has(sourceId)) fail(`${activity.id} references unknown source ${sourceId}`);
  }

  const selectable = activity.deviceSelectableIds ?? [];
  const overrides = activity.deviceTotalWhOverrides ?? {};
  for (const deviceId of selectable) {
    if (!deviceIds.has(deviceId)) fail(`${activity.id} references unknown device ${deviceId}`);
  }
  for (const deviceId of Object.keys(overrides)) {
    if (!selectable.includes(deviceId)) fail(`${activity.id} has override for non-selectable device ${deviceId}`);
  }

  if (activity.deviceMode === "not-modeled") {
    if (activity.defaultDeviceId || selectable.length || Object.keys(overrides).length) {
      fail(`${activity.id} is not-modeled but contains device configuration`);
    }
  } else {
    if (!activity.defaultDeviceId) fail(`${activity.id} requires a defaultDeviceId`);
    if (!selectable.includes(activity.defaultDeviceId)) {
      fail(`${activity.id} default device ${activity.defaultDeviceId} is not selectable`);
    }
    if (!(activity.defaultDeviceId in overrides)) {
      fail(`${activity.id} default device ${activity.defaultDeviceId} has no total-energy override`);
    } else if (overrides[activity.defaultDeviceId] !== activity.totalWhPerUnit) {
      fail(`${activity.id} default device override must equal totalWhPerUnit`);
    }
  }
}

for (const { record: preset } of canonical.presets) {
  for (const [activityId, quantity] of Object.entries(preset.values)) {
    if (!activityMap.has(activityId)) fail(`${preset.id} references unknown activity ${activityId}`);
    if (!Number.isFinite(quantity) || quantity < 0) fail(`${preset.id}.${activityId} has invalid quantity ${quantity}`);
  }
  for (const [activityId, deviceId] of Object.entries(preset.deviceSelections)) {
    const activity = activityMap.get(activityId);
    if (!activity) {
      fail(`${preset.id} selects a device for unknown activity ${activityId}`);
    } else if (!(activity.deviceSelectableIds ?? []).includes(deviceId)) {
      fail(`${preset.id} selects invalid device ${deviceId} for ${activityId}`);
    }
  }
}

for (const { record: method } of canonical.methodSections) {
  for (const sourceId of method.sourceIds ?? []) {
    if (!sourceIds.has(sourceId)) fail(`${method.id} references unknown source ${sourceId}`);
  }
  for (const table of method.tables ?? []) {
    for (const [index, row] of table.rows.entries()) {
      if (row.length !== table.columns.length) {
        fail(`${method.id} table ${table.title} row ${index + 1} has ${row.length} cells for ${table.columns.length} columns`);
      }
    }
  }
}

if (fs.existsSync(path.join(DATA_DIR, "datapackage.json"))) {
  const descriptor = readJson(path.join(DATA_DIR, "datapackage.json"));
  if (descriptor.version !== version) fail(`datapackage version ${descriptor.version} differs from ${version}`);
  if (descriptor.custom?.migrationMode !== "canonical") fail("datapackage must identify canonical migration mode");
  if (descriptor.custom?.siteConsumer !== "generated-snapshot") {
    fail("datapackage must identify the generated site snapshot consumer");
  }
  if (JSON.stringify(descriptor).includes("github.com/")) {
    fail("datapackage must not depend on GitHub history URLs");
  }
  for (const source of descriptor.sources ?? []) {
    if (!source.path.startsWith("https://") && !fs.existsSync(path.join(DATA_DIR, source.path))) {
      fail(`datapackage source path does not resolve: ${source.path}`);
    }
  }
  for (const resource of descriptor.resources ?? []) {
    if (!fs.existsSync(path.join(DATA_DIR, resource.path))) {
      fail(`datapackage resource path does not resolve: ${resource.path}`);
    }
    if (typeof resource.schema === "string" && !fs.existsSync(path.join(DATA_DIR, resource.schema))) {
      fail(`datapackage schema path does not resolve: ${resource.schema}`);
    }
    const jsonSchema = resource.custom?.jsonSchema;
    if (typeof jsonSchema === "string" && !fs.existsSync(path.join(DATA_DIR, jsonSchema))) {
      fail(`datapackage JSON Schema path does not resolve: ${jsonSchema}`);
    }
  }
}

if (canonical.manifest.status !== "canonical") fail("manifest status must be canonical");
if (canonical.manifest.migrationMode !== "canonical") fail("manifest migrationMode must be canonical");
if (canonical.manifest.siteConsumer !== "generated-snapshot") {
  fail("manifest siteConsumer must be generated-snapshot");
}
const allowedMetadataDeltas = canonical.manifest.baseline.allowedMetadataDeltas ?? [];
if (allowedMetadataDeltas.length !== 3) {
  fail("exactly three frozen-baseline publication deltas must be declared");
} else {
  const [allowance, sourceFilesAllowance, instructionsAllowance] = allowedMetadataDeltas;
  if (
    allowance.collection !== "sourceCatalog" ||
    allowance.recordId !== "scenario-methods" ||
    allowance.field !== "url" ||
    allowance.baselineValue !== "https://example.com/internal-scenario-method" ||
    allowance.canonicalValue !== "https://your-digital-life.org/sources-and-method/"
  ) {
    fail("the sole source-record allowance must be the scenario-methods URL correction");
  }
  if (
    sourceFilesAllowance.field !== "sourceFiles" ||
    sourceFilesAllowance.baselineSha256 !==
      "a5e3039cdb2c8712319d6788ed6fd97b32dbfa88b7ff023e0ea621956d1a5520"
  ) {
    fail("sourceFiles publication allowance changed unexpectedly");
  }
  if (
    instructionsAllowance.field !== "updateInstructions" ||
    instructionsAllowance.baselineSha256 !==
      "28caf0fcd0320fbb9c39b2a7871913722cc7efe8b72dbba04cf9e163f623ae0b"
  ) {
    fail("updateInstructions publication allowance changed unexpectedly");
  }
}

if (canonical.manifest.baseline.commit !== "063322e93e27704b447a495a838e552067928127") {
  fail("Production baseline commit changed without an explicit new parity baseline");
}
if (canonical.manifest.baseline.legacyPath !== "site/src/content/calculators/digital-inventory.md") {
  fail("Production baseline legacy path changed unexpectedly");
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Data validation passed: ${canonical.activities.length} activities, ${canonical.sources.length} sources, ${canonical.deviceProfiles.length} devices, ${canonical.presets.length} presets, ${canonical.methodSections.length} methods; all references resolve.`
  );
}
