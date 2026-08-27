import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/catalog";
import { services } from "@/lib/services";
import { absoluteCanonical } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/zapchastyny", "/vin", "/sto", "/sto/hlevakha", "/poslugy"].map((path) => ({
    url: absoluteCanonical(path),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const servicePages = services.map((service) => ({
    url: absoluteCanonical(`/poslugy/${service.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const categoryPages = categories.map((category) => ({
    url: absoluteCanonical(`/zapchastyny/${category.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages = products.map((product) => ({
    url: absoluteCanonical(`/zapchastyny/${product.category}/${product.slug}`),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...fixed, ...servicePages, ...categoryPages, ...productPages];
}
