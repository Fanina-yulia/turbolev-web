import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://turbolev-web.vercel.app";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL).replace(/\/$/, "");

export type SeoIndexPolicy = "index" | "noindex";

export function canonicalPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function absoluteCanonical(pathname: string): string {
  return `${siteUrl}${canonicalPath(pathname)}`;
}

export function seoMetadata(input: {
  title: string;
  description: string;
  canonical: string;
  index?: SeoIndexPolicy;
}): Metadata {
  const index = input.index ?? "index";
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: canonicalPath(input.canonical) },
    robots: index === "index"
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export const seoRouteContract = {
  indexable: [
    "/",
    "/sto",
    "/sto/hlevakha",
    "/poslugy",
    "/zapchastyny",
    "/vin",
  ],
  noindex: ["/account", "/koszyk", "/oformlennia", "/zapys"],
  robotsDisallow: ["/api/", "/account/"],
} as const;
