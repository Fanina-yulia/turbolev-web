import Link from "next/link";
import { AiCommandSurface } from "@/components/AiCommandSurface";
import { VehicleIdentityResolver } from "@/components/VehicleIdentityResolver";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/catalog";

const categoryImages = [1,2,3,4,5,6].map((n) => `/brand/cat${n}.jpg`);

export default function HomePage() {
  return (
    <>
      <section className="home-benefits" aria-label="Переваги TURBO LEV">
        <div className="shell home-benefits-grid">
          <div><b>◉</b><span><strong>Перевірка сумісності</strong><small>Номер/VIN + fitment перед рекомендацією</small></span></div>
          <div><b>↗</b><span><strong>Актуальна пропозиція</strong><small>Ціна й наявність після revalidation</small></span></div>
          <div><b>AI</b><span><strong>AI + експерт</strong><small>Складні випадки передаємо майстру</small></span></div>
          <div><b>VIN</b><span><strong>Номер або VIN</strong><small>Одне авто для магазину й СТО</small></span></div>
        </div>
      </section>

      <section className="home-hero">
        <picture className="home-hero-media" aria-hidden="true">
          <source media="(prefers-color-scheme: light)" srcSet="/brand/hero-light.jpg" />
          <img className="hero-img-dark" src="/brand/hero-dark.jpg" alt="" />
          <img className="hero-img-light" src="/brand/hero-light.jpg" alt="" />
        </picture>
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="shell home-hero-inner">
          <div className="home-hero-copy">
            <h1>ЗАПЧАСТИНИ<br/><span>БЕЗ ЛОТЕРЕЇ</span></h1>
            <p>Не продаємо «десь має підійти». Підбираємо деталі під конкретне авто, перевіряємо сумісність і за потреби встановлюємо на TURBO LEV.</p>
            <div className="home-hero-actions">
              <Link href="/vin" className="button button-accent">ВИЗНАЧИТИ АВТО</Link>
              <Link href="/zapchastyny" className="button button-ghost">ВІДКРИТИ КАТАЛОГ →</Link>
            </div>
            <form action="/zapchastyny" className="home-article-search">
              <label htmlFor="article">Або знайдіть деталь за артикулом</label>
              <div><input id="article" name="q" placeholder="Введіть артикул, напр. 03L145701R"/><button type="submit">⌕</button></div>
            </form>
          </div>
          <div className="home-vin-card home-vehicle-card">
            <VehicleIdentityResolver compact title="НОМЕР АВТО АБО VIN" purpose="GLOBAL" />
          </div>
        </div>
      </section>

      <div className="shell"><AiCommandSurface /></div>

      <section className="section shell home-categories">
        <div className="section-head"><div><span className="kicker">КАТАЛОГ TURBO LEV</span><h2>ПОПУЛЯРНІ КАТЕГОРІЇ</h2></div><Link href="/zapchastyny">ПЕРЕГЛЯНУТИ ВЕСЬ КАТАЛОГ →</Link></div>
        <div className="home-category-grid">
          {categories.map((category, index) => (
            <Link className="home-category-card" key={category.slug} href={`/zapchastyny/${category.slug}`}>
              <img src={categoryImages[index]} alt="" />
              <div className="home-category-body"><span>{category.icon}</span><strong>{category.name}</strong><small>{category.count} позицій</small></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-process">
        <div className="shell section">
          <h2>ЯК ПРАЦЮЄ TURBO LEV</h2>
          <div className="home-process-grid">
            <article><b>01</b><span>▣</span><strong>ВИ ЗАЛИШАЄТЕ ЗАПИТ</strong><p>AI, номер авто, VIN, артикул або звичайний опис проблеми.</p></article>
            <article><b>02</b><span>⌕</span><strong>МИ ПІДБИРАЄМО</strong><p>Зіставляємо авто, каталог і сумісність.</p></article>
            <article><b>03</b><span>□</span><strong>ПРОПОНУЄМО ВАРІАНТИ</strong><p>Ціна, доступність і пояснення різниці.</p></article>
            <article><b>04</b><span>⌁</span><strong>ВСТАНОВЛЮЄМО</strong><p>За потреби додаємо роботу на нашому СТО.</p></article>
            <article><b>05</b><span>✓</span><strong>ВИ ЇДЕТЕ ВПЕВНЕНО</strong><p>Один маршрут: деталь → сервіс → результат.</p></article>
          </div>
          <div className="home-trust">
            <h3>ЧОМУ НАМ ДОВІРЯЮТЬ</h3>
            <div><article><b>◎</b><span><strong>ТОЧНІСТЬ ПІДБОРУ</strong><small>Сумісність перевіряємо даними.</small></span></article><article><b>◈</b><span><strong>ПЕРЕВІРЕНІ БРЕНДИ</strong><small>Канонічний каталог без дублів.</small></span></article><article><b>◇</b><span><strong>ПРОЗОРІ УМОВИ</strong><small>Не показуємо вигадану наявність.</small></span></article><article><b>↗</b><span><strong>ШВИДКИЙ МАРШРУТ</strong><small>Покупка і СТО в одному сценарії.</small></span></article><article><b>⌘</b><span><strong>ЕКСПЕРТНА ПІДТРИМКА</strong><small>AI передає складні кейси майстру.</small></span></article></div>
          </div>
        </div>
      </section>

      <section className="section shell home-products">
        <div className="section-head"><div><span className="kicker">ВІТРИНА</span><h2>ПОПУЛЯРНІ ЗАПЧАСТИНИ</h2></div><span className="muted">Демо-дані до supplier API</span></div>
        <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>

      <section className="home-station">
        <div className="shell home-station-box">
          <picture aria-hidden="true"><img className="station-img-dark" src="/brand/service-dark.jpg" alt=""/><img className="station-img-light" src="/brand/service-light.jpg" alt=""/></picture>
          <div className="home-station-shade" />
          <div className="home-station-copy"><span>ВСТАНОВЛЕННЯ НА НАШИХ СТО</span><h2>ПРОФЕСІЙНА УСТАНОВКА —<br/>ОДИН МАРШРУТ ДО РЕЗУЛЬТАТУ</h2><ul><li>Діагностика перед встановленням, коли вона потрібна</li><li>Підбір деталі під конкретне авто</li><li>Деталь + робота + історія в TURBO LEV</li></ul><Link href="/sto" className="button button-accent">ЗНАЙТИ НАШЕ СТО</Link></div>
        </div>
      </section>
    </>
  );
}
