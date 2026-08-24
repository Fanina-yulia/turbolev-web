"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function ProductFitmentContext() {
  const { vehicleContext, hydrated } = useVehicleContext();
  if (!hydrated) return <section className="product-ai-check"><span>TURBO LEV AI · FITMENT</span><strong>ПЕРЕВІРЯЄМО КОНТЕКСТ АВТО…</strong></section>;
  if (!vehicleContext) {
    return <section className="product-ai-check"><span>TURBO LEV AI · FITMENT</span><strong>ЧИ ПІДХОДИТЬ ДО ВАШОГО АВТО?</strong><p>Без вибраного автомобіля ми не робимо безумовну заяву про сумісність. Додайте номер або VIN — і product fitment API зможе перевірити конкретну деталь.</p><div><b>UNKNOWN</b><Link href="/vin">ДОДАТИ АВТО →</Link></div></section>;
  }
  return <section className="product-ai-check"><span>TURBO LEV AI · FITMENT INPUT</span><strong>{vehicleDisplayLabel(vehicleContext)}</strong><p>{vehicleContext.canonicalReferenceReady ? "VehicleReference готовий для authoritative product fitment check. Цей UI ще не стверджує, що саме ця деталь підходить." : "Vehicle context присутній, але canonical VehicleReference ще не підтверджений. Невідоме ≠ сумісне."}</p><div><b>{vehicleContext.state}</b><Link href="/vin">ПЕРЕВІРИТИ / ЗМІНИТИ →</Link></div></section>;
}
