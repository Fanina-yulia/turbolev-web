"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function VehicleContextBar() {
  const { vehicleContext, hydrated, clearVehicleContext } = useVehicleContext();
  if (!hydrated) return <aside className="vehicle-context" aria-label="Контекст автомобіля"><div><span>АВТО</span><strong>Завантажуємо контекст…</strong></div></aside>;
  if (!vehicleContext) {
    return (
      <aside className="vehicle-context" aria-label="Контекст автомобіля">
        <div><span>АВТО НЕ ВИБРАНЕ</span><strong>Введіть державний номер або VIN — контекст працюватиме і в магазині, і на СТО</strong></div>
        <div className="vehicle-context-actions"><Link href="/vin">НОМЕР АБО VIN</Link><Link href="/account">МІЙ ГАРАЖ</Link></div>
      </aside>
    );
  }
  return (
    <aside className="vehicle-context vehicle-context-active" aria-label="Активний автомобіль">
      <div><span>{vehicleContext.state} · {vehicleContext.maskedIdentifier}</span><strong>{vehicleDisplayLabel(vehicleContext)}</strong><small>{vehicleContext.message}</small></div>
      <div className="vehicle-context-actions"><Link href="/vin">УТОЧНИТИ</Link><Link href="/account">ГАРАЖ</Link><button type="button" onClick={clearVehicleContext}>ОЧИСТИТИ</button></div>
    </aside>
  );
}
