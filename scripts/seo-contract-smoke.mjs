import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const rootLayout = read("app/layout.tsx");
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
const seoPolicy = read("lib/seo.ts");

assert.ok(!rootLayout.includes('alternates: { canonical: "/" }'), "Root layout must not force homepage canonical onto every route");
assert.match(rootLayout, /metadataBase:\s*new URL\(siteUrl\)/, "metadataBase must use the normalized site URL");
assert.match(robots, /seoRouteContract\.robotsDisallow/, "robots.ts must use the central robots exclusion contract");
assert.match(sitemap, /absoluteCanonical\(/, "sitemap URLs must use the central canonical builder");
assert.match(seoPolicy, /noindex:\s*\["\/account", "\/koszyk", "\/oformlennia", "\/zapys"\]/, "Utility noindex contract drifted");

for (const route of ["account", "koszyk", "oformlennia", "zapys"]) {
  const layout = read(`app/${route}/layout.tsx`);
  assert.match(layout, /index:\s*false/, `${route} must remain noindex`);
}

console.log("SEO contract smoke: PASS");
