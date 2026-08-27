import type { MetadataRoute } from "next";
import { seoRouteContract, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...seoRouteContract.robotsDisallow],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
