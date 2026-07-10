import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import process from "node:process";

const distDirectory = resolve(process.cwd(), "dist");

const expectedPages = new Set([
  "index.html",
  "about-this-site/index.html",
  "contribute/index.html",
  "data/index.html",
  "inventory-your-day/index.html",
  "resources/index.html",
  "sources-and-method/index.html",
  "what-a-prompt-costs/index.html",
]);

const intentional404Pages = [
  "compare-daily-use/index.html",
  "how-data-centers-work/index.html",
  "start-here/index.html",
  "updates/index.html",
];

const expectedDownloads = [
  "data/SHA256SUMS",
  "data/your-digital-life-data-v0.1.0.zip",
  "data/latest/activities.json",
  "data/latest/activities.csv",
  "data/latest/sources.json",
  "data/latest/device-profiles.json",
  "data/latest/presets.json",
  "data/latest/methods.json",
  "data/latest/manifest.json",
  "data/latest/datapackage.json",
  "data/latest/SHA256SUMS",
  "data/latest/schemas/activity.schema.json",
  "data/latest/schemas/activities-table.schema.json",
  "data/v0.1.0/manifest.json",
  "data/v0.1.0/datapackage.json",
  "data/v0.1.0/SHA256SUMS",
  "schemas/activity.schema.json",
  "schemas/device-profile.schema.json",
  "schemas/method.schema.json",
  "schemas/preset.schema.json",
  "schemas/source.schema.json",
];

async function collectIndexFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectIndexFiles(path)));
    } else if (entry.isFile() && entry.name === "index.html") {
      files.push(relative(distDirectory, path).split(sep).join("/"));
    }
  }

  return files;
}

const generatedPages = new Set(await collectIndexFiles(distDirectory));
const missingPages = [...expectedPages].filter((page) => !generatedPages.has(page));
const unexpectedPages = [...generatedPages].filter((page) => !expectedPages.has(page));

if (missingPages.length > 0 || unexpectedPages.length > 0) {
  throw new Error(
    [
      missingPages.length > 0 ? `Missing routes: ${missingPages.join(", ")}` : "",
      unexpectedPages.length > 0
        ? `Unexpected routes: ${[...new Set(unexpectedPages)].join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

for (const page of expectedPages) {
  const pageStat = await stat(resolve(distDirectory, page));
  if (pageStat.size === 0) {
    throw new Error(`Generated route is empty: ${page}`);
  }
}

for (const download of expectedDownloads) {
  const downloadStat = await stat(resolve(distDirectory, download));
  if (downloadStat.size === 0) throw new Error(`Generated download is empty: ${download}`);
}

const archiveName = "your-digital-life-data-v0.1.0.zip";
const archive = await readFile(resolve(distDirectory, "data", archiveName));
const archiveChecksum = createHash("sha256").update(archive).digest("hex");
const publishedChecksum = (
  await readFile(resolve(distDirectory, "data/SHA256SUMS"), "utf8")
).trim();
if (publishedChecksum !== `${archiveChecksum}  ${archiveName}`) {
  throw new Error("Published ZIP archive does not match data/SHA256SUMS.");
}

const redirects = (await readFile(resolve(distDirectory, "_redirects"), "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const expectedRedirect = "/benefits-and-risks/ /";
if (redirects.length !== 1 || redirects[0] !== expectedRedirect) {
  throw new Error(
    `Redirect contract changed. Expected only "${expectedRedirect}"; received ${JSON.stringify(redirects)}.`,
  );
}

console.log(
  `Route contract verified: ${generatedPages.size} pages, ${expectedDownloads.length} key downloads, 1 temporary redirect, and ${intentional404Pages.length} intentional 404 paths.`,
);
