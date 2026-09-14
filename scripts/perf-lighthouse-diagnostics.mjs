import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = ".lighthouseci";
if (!existsSync(dir)) {
  console.log("[perf-diagnostics] no .lighthouseci directory");
  process.exit(0);
}

const files = readdirSync(dir).filter((name) => /^lhr-.*\.json$/.test(name)).sort();
if (!files.length) {
  console.log("[perf-diagnostics] no Lighthouse JSON reports found");
  process.exit(0);
}

for (const file of files) {
  let report;
  try {
    report = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (error) {
    console.log(`[perf-diagnostics] cannot parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  const url = report.finalUrl || report.requestedUrl || file;
  const lcp = report.audits?.["largest-contentful-paint"];
  const lcpElement = report.audits?.["largest-contentful-paint-element"];
  const lcpBreakdown = report.audits?.["lcp-breakdown-insight"];
  const consoleAudit = report.audits?.["errors-in-console"];

  console.log(`\n[perf-diagnostics] ${url}`);
  console.log(`LCP: ${Math.round(Number(lcp?.numericValue || 0))}ms`);

  const elementItems = lcpElement?.details?.items || [];
  for (const item of elementItems.slice(0, 2)) {
    const node = item?.node || item;
    console.log("LCP element:", JSON.stringify({
      snippet: node?.snippet,
      nodeLabel: node?.nodeLabel,
      selector: node?.selector,
      type: item?.type,
    }));
  }

  const breakdownItems = lcpBreakdown?.details?.items || [];
  for (const item of breakdownItems.slice(0, 4)) {
    console.log("LCP breakdown:", JSON.stringify(item));
  }

  const consoleItems = consoleAudit?.details?.items || [];
  if (!consoleItems.length) console.log("Console errors: none");
  for (const item of consoleItems) {
    console.log("Console error:", JSON.stringify({
      description: item?.description,
      source: item?.source,
      url: item?.sourceLocation?.url,
      line: item?.sourceLocation?.line,
      column: item?.sourceLocation?.column,
    }));
  }
}
