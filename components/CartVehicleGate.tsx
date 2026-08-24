"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function CartVehicleGate() {
  const { vehicleContext, hydrated } = useVehicleContext();
  if (!hydrated) return <section className="cart-ai-gate"><div><span>TURBO LEV AI · PRE-CHECK</span><strong>ПЕРЕВІРЯЄМО КОНТЕКСТ АВТО</strong></div></section>;
  if (!vehicleContext) return <section className="cart-ai-gate"><div><span>TURBO LEV AI · PRE-CHECK</span><strong>АВТО ЩЕ НЕ ВИБРАНЕ</strong><p>Товар можна тримати в кошику, але перед оформленням ми не називаємо його сумісним без authoritative vehicle + product fitment.</p></div><Link href="/vin">ДОДАТИ АВТО →</Link></section>;
  return <section className="cart-ai-gate"><div><span>TURBO LEV AI · VEHICLE CONTEXT</span><strong>{vehicleDisplayLabel(vehicleContext)}</strong><p>{vehicleContext.canonicalReferenceReady ? "VehicleReference готовий. Конкретну деталь усе одно має підтвердити product fitment check." : `${vehicleContext.state} context збережено; конфігурацію ще може знадобитися уточнити перед order.`}</p></div><Link href="/account">ЗМІНИТИ АВТО →</Link></section>;
}
