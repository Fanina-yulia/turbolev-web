import { mkdir, readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import process from "node:process";

const baseUrl = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = ".lighthouseci/perf-002";

const templates = [
  { id: "TPL-01", path: "/", jsBudgetKb: 170 },
  { id: "TPL-02", path: "/poslugy", jsBudgetKb: 170 },
  { id: "TPL-05", path: "/zapchastyny", jsBudgetKb: 220 },
  { id: "TPL-08", path: "/koszyk", jsBudgetKb: 260 },
  { id: "TPL-09", path: "/account", jsBudgetKb: 260 },
];

const hardBudgets = {
  lcpMs: 2000,
  cls: 0.05,
  tbtMs: 200,
};

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`))));
  });
}

function auditNumber(lhr, id) {
  const value = lhr.audits?.[id]?.numericValue;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Lighthouse audit ${id} did not return a numeric value`);
  }
  return value;
}

function firstPartyScriptTransferBytes(lhr) {
  const items = lhr.audits?.["network-requests"]?.details?.items ?? [];
  const origin = new URL(baseUrl).origin;
  return items
    .filter((item) => item.resourceType === "Script" && typeof item.url === "string" && item.url.startsWith(origin))
    .reduce((sum, item) => sum + (typeof item.transferSize === "number" ? item.transferSize : 0), 0);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const failures = [];
const summary = [];

for (const template of templates) {
  const url = new URL(template.path, baseUrl).toString();
  const reportPath = `${outputDir}/${template.id}.json`;

  await run("npx", [
    "--no-install",
    "lighthouse",
    url,
    "--quiet",
    "--output=json",
    `--output-path=${reportPath}`,
    "--only-categories=performance",
    "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
  ]);

  const lhr = JSON.parse(await readFile(reportPath, "utf8"));
  const lcpMs = auditNumber(lhr, "largest-contentful-paint");
  const cls = auditNumber(lhr, "cumulative-layout-shift");
  const tbtMs = auditNumber(lhr, "total-blocking-time");
  const jsBytes = firstPartyScriptTransferBytes(lhr);
  const jsBudgetBytes = template.jsBudgetKb * 1024;

  summary.push({ id: template.id, path: template.path, lcpMs, cls, tbtMs, jsBytes, jsBudgetBytes });

  if (lcpMs > hardBudgets.lcpMs) failures.push(`${template.id} LCP ${Math.round(lcpMs)}ms > ${hardBudgets.lcpMs}ms`);
  if (cls > hardBudgets.cls) failures.push(`${template.id} CLS ${cls.toFixed(3)} > ${hardBudgets.cls}`);
  if (tbtMs > hardBudgets.tbtMs) failures.push(`${template.id} TBT ${Math.round(tbtMs)}ms > ${hardBudgets.tbtMs}ms`);
  if (jsBytes > jsBudgetBytes) failures.push(`${template.id} first-party JS ${(jsBytes / 1024).toFixed(1)}KB > ${template.jsBudgetKb}KB`);
}

console.table(summary.map((row) => ({
  Template: row.id,
  Route: row.path,
  "LCP ms": Math.round(row.lcpMs),
  CLS: Number(row.cls.toFixed(3)),
  "TBT ms": Math.round(row.tbtMs),
  "1P JS KB": Number((row.jsBytes / 1024).toFixed(1)),
  "JS budget KB": row.jsBudgetBytes / 1024,
})));

if (failures.length > 0) {
  console.error("\nPERF-002 regression gate failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("\nPERF-002 regression gate passed.");
console.log("Note: Lighthouse navigation does not measure field INP; TBT <= 200ms is a synthetic responsiveness guard only. Field INP remains a RUM requirement after public launch.");
