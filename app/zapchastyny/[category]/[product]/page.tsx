import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProduct, money } from "@/lib/catalog";
import { ProductFitmentContext } from "@/components/ProductFitmentContext";
import { VehicleContextBar } from "@/components/VehicleContextBar";
import { VehicleIdentityResolver } from "@/components/VehicleIdentityResolver";

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product } = await params; const item = getProduct(product); if (!item) return {};
  return { title: `${item.brand} ${item.article} — ${item.name}`, description: `${item.name}. AI + номер/VIN vehicle context, authoritative fitment перевірка, ціна та встановлення на СТО TURBO LEV.` };
}

export default async function ProductPage({ params }: { params: Promise<{ category: string; product: string }> }) {
  const { category, product } = await params; const item = getProduct(product); const cat = getCategory(category); if (!item || !cat || item.category !== cat.slug) notFound();
  return <div className="shell page section product-page"><div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><Link href="/zapchastyny">Запчастини</Link><span>›</span><Link href={`/zapchastyny/${cat.slug}`}>{cat.name}</Link><span>›</span><span>{item.brand}</span></div><VehicleContextBar/><VehicleIdentityResolver compact title="АВТО ДЛЯ ПЕРЕВІРКИ ЦІЄЇ ДЕТАЛІ" purpose="SHOP"/><div className="pdp"><div className="pdp-visual"><span>{item.brand}</span><strong>{item.article}</strong><small>Canonical media layer</small></div><div className="pdp-info"><div className="eyebrow">{item.brand} · АРТ. {item.article}</div><h1>{item.name}</h1><ProductFitmentContext/><ul className="feature-list">{item.features.map(x=><li key={x}>✓ {x}</li>)}</ul><div className="buy-box"><div><p className="stock ok-dot">{item.availability}</p><div className="pdp-price"><strong>{money(item.price)}</strong>{item.oldPrice?<del>{money(item.oldPrice)}</del>:null}</div><small>{item.delivery}</small></div><button className="button button-accent" type="button">ДОДАТИ В КОШИК</button></div><div className="install-row"><div><strong>ДЕТАЛЬ + ВСТАНОВЛЕННЯ</strong><p>Додайте роботу TURBO LEV до покупки — booking отримає vehicle context і артикул, але не raw identifier.</p></div><Link href={`/zapys?intent=install&product=${encodeURIComponent(item.article)}`}>ДОДАТИ ВСТАНОВЛЕННЯ →</Link></div></div></div><section className="pdp-details"><div className="section-head"><div><span className="kicker">FITMENT</span><h2>СУМІСНІСТЬ — ДЕМО-ДАНІ</h2></div><Link href="/#ai">ЗАПИТАТИ AI →</Link></div><div className="fitment-tags">{item.fitment.map(x=><span key={x}>{x}</span>)}</div><p className="micro">Цей список — лише демонстраційний контент foundation і не є product compatibility claim. Production verdict формується тільки VehicleReference + VehicleFitment + mandatory criteria.</p></section></div>;
}
