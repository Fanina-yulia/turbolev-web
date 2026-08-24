"use client";

import { FormEvent, useMemo, useState } from "react";
import { detectVehicleIdentifier, type PublicVehicleContext } from "@/lib/vehicle-identity";
import { useVehicleContext } from "@/components/VehicleContextProvider";

type Props = {
  compact?: boolean;
  title?: string;
  purpose?: "SHOP" | "STO" | "GLOBAL";
};

export function VehicleIdentityResolver({ compact = false, title = "ЗНАЙДЕМО ВАШЕ АВТО", purpose = "GLOBAL" }: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PublicVehicleContext | null>(null);
  const { vehicleContext, setVehicleContext, clearVehicleContext } = useVehicleContext();
  const detected = useMemo(() => detectVehicleIdentifier(input), [input]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!detected) {
      setError("Введіть державний номер або VIN із 17 символів.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/vehicle/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ input }),
      });
      const payload = await response.json() as PublicVehicleContext & { message?: string };
      const safe: PublicVehicleContext = {
        state: payload.state ?? "ASSISTED",
        inputType: payload.inputType ?? detected.type,
        maskedIdentifier: payload.maskedIdentifier ?? detected.masked,
        confidence: Number(payload.confidence ?? 0),
        source: payload.source ?? "PUBLIC_BFF",
        vehicle: payload.vehicle ?? null,
        vinAvailable: Boolean(payload.vinAvailable),
        canonicalReferenceReady: Boolean(payload.canonicalReferenceReady),
        exactFitmentReady: Boolean(payload.exactFitmentReady),
        needsVin: Boolean(payload.needsVin),
        message: payload.message ?? "Авто потребує додаткової перевірки.",
        contextId: payload.contextId,
      };
      setLastResult(safe);
      setVehicleContext(safe);
      setInput("");
    } catch {
      setError("Сервіс визначення авто тимчасово недоступний. Можна продовжити через майстра TURBO LEV.");
    } finally {
      setBusy(false);
    }
  }

  const current = lastResult ?? vehicleContext;

  return (
    <section className={`vehicle-resolver ${compact ? "vehicle-resolver-compact" : ""}`} aria-label="Визначення автомобіля за номером або VIN">
      <div className="vehicle-resolver-head">
        <div><span className="vehicle-resolver-kicker">ОДНЕ АВТО · МАГАЗИН + СТО</span><h2>{title}</h2></div>
        {current && <button type="button" className="vehicle-change" onClick={() => { clearVehicleContext(); setLastResult(null); }}>ЗМІНИТИ АВТО</button>}
      </div>

      {!current ? (
        <form onSubmit={submit} className="vehicle-resolver-form">
          <label htmlFor={`vehicle-identity-${purpose}`}>Номер авто або VIN</label>
          <div className="vehicle-resolver-inputrow">
            <input
              id={`vehicle-identity-${purpose}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Напр. KA 7584 CI або 17 символів VIN"
              aria-describedby={`vehicle-hint-${purpose}`}
            />
            <button type="submit" disabled={busy}>{busy ? "ШУКАЄМО…" : "ЗНАЙТИ АВТО"}</button>
          </div>
          <div className="vehicle-resolver-meta" id={`vehicle-hint-${purpose}`}>
            <span>{detected ? `РОЗПІЗНАНО: ${detected.type === "VIN" ? "VIN" : "ДЕРЖНОМЕР"} · ${detected.masked}` : "СИСТЕМА САМА ВИЗНАЧИТЬ: НОМЕР ЧИ VIN"}</span>
            <span>Повний номер/VIN не зберігаємо у браузерному контексті.</span>
          </div>
          {error && <p className="vehicle-resolver-error" role="alert">{error}</p>}
        </form>
      ) : (
        <div className="vehicle-resolver-result">
          <div className={`vehicle-state vehicle-state-${current.state.toLowerCase()}`}>{current.state}</div>
          <div className="vehicle-result-main">
            <strong>{current.vehicle ? [current.vehicle.make, current.vehicle.model, current.vehicle.year].filter(Boolean).join(" · ") : "Авто потребує серверного визначення"}</strong>
            <span>{current.maskedIdentifier} · {current.inputType === "VIN" ? "VIN" : "держномер"}</span>
            <p>{current.message}</p>
          </div>
          <div className="vehicle-result-truth">
            <span><b>{current.exactFitmentReady ? "✓" : "—"}</b> Готовність exact fitment</span>
            <span><b>{current.vinAvailable ? "✓" : "—"}</b> VIN-контекст</span>
            <span><b>{current.confidence}%</b> confidence</span>
          </div>
        </div>
      )}

      <p className="vehicle-resolver-foot">
        {purpose === "SHOP"
          ? "Для магазину PARTIAL лише звужує каталог — «точно підходить» з’явиться тільки після authoritative fitment."
          : purpose === "STO"
            ? "Для СТО PARTIAL достатній, щоб передати авто разом із заявкою; конфігурацію можна уточнити до робіт."
            : "Один Vehicle Context використовується каталогом, TURBO LEV AI, кошиком і записом на СТО."}
      </p>
    </section>
  );
}
