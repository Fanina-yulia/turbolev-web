import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const pageTypes = [
  ["PT-001", "Homepage", "index", ["Organization", "OnlineStore"]],
  ["PT-002", "STO Network Hub", "index", ["BreadcrumbList"]],
  ["PT-003", "City Hub", "conditional", ["BreadcrumbList"]],
  ["PT-004", "Station Page", "index", ["LocalBusiness", "BreadcrumbList"]],
  ["PT-005", "Service Page", "index", ["BreadcrumbList"]],
  ["PT-006", "Service×Station", "conditional", ["LocalBusiness", "BreadcrumbList"]],
  ["PT-007", "Brand Hub", "conditional", ["BreadcrumbList"]],
  ["PT-008", "Model Hub", "conditional", ["BreadcrumbList"]],
  ["PT-009", "Service×Model", "conditional", ["BreadcrumbList"]],
  ["PT-010", "Symptom Page", "conditional", ["Article", "BreadcrumbList"]],
  ["PT-011", "Shop Root", "index", ["Organization", "OnlineStore"]],
  ["PT-012", "Category", "index", ["BreadcrumbList"]],
  ["PT-013", "Vehicle×Category", "conditional", ["BreadcrumbList"]],
  ["PT-014", "Brand×Category", "conditional", ["BreadcrumbList"]],
  ["PT-015", "PDP", "index", ["Product", "Offer", "BreadcrumbList"]],
  ["PT-016", "VIN Utility", "utility", []],
  ["PT-017", "Internal Search", "noindex", []],
  ["PT-018", "AI Assistant", "noindex", []],
  ["PT-019", "Account", "noindex", []],
  ["PT-020", "Editorial Article", "index", ["Article", "BreadcrumbList"]],
];

const p0QualityGates = new Map([
  ["PT-003", "QG-LOC-001"], ["PT-004", "QG-LOC-001"], ["PT-006", "QG-LOC-001"],
  ["PT-005", "QG-SVC-001"], ["PT-007", "QG-MODEL-001"], ["PT-008", "QG-MODEL-001"],
  ["PT-009", "QG-SVCMODEL-001"], ["PT-010", "QG-SYM-001"], ["PT-012", "QG-CAT-001"],
  ["PT-013", "QG-VEHCAT-001"], ["PT-015", "QG-PDP-001"], ["PT-018", "QG-AI-SEO-001"],
]);

assert.equal(pageTypes.length, 20, "SEO-002 must retain PT-001..PT-020 coverage");
const ids = pageTypes.map(([id]) => id);
assert.equal(new Set(ids).size, ids.length, "Page Type IDs must be unique");
ids.forEach((id, index) => assert.equal(id, `PT-${String(index + 1).padStart(3, "0")}`, "Page Type sequence drifted"));

for (const [id, name, indexPolicy, schemas] of pageTypes) {
  assert.ok(name.length > 0, `${id} must have a named page contract`);
  assert.ok(["index", "conditional", "noindex", "utility"].includes(indexPolicy), `${id} has unknown index policy`);
  assert.equal(new Set(schemas).size, schemas.length, `${id} schema contract contains duplicates`);
  if (indexPolicy === "conditional") assert.ok(p0QualityGates.has(id) || id === "PT-014", `${id} needs an explicit quality gate before indexation`);
}

for (const id of ["PT-017", "PT-018", "PT-019"]) {
  const row = pageTypes.find(([pageTypeId]) => pageTypeId === id);
  assert.equal(row?.[2], "noindex", `${id} must remain noindex`);
}

const seoPolicy = read("lib/seo.ts");
const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");

const contractMatch = seoPolicy.match(/indexable:\s*\[([\s\S]*?)\],\s*noindex:\s*\[([\s\S]*?)\],\s*robotsDisallow:/);
assert.ok(contractMatch, "Unable to parse central SEO route contract");
const quotedRoutes = (source) => [...source.matchAll(/"([^"\n]+)"/g)].map((match) => match[1]);
const indexableRoutes = quotedRoutes(contractMatch[1]);
const noindexRoutes = quotedRoutes(contractMatch[2]);

assert.equal(new Set(indexableRoutes).size, indexableRoutes.length, "Indexable route contract contains duplicates");
assert.equal(new Set(noindexRoutes).size, noindexRoutes.length, "Noindex route contract contains duplicates");
for (const route of indexableRoutes) assert.ok(!noindexRoutes.includes(route), `${route} cannot be both indexable and noindex`);

for (const route of indexableRoutes) {
  const pagePath = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
  assert.ok(existsSync(join(root, pagePath)), `${route} is indexable but has no materialized page at ${pagePath}`);
}

for (const route of noindexRoutes) {
  const layoutPath = `app${route}/layout.tsx`;
  assert.ok(existsSync(join(root, layoutPath)), `${route} is noindex but has no route-level layout guard`);
  assert.match(read(layoutPath), /index:\s*false/, `${route} must explicitly emit robots.index=false`);
}

assert.match(sitemap, /absoluteCanonical\(/, "Sitemap entries must use the canonical URL builder");
for (const route of noindexRoutes) assert.ok(!sitemap.includes(`"${route}"`), `Sitemap must not include noindex route ${route}`);
assert.match(robots, /seoRouteContract\.robotsDisallow/, "robots.ts must consume central robots exclusions");

const pdp = pageTypes.find(([id]) => id === "PT-015");
assert.deepEqual(pdp?.[3], ["Product", "Offer", "BreadcrumbList"], "PDP schema contract must preserve Product+Offer+BreadcrumbList consistency gate");

console.log(`SEO quality regression: PASS (${pageTypes.length} page types, ${p0QualityGates.size} P0 gate bindings)`);
