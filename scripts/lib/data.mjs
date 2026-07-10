import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const DATA_DIR = path.join(ROOT, "data");
export const SITE_CALCULATOR_PATH = path.join(
  ROOT,
  "site/src/content/calculators/digital-inventory.json"
);
export const SITE_PUBLIC_DATA_DIR = path.join(ROOT, "site/public/data");

export const COLLECTIONS = Object.freeze({
  sources: { directory: "sources", schema: "source.schema.json" },
  deviceProfiles: { directory: "device-profiles", schema: "device-profile.schema.json" },
  activities: { directory: "activities", schema: "activity.schema.json" },
  presets: { directory: "presets", schema: "preset.schema.json" },
  methodSections: { directory: "methods", schema: "method.schema.json" }
});

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object" || value instanceof Date) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((key) => [key, sortObject(value[key])])
  );
}

export function canonicalJson(value) {
  return `${JSON.stringify(sortObject(value), null, 2)}\n`;
}

export function readManifest() {
  return readJson(path.join(DATA_DIR, "manifest.json"));
}

export function loadCollection(key, manifest = readManifest()) {
  const config = COLLECTIONS[key];
  if (!config) throw new Error(`Unknown canonical collection: ${key}`);

  const directory = path.join(DATA_DIR, config.directory);
  const records = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .map((name) => ({ file: name, record: readJson(path.join(directory, name)) }));

  const order = manifest.order[key];
  const orderIndex = new Map(order.map((id, index) => [id, index]));
  records.sort((left, right) => {
    const leftIndex = orderIndex.get(left.record.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderIndex.get(right.record.id) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex || left.file.localeCompare(right.file, "en");
  });

  return records;
}

export function loadCanonicalData() {
  const manifest = readManifest();
  return {
    manifest,
    sources: loadCollection("sources", manifest),
    deviceProfiles: loadCollection("deviceProfiles", manifest),
    activities: loadCollection("activities", manifest),
    presets: loadCollection("presets", manifest),
    methodSections: loadCollection("methodSections", manifest)
  };
}

function withoutCanonicalMetadata(record, extraKeys = []) {
  const clone = structuredClone(record);
  for (const key of ["order", ...extraKeys]) delete clone[key];
  return clone;
}

export function buildLegacyCalculator(canonical = loadCanonicalData()) {
  const { calculator } = canonical.manifest;
  return {
    title: calculator.title,
    calculatorId: calculator.calculatorId,
    description: calculator.description,
    lastReviewed: calculator.lastReviewed,
    sourceFiles: structuredClone(calculator.sourceFiles),
    updateInstructions: structuredClone(calculator.updateInstructions),
    sourceCatalog: canonical.sources.map(({ record }) => withoutCanonicalMetadata(record)),
    deviceProfiles: canonical.deviceProfiles.map(({ record }) => withoutCanonicalMetadata(record)),
    activities: canonical.activities.map(({ record }) =>
      withoutCanonicalMetadata(record, ["systemBoundary", "lastReviewed"])
    ),
    presets: canonical.presets.map(({ record }) => withoutCanonicalMetadata(record)),
    methodSections: canonical.methodSections.map(({ record }) => withoutCanonicalMetadata(record))
  };
}

export function parseLegacyCalculator(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Legacy calculator Markdown is missing YAML frontmatter.");
  return YAML.parse(match[1]);
}

export function loadBaselineFixture(manifest = readManifest()) {
  return readJson(path.join(ROOT, manifest.baseline.fixture));
}

export function applyBaselineAllowances(baseline, manifest = readManifest()) {
  const expected = structuredClone(baseline);

  for (const allowance of manifest.baseline.allowedMetadataDeltas ?? []) {
    if (!allowance.collection) {
      if (!allowance.field || !Object.hasOwn(expected, allowance.field)) {
        throw new Error(`Baseline allowance field does not exist: ${allowance.field}`);
      }
      if (sha256(canonicalJson(expected[allowance.field])) !== allowance.baselineSha256) {
        throw new Error(`Baseline allowance old value drifted for $.${allowance.field}`);
      }
      expected[allowance.field] = structuredClone(allowance.canonicalValue);
      continue;
    }

    const collection = expected[allowance.collection];
    if (!Array.isArray(collection)) {
      throw new Error(`Baseline allowance collection is not an array: ${allowance.collection}`);
    }

    const record = collection.find((candidate) => candidate.id === allowance.recordId);
    if (!record) {
      throw new Error(
        `Baseline allowance record does not exist: ${allowance.collection}.${allowance.recordId}`
      );
    }
    if (!Object.hasOwn(record, allowance.field)) {
      throw new Error(
        `Baseline allowance field does not exist: ${allowance.collection}.${allowance.recordId}.${allowance.field}`
      );
    }
    if (firstDifference(record[allowance.field], allowance.baselineValue)) {
      throw new Error(
        `Baseline allowance old value drifted for ${allowance.collection}.${allowance.recordId}.${allowance.field}`
      );
    }

    record[allowance.field] = allowance.canonicalValue;
  }

  return expected;
}

export function crossCheckFixtureWithGit(manifest = readManifest()) {
  try {
    execFileSync("git", ["cat-file", "-e", `${manifest.baseline.commit}^{commit}`], {
      cwd: ROOT,
      stdio: "ignore"
    });
  } catch {
    return { available: false, difference: null };
  }

  const markdown = execFileSync(
    "git",
    ["show", `${manifest.baseline.commit}:${manifest.baseline.legacyPath}`],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );
  const difference = firstDifference(loadBaselineFixture(manifest), parseLegacyCalculator(markdown));
  return { available: true, difference };
}

export function firstDifference(left, right, currentPath = "$") {
  if (Object.is(left, right)) return null;
  if (typeof left !== typeof right) return `${currentPath}: type ${typeof left} !== ${typeof right}`;
  if (left === null || right === null) return `${currentPath}: ${String(left)} !== ${String(right)}`;
  if (typeof left !== "object") return `${currentPath}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
  if (Array.isArray(left) !== Array.isArray(right)) return `${currentPath}: array/object mismatch`;

  if (Array.isArray(left)) {
    if (left.length !== right.length) return `${currentPath}.length: ${left.length} !== ${right.length}`;
    for (let index = 0; index < left.length; index += 1) {
      const difference = firstDifference(left[index], right[index], `${currentPath}[${index}]`);
      if (difference) return difference;
    }
    return null;
  }

  const leftKeys = Object.keys(left).sort((a, b) => a.localeCompare(b, "en"));
  const rightKeys = Object.keys(right).sort((a, b) => a.localeCompare(b, "en"));
  if (leftKeys.length !== rightKeys.length) {
    return `${currentPath}: keys ${JSON.stringify(leftKeys)} !== ${JSON.stringify(rightKeys)}`;
  }

  for (let index = 0; index < leftKeys.length; index += 1) {
    if (leftKeys[index] !== rightKeys[index]) {
      return `${currentPath}: keys ${JSON.stringify(leftKeys)} !== ${JSON.stringify(rightKeys)}`;
    }
    const key = leftKeys[index];
    const difference = firstDifference(left[key], right[key], `${currentPath}.${key}`);
    if (difference) return difference;
  }
  return null;
}

export function computePresetTotals(calculator, presetId) {
  const preset = calculator.presets.find((candidate) => candidate.id === presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);

  const totals = {
    serverEnergy: 0,
    totalEnergy: 0,
    directWater: 0,
    totalWater: 0
  };

  for (const activity of calculator.activities) {
    const quantity = preset.values[activity.id] ?? 0;
    const selectedDevice =
      preset.deviceSelections[activity.id] ??
      activity.defaultDeviceId ??
      activity.deviceSelectableIds?.[0] ??
      null;
    const totalWhPerUnit =
      selectedDevice && activity.deviceSelectionAffects?.includes("totalWhPerUnit")
        ? activity.deviceTotalWhOverrides?.[selectedDevice] ?? activity.totalWhPerUnit
        : activity.totalWhPerUnit;

    totals.serverEnergy += quantity * activity.serverWhPerUnit;
    totals.totalEnergy += quantity * totalWhPerUnit;
    totals.directWater += quantity * activity.directWaterMlPerUnit;
    totals.totalWater += quantity * activity.totalWaterMlPerUnit;
  }

  return totals;
}

export function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csvDocument(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const child of listFiles(absolute)) results.push(path.join(entry.name, child));
    } else {
      results.push(entry.name);
    }
  }
  return results.sort((left, right) => left.localeCompare(right, "en"));
}

export function syncGeneratedTree(directory, files, { check = false } = {}) {
  const expectedNames = [...files.keys()].sort((left, right) => left.localeCompare(right, "en"));

  if (check) {
    const actualNames = listFiles(directory);
    if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
      throw new Error(
        `Generated tree drift at ${path.relative(ROOT, directory)}.\nExpected: ${expectedNames.join(", ")}\nActual: ${actualNames.join(", ")}`
      );
    }
    for (const name of expectedNames) {
      const actual = fs.readFileSync(path.join(directory, name));
      const expected = Buffer.isBuffer(files.get(name)) ? files.get(name) : Buffer.from(files.get(name));
      if (!actual.equals(expected)) throw new Error(`Generated file is stale or hand-edited: ${path.relative(ROOT, path.join(directory, name))}`);
    }
    return;
  }

  fs.rmSync(directory, { recursive: true, force: true });
  for (const name of expectedNames) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, files.get(name));
  }
}

export function syncGeneratedFile(filePath, content, { check = false } = {}) {
  const expected = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (check) {
    if (!fs.existsSync(filePath) || !fs.readFileSync(filePath).equals(expected)) {
      throw new Error(`Generated file is stale or hand-edited: ${path.relative(ROOT, filePath)}`);
    }
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, expected);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

export function deterministicZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const flags = 0x0800;
  const dosTime = 0;
  const dosDate = 33;

  for (const [name, rawContent] of [...entries.entries()].sort(([left], [right]) => left.localeCompare(right, "en"))) {
    const filename = Buffer.from(name.replaceAll(path.sep, "/"), "utf8");
    const content = Buffer.isBuffer(rawContent) ? rawContent : Buffer.from(rawContent);
    const checksum = crc32(content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(flags, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(filename.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, filename, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(0x0314, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(flags, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(filename.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, filename);

    offset += localHeader.length + filename.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.size, 8);
  end.writeUInt16LE(entries.size, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}
