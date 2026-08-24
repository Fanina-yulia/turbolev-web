"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

const prompts = ["Стукає спереду справа", "Потрібні передні колодки", "Знайди турбіну по VIN"];

export function AiCommandSurface() {
  const { vehicleContext, hydrated } = useVehicleContext();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
  }

  return (
    <section id="ai" className="ai-command ai-command-bar" aria-label="TURBO LEV AI">
      <div className="ai-bar-copy">
        <span className="ai-badge">TURBO LEV AI</span>
        <h2>ЩО ПОТРІБНО ВАШОМУ АВТО?</h2>
        <div className="ai-vehicle-chip">{hydrated && vehicleContext ? <><span>{vehicleContext.state}</span><b>{vehicleDisplayLabel(vehicleContext)}</b><Link href="/account">ЗМІНИТИ</Link></> : <><span>АВТО НЕ ВИБРАНЕ</span><Link href="/vin">НОМЕР / VIN</Link></>}</div>
        <p>Опишіть проблему або деталь своїми словами. AI може оркеструвати перевірки, але сумісність, ціну та наявність підтверджують authoritative TURBO LEV tools.</p>
      </div>
      <form className="ai-inline-form" onSubmit={submit}>
        <div className="ai-inline-input"><span aria-hidden="true">AI</span><input value={query} onChange={(event) => { setQuery(event.target.value); setSubmitted(false); }} placeholder="Наприклад: на BMW F10 стукає спереду справа…" aria-label="Запит до TURBO LEV AI"/><button type="submit">ЗАПИТАТИ →</button></div>
        <div className="ai-prompts" aria-label="Приклади запитів">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => { setQuery(prompt); setSubmitted(false); }}>{prompt}</button>)}<Link href="/vin" className="ai-vin-link">ДОДАТИ АВТО</Link></div>
        {submitted ? <div className="ai-demo-result" role="status"><span>DEMO · PARTIAL</span><strong>{vehicleContext ? `Використаю ${vehicleDisplayLabel(vehicleContext)} як context, але не вигадаю fitment.` : "Спочатку уточню автомобіль, потім перевірю сумісні варіанти."}</strong><p>Foundation не виконує комерційні або діагностичні дії без production API.</p></div> : null}
      </form>
    </section>
  );
}
