import type { Metadata } from "next";
import Link from "next/link";
import { CatalogAiAssist } from "@/components/CatalogAiAssist";
import { ProductCard } from "@/components/ProductCard";
import { VehicleContextBar } from "@/components/VehicleContextBar";
import { VehicleIdentityResolver } from "@/components/VehicleIdentityResolver";
import { categories, products } from "@/lib/catalog";

export const metadata: Metadata = { title: "Каталог автозапчастин", description: "Каталог автозапчастин TURBO LEV з AI-підбором, визначенням авто за номером/VIN та перевіркою сумісності." };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div className="shell page section catalog-page">
      <div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><span>Запчастини</span></div>
      <div className="catalog-hero"><div><span className="kicker">TURBO LEV · КАТАЛОГ</span><h1>АВТОЗАПЧАСТИНИ</h1><p>Шукайте по артикулу, категорії або автомобілю. Якщо не знаєте назву деталі — опишіть проблему TURBO LEV AI.</p></div><Link className="button button-accent" href="/vin">ВИЗНАЧИТИ АВТО</Link></div>
      <VehicleContextBar />
      <VehicleIdentityResolver compact title="ДОДАЙТЕ АВТО ДО КАТАЛОГУ" purpose="SHOP" />
      <CatalogAiAssist />
      {q ? <div className="notice">Пошуковий запит: <strong>{q}</strong>. Search index ще в режимі foundation; фінальні результати підуть через Search Read Model.</div> : null}
      <div className="section-head inset"><div><span className="kicker">КАТЕГОРІЇ</span><h2>ОБЕРІТЬ СИСТЕМУ АВТО</h2></div><span className="muted">AI може зробити це за вас</span></div>
      <div className="category-grid compact">{categories.map((c)=><Link className="category-card" key={c.slug} href={`/zapchastyny/${c.slug}`}><span className="category-icon">{c.icon}</span><div><strong>{c.name}</strong><p>{c.description}</p><small>{c.count} позицій</small></div><b>→</b></Link>)}</div>
      <div className="section-head inset"><div><span className="kicker">ВІТРИНА</span><h2>ПОПУЛЯРНІ ТОВАРИ</h2></div><span className="muted">Демо до supplier API</span></div>
      <div className="product-grid">{products.map(p=><ProductCard key={p.slug} product={p}/>)}</div>
    </div>
  );
}
