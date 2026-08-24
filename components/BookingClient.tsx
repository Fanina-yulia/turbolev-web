"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

type Props = { serviceLabel?: string | null; intent?: string | null; product?: string | null };

export function BookingClient({ serviceLabel, intent, product }: Props) {
  const { vehicleContext, hydrated } = useVehicleContext();
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return (
    <div className="booking-grid">
      <section className="booking-main">
        <span className="kicker">TURBO LEV · AI HANDOFF</span><h1>ЗАПИС НА СТО</h1>
        <p className="lead">У production один durable lead отримає privacy-safe vehicle context, service intent, товар/артикул, landing attribution та AI summary — без VIN/держномера в маркетинговій аналітиці.</p>
        <div className="booking-context">
          <article><span>СТО</span><strong>Глеваха · Київська область · М-05</strong></article>
          <article><span>АВТО</span><strong>{hydrated && vehicleContext ? vehicleDisplayLabel(vehicleContext) : "Не вибране"}</strong>{vehicleContext ? <small>{vehicleContext.state} · {vehicleContext.maskedIdentifier}</small> : null}{!vehicleContext ? <Link href="/vin">ДОДАТИ АВТО →</Link> : <Link href="/account">ЗМІНИТИ →</Link>}</article>
          <article><span>ПОТРЕБА</span><strong>{serviceLabel ?? (intent === "install" ? "Запчастина + встановлення" : "Потрібне уточнення")}</strong>{product ? <small>Товар: {product}</small> : null}</article>
        </div>
        <form className="booking-form" onSubmit={submit}>
          <div className="booking-demo-banner"><b>FOUNDATION · ЗАЯВКА НЕ НАДСИЛАЄТЬСЯ</b><span>Форма перевіряє UX до появи API-LEAD-001. Жодні введені тут дані не записуються в CRM.</span></div>
          <label>Ім’я<input name="name" autoComplete="name" placeholder="Як до вас звертатися" /></label>
          <label>Телефон<input name="phone" inputMode="tel" autoComplete="tel" placeholder="+380 …" /></label>
          <label>Що потрібно<textarea name="message" rows={4} defaultValue={serviceLabel ? `Потрібна послуга: ${serviceLabel}` : intent === "install" ? "Потрібне встановлення придбаної запчастини" : ""} placeholder="Коротко опишіть проблему або роботу" /></label>
          <label className="booking-consent"><input type="checkbox" required/><span>Погоджуюсь, що після підключення production API контакт буде використано тільки для обробки мого звернення.</span></label>
          <button className="button button-accent" type="submit">ПЕРЕВІРИТИ UX HANDOFF</button>
          {sent ? <div className="booking-not-sent" role="status"><b>DEMO: НЕ ВІДПРАВЛЕНО</b><span>UI працює. Реальна відправка буде ввімкнена тільки після durable CRM Integration API, idempotency і consent logging.</span></div> : null}
        </form>
      </section>
      <aside className="booking-ai-summary"><span>TURBO LEV AI · SUMMARY</span><strong>ЩО ПОБАЧИТЬ МАЙСТЕР</strong><ul><li>Opaque vehicle context / VehicleReference, якщо вже підтверджений</li><li>Послуга або symptom intent</li><li>Товар/артикул, якщо прийшли з PDP</li><li>Коротке AI summary без вигаданого діагнозу</li><li>Джерело / landing / UTM без VIN або держномера</li></ul><Link href="/sto/hlevakha">ПРО СТО ГЛЕВАХА →</Link></aside>
    </div>
  );
}
