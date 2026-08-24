"use client";

import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

export function ActiveVehicleChip() {
  const { vehicleContext, hydrated } = useVehicleContext();
  if (!hydrated) return <Link href="/vin" className="active-vehicle-chip">АВТО</Link>;
  if (!vehicleContext) return <Link href="/vin" className="active-vehicle-chip">+ ДОДАТИ АВТО</Link>;
  return <Link href="/vin" className={`active-vehicle-chip state-${vehicleContext.state.toLowerCase()}`} title="Змінити автомобіль"><span>{vehicleContext.state}</span>{vehicleDisplayLabel(vehicleContext)}</Link>;
}
