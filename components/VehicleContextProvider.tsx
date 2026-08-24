"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PublicVehicleContext } from "@/lib/vehicle-identity";

const STORAGE_KEY = "turbolev.publicVehicleContext.v2";
const LEGACY_STORAGE_KEYS = ["turbolev.vehicle.v1"];

type VehicleContextValue = {
  vehicleContext: PublicVehicleContext | null;
  setVehicleContext: (value: PublicVehicleContext | null) => void;
  clearVehicleContext: () => void;
  hydrated: boolean;
};

const VehicleContext = createContext<VehicleContextValue | null>(null);

function isSafeStoredContext(value: unknown): value is PublicVehicleContext {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PublicVehicleContext>;
  return (item.state === "VERIFIED" || item.state === "PARTIAL" || item.state === "ASSISTED")
    && (item.inputType === "PLATE" || item.inputType === "VIN")
    && typeof item.maskedIdentifier === "string"
    && item.maskedIdentifier.length <= 32
    && typeof item.source === "string"
    && Number.isFinite(Number(item.confidence));
}

export function VehicleContextProvider({ children }: { children: React.ReactNode }) {
  const [vehicleContext, setState] = useState<PublicVehicleContext | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isSafeStoredContext(parsed)) setState(parsed);
        else localStorage.removeItem(STORAGE_KEY);
      }
      for (const legacyKey of LEGACY_STORAGE_KEYS) localStorage.removeItem(legacyKey);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setVehicleContext = useCallback((value: PublicVehicleContext | null) => {
    setState(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage is an optimization only; in-memory context remains usable.
    }
  }, []);

  const clearVehicleContext = useCallback(() => setVehicleContext(null), [setVehicleContext]);
  const value = useMemo(
    () => ({ vehicleContext, setVehicleContext, clearVehicleContext, hydrated }),
    [vehicleContext, setVehicleContext, clearVehicleContext, hydrated],
  );

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicleContext() {
  const value = useContext(VehicleContext);
  if (!value) throw new Error("useVehicleContext must be used inside VehicleContextProvider");
  return value;
}
