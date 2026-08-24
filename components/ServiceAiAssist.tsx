"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function ServiceAiAssist({ serviceName }: { serviceName: string }) {
  const { vehicleContext, hydrated } = useVehicleContext();
  return (
    <aside className="service-ai-assist">
      <span>TURBO LEV AI · ДІАГНОСТИЧНИЙ МАРШРУТ</span>
      <strong>{serviceName}</strong>
      <p>{hydrated && vehicleContext ? `Контекст авто: ${vehicleDisplayLabel(vehicleContext)} (${vehicleContext.state}). AI може використати його для уточнень, але причина несправності підтверджується діагностикою майстра.` : "Оберіть авто за номером або VIN — AI поставить точніші уточнення і передасть privacy-safe контекст майстру."}</p>
      <div>{vehicleContext ? <Link href="/account">ЗМІНИТИ АВТО →</Link> : <Link href="/vin">ДОДАТИ АВТО →</Link>}<Link href="/#ai">ОПИСАТИ СИМПТОМ →</Link></div>
    </aside>
  );
}
