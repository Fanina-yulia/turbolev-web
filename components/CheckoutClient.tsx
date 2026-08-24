"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function CheckoutClient() {
  const { vehicleContext, hydrated } = useVehicleContext();
  const canProceed = hydrated && Boolean(vehicleContext);
  return (
    <div className="checkout-grid">
      <section className="checkout-main">
        <span className="kicker">TURBO LEV · CHECKOUT 02 / 03</span><h1>ПЕРЕВІРКА ПЕРЕД ЗАМОВЛЕННЯМ</h1><p className="lead">У production цей екран запускає vehicle revalidation → product fitment check → price/availability quote → reservation → durable order.</p>
        <article className={`checkout-check ${vehicleContext ? "ok" : "warn"}`}><span>01 · АВТО</span><strong>{vehicleContext ? vehicleDisplayLabel(vehicleContext) : "Авто не вибране"}</strong><p>{vehicleContext ? `${vehicleContext.state} context збережений. Це ще не означає, що конкретна деталь сумісна — product fitment підтвердить API.` : "Додайте номер авто або VIN, інакше authoritative fitment неможливий."}</p>{!vehicleContext ? <Link href="/vin">ДОДАТИ АВТО →</Link> : <Link href="/account">ЗМІНИТИ →</Link>}</article>
        <article className="checkout-check"><span>02 · ТОВАР</span><strong>Повторна перевірка ціни, наявності й сумісності</strong><p>Ніяких застарілих supplier offers або inferred fitment: перед order потрібна authoritative revalidation.</p></article>
        <article className="checkout-check"><span>03 · РЕЗЕРВ</span><strong>Резерв створюється тільки після успішної перевірки</strong><p>Якщо ціна, fitment або залишок змінився — система пояснює причину і не створює фальшиве замовлення.</p></article>
      </section>
      <aside className="checkout-summary"><span>ГОТОВНІСТЬ</span><strong>{canProceed ? "2 / 3" : "1 / 3"}</strong><p>{canProceed ? "Vehicle context є. Наступний production gate — product fitment + commercial revalidation." : "Спочатку виберіть авто."}</p><button className="button button-accent" type="button" disabled={!canProceed}>СТВОРИТИ ПЕРЕВІРЕНИЙ ORDER</button><small>Кнопка навмисно не створює реальне замовлення у foundation.</small></aside>
    </div>
  );
}
