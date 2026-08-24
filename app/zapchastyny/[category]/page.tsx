import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogAiAssist } from "@/components/CatalogAiAssist";
import { ProductCard } from "@/components/ProductCard";
import { VehicleContextBar } from "@/components/VehicleContextBar";
import { VehicleIdentityResolver } from "@/components/VehicleIdentityResolver";
import { getCategory, getProductsByCategory } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params; const item = getCategory(category); if (!item) return {};
  return { title: item.name, description: `${item.name}: AI + номер/VIN-підбір і перевірка сумісності у TURBO LEV.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params; const item = getCategory(category); if (!item) notFound(); const list = getProductsByCategory(category);
  return (
    <div className="shell page section category-page">
      <div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><Link href="/zapchastyny">Запчастини</Link><span>›</span><span>{item.name}</span></div>
      <div className="catalog-hero"><div><span className="kicker">КАТЕГОРІЯ</span><h1>{item.name}</h1><p>{item.description}. Виберіть авто — і ми звузимо список до перевірених fitment-кандидатів.</p></div><Link className="button button-accent" href="/vin">ВИБРАТИ АВТО</Link></div>
      <VehicleContextBar />
      <VehicleIdentityResolver compact title="ВИЗНАЧТЕ АВТО ДЛЯ FITMENT" purpose="SHOP" />
      <CatalogAiAssist compact />
      <div className="listing"><aside className="filters"><strong>ФІЛЬТРИ</strong><label><span>Бренд</span><select defaultValue="all"><option value="all">Усі бренди</option><option>BOSCH</option><option>LEMFÖRDER</option><option>MANN-FILTER</option></select></label><label><span>Наявність</span><select defaultValue="all"><option value="all">Усі</option><option>В наявності</option><option>Під замовлення</option></select></label><label><span>Сумісність</span><select defaultValue="all"><option value="all">Спочатку виберіть авто</option></select></label><div className="filter-note">Фасети та fitment працюватимуть через Search Read Model. Невідоме ≠ несумісне.</div></aside><div><div className="listing-top"><span>{list.length || 0} демо-товарів</span><button>ЗА РЕЛЕВАНТНІСТЮ ▾</button></div>{list.length ? <div className="product-grid two">{list.map(p=><ProductCard key={p.slug} product={p}/>)}</div> : <div className="empty"><h2>КАТЕГОРІЯ ГОТОВА</h2><p>Структура сторінки й URL готові. Товари з’являться після canonical catalog + supplier publish.</p></div>}</div></div>
    </div>
  );
}
