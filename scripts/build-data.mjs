#!/usr/bin/env node

import path from "node:path";
import {
  DATA_DIR,
  ROOT,
  SITE_CALCULATOR_PATH,
  buildLegacyCalculator,
  canonicalJson,
  loadCanonicalData,
  syncGeneratedFile,
  syncGeneratedTree
} from "./lib/data.mjs";
import {
  buildDataReviewGuide,
  loadActivityEvidence,
  loadSourceEvidence
} from "./lib/review-guide.mjs";

const check = process.argv.includes("--check");
const canonical = loadCanonicalData();
const calculator = buildLegacyCalculator(canonical);
const sourceEvidence = loadSourceEvidence();
const activityEvidence = loadActivityEvidence();

const generated = new Map([
  ["calculator.json", canonicalJson(calculator)],
  [
    "calculator-payload.json",
    canonicalJson({
      activities: calculator.activities,
      presets: calculator.presets,
      deviceProfiles: calculator.deviceProfiles
    })
  ]
]);

const dataPackage = {
  profile: "data-package",
  name: "your-digital-life",
  title: "Your Digital Life calculator data",
  description:
    "The canonical, machine-readable records behind the Your Digital Life calculator, with deterministic public exports and a generated website snapshot.",
  version: canonical.manifest.datasetVersion,
  homepage: "https://your-digital-life.org",
  licenses: [
    {
      name: "CC0-1.0",
      path: "https://creativecommons.org/publicdomain/zero/1.0/",
      title: "CC0 1.0 Universal"
    },
    {
      name: "CC-BY-4.0",
      path: "https://creativecommons.org/licenses/by/4.0/",
      title: "Creative Commons Attribution 4.0 International"
    }
  ],
  contributors: [{ title: "Joel Gladd", role: "author" }],
  sources: [
    {
      title: "Your Digital Life sources and methodology",
      path: "https://your-digital-life.org/sources-and-method/"
    },
    {
      title: "Dataset documentation",
      path: "README.md"
    }
  ],
  resources: [
    {
      name: "activities-json",
      path: "exports/latest/activities.json",
      format: "json",
      mediatype: "application/json",
      custom: { jsonSchema: "schemas/activity.schema.json" }
    },
    {
      name: "activities-csv",
      path: "exports/latest/activities.csv",
      format: "csv",
      mediatype: "text/csv",
      schema: "schemas/activities-table.schema.json"
    },
    {
      name: "sources",
      path: "exports/latest/sources.json",
      format: "json",
      mediatype: "application/json",
      custom: { jsonSchema: "schemas/source.schema.json" }
    },
    {
      name: "device-profiles",
      path: "exports/latest/device-profiles.json",
      format: "json",
      mediatype: "application/json",
      custom: { jsonSchema: "schemas/device-profile.schema.json" }
    },
    {
      name: "presets",
      path: "exports/latest/presets.json",
      format: "json",
      mediatype: "application/json",
      custom: { jsonSchema: "schemas/preset.schema.json" }
    },
    {
      name: "methods",
      path: "exports/latest/methods.json",
      format: "json",
      mediatype: "application/json",
      custom: { jsonSchema: "schemas/method.schema.json" }
    }
  ],
  custom: {
    schemaVersion: canonical.manifest.schemaVersion,
    productionBaseline: {
      commit: canonical.manifest.baseline.commit,
      fixtureRepositoryPath: canonical.manifest.baseline.fixture,
      fixtureSha256: canonical.manifest.baseline.fixtureSha256,
      productionUrl: canonical.manifest.baseline.productionUrl
    },
    licenseScope: {
      dataRecordsAndExports: "CC0-1.0",
      originalProjectProseFields: "CC-BY-4.0",
      thirdPartyTitlesAndBibliographicMetadata: "Not relicensed; included only as source metadata"
    },
    migrationMode: "canonical",
    siteConsumer: "generated-snapshot"
  }
};

syncGeneratedTree(path.join(DATA_DIR, "generated"), generated, { check });
syncGeneratedFile(path.join(DATA_DIR, "datapackage.json"), canonicalJson(dataPackage), { check });
syncGeneratedFile(SITE_CALCULATOR_PATH, canonicalJson(calculator), { check });
syncGeneratedFile(
  path.join(ROOT, "DATA-REVIEW-GUIDE.md"),
  buildDataReviewGuide(canonical, sourceEvidence, activityEvidence),
  { check }
);

console.log(
  `${check ? "Verified" : "Generated"} canonical calculator artifacts: ${calculator.activities.length} activities, ${calculator.presets.length} presets, ${calculator.sourceCatalog.length} sources.`
);
