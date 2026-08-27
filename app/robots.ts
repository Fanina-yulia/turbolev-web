import type { MetadataRoute } from "next";
import { seoRouteContract, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: seoRouteContract.noindex.map((path) => `${path}/`),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
