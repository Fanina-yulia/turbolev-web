import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/catalog";
import { services } from "@/lib/services";
export default function sitemap(): MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL??"https://turbolev-web.vercel.app";
  const fixed=["","/zapchastyny","/vin","/sto","/sto/hlevakha","/poslugy"].map(path=>({url:`${base}${path}`,changeFrequency:"weekly" as const,priority:path===""?1:0.8}));
  const servicePages=services.map(s=>({url:`${base}/poslugy/${s.slug}`,changeFrequency:"weekly" as const,priority:0.75}));
  const cats=categories.map(c=>({url:`${base}/zapchastyny/${c.slug}`,changeFrequency:"weekly" as const,priority:0.7}));
  const prod=products.map(p=>({url:`${base}/zapchastyny/${p.category}/${p.slug}`,changeFrequency:"daily" as const,priority:0.7}));
  return [...fixed,...servicePages,...cats,...prod];
}
