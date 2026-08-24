"use client";

import Link from "next/link";
import { DEMO_VEHICLES, vehicleDisplayLabel } from "@/lib/vehicle-identity";
import { useVehicleContext } from "@/components/VehicleContextProvider";

export function GarageClient() {
  const { vehicleContext, setVehicleContext, clearVehicleContext, hydrated } = useVehicleContext();
  return (
    <div className="garage-layout">
      <section className="garage-primary">
        <span className="kicker">МІЙ ГАРАЖ</span>
        <h1>ВАШЕ АВТО — КОНТЕКСТ ДЛЯ ВСЬОГО TURBO LEV</h1>
        <p className="lead">Оберіть авто один раз. Далі AI, каталог, fitment, кошик і запис на СТО працюють у цьому privacy-safe контексті.</p>
        {!hydrated ? <div className="garage-empty">Завантажуємо гараж…</div> : vehicleContext ? (
          <article className="garage-selected-card">
            <span>{vehicleContext.state}</span>
            <strong>{vehicleDisplayLabel(vehicleContext)}</strong>
            <p>{vehicleContext.message}</p>
            <small>{vehicleContext.maskedIdentifier} · {vehicleContext.canonicalReferenceReady ? "VehicleReference ready" : "resolution pending"} · {vehicleContext.exactFitmentReady ? "exact fitment check ready" : "exact fitment not ready"}</small>
            <div><Link className="button button-accent" href="/zapchastyny">ШУКАТИ ЗАПЧАСТИНИ</Link><button className="button button-dark" type="button" onClick={clearVehicleContext}>ПРИБРАТИ АВТО</button></div>
          </article>
        ) : (
          <div className="garage-empty"><strong>У гаражі ще немає активного авто</strong><p>Введіть державний номер або VIN. Для демонстрації UX можна вибрати privacy-safe тестовий context нижче.</p><Link className="button button-accent" href="/vin">ДОДАТИ АВТО</Link></div>
        )}
      </section>
      <aside className="garage-side">
        <span>ДЕМО-КОНТЕКСТ</span><h2>Перевірити UX без реальних ідентифікаторів</h2><p>Фікстури містять лише маску і PARTIAL facts. Вони не створюють заяву про точний fitment.</p>
        {DEMO_VEHICLES.map((item) => <button key={item.contextId} type="button" onClick={() => setVehicleContext(item)}><b>{vehicleDisplayLabel(item)}</b><small>{item.message}</small></button>)}
      </aside>
    </div>
  );
}
