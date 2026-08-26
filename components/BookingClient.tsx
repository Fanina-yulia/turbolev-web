"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useVehicleContext } from "@/components/VehicleContextProvider";
import {
  browserAttributionFromLocation,
  type BrowserPublicLeadRequest,
} from "@/lib/public-lead";
import { vehicleDisplayLabel } from "@/lib/vehicle-identity";

type Props = { serviceLabel?: string | null; intent?: string | null; product?: string | null };
type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "accepted"; receiptRef: string }
  | { kind: "error"; message: string };

function formString(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function BookingClient({ serviceLabel, intent, product }: Props) {
  const { vehicleContext, hydrated } = useVehicleContext();
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const lastFingerprintRef = useRef<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState.kind === "sending" || submitState.kind === "accepted") return;

    const form = new FormData(event.currentTarget);
    const name = formString(form, "name");
    const phone = formString(form, "phone");
    const customerMessage = formString(form, "message");
    const vehicleLabel = vehicleDisplayLabel(vehicleContext) || undefined;
    const contextLines = [
      serviceLabel ? `Послуга: ${serviceLabel}` : null,
      intent === "install" ? "Намір: запчастина + встановлення" : null,
      product ? `Товар: ${product}` : null,
    ].filter((value): value is string => Boolean(value));
    const message = [customerMessage, ...contextLines].filter(Boolean).join("\n").slice(0, 2000);

    const body: BrowserPublicLeadRequest = {
      leadType: "BOOKING",
      contact: {
        ...(name ? { name } : {}),
        phone,
      },
      ...(message ? { message } : {}),
      ...(vehicleLabel ? { vehicle: { label: vehicleLabel } } : {}),
      context: { pagePath: window.location.pathname },
      attribution: browserAttributionFromLocation({
        href: window.location.href,
        referrer: document.referrer,
      }),
      privacy: { acknowledged: true },
    };

    const fingerprint = JSON.stringify(body);
    if (lastFingerprintRef.current !== fingerprint || !idempotencyKeyRef.current) {
      lastFingerprintRef.current = fingerprint;
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setSubmitState({ kind: "sending" });
    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKeyRef.current,
        },
        body: fingerprint,
      });
      const payload: unknown = await response.json().catch(() => null);
      const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;

      if (
        response.ok
        && data?.accepted === true
        && data?.status === "ACCEPTED"
        && typeof data?.receiptRef === "string"
      ) {
        setSubmitState({ kind: "accepted", receiptRef: data.receiptRef });
        return;
      }

      setSubmitState({
        kind: "error",
        message: response.status === 429
          ? "Забагато спроб. Спробуйте трохи пізніше."
          : "Заявка не була підтверджена CRM. Дані залишилися у формі — спробуйте надіслати ще раз.",
      });
    } catch {
      setSubmitState({
        kind: "error",
        message: "Немає підтвердження, що заявку прийнято. Перевірте з’єднання та спробуйте ще раз.",
      });
    }
  }

  return (
    <div className="booking-grid">
      <section className="booking-main">
        <span className="kicker">TURBO LEV · ONLINE ЗАЯВКА</span><h1>ЗАПИС НА СТО</h1>
        <p className="lead">Заявка потрапляє в CRM тільки після підтвердженого сервером durable-запису. Якщо CRM недоступна, сайт не показує, що звернення прийнято.</p>
        <div className="booking-context">
          <article><span>СТО</span><strong>Глеваха · Київська область · М-05</strong></article>
          <article><span>АВТО</span><strong>{hydrated && vehicleContext ? vehicleDisplayLabel(vehicleContext) : "Не вибране"}</strong>{vehicleContext ? <small>{vehicleContext.state} · {vehicleContext.maskedIdentifier}</small> : null}{!vehicleContext ? <Link href="/vin">ДОДАТИ АВТО →</Link> : <Link href="/account">ЗМІНИТИ →</Link>}</article>
          <article><span>ПОТРЕБА</span><strong>{serviceLabel ?? (intent === "install" ? "Запчастина + встановлення" : "Потрібне уточнення")}</strong>{product ? <small>Товар: {product}</small> : null}</article>
        </div>
        <form className="booking-form" onSubmit={submit}>
          <div className="booking-demo-banner"><b>CRM · DURABLE LEAD</b><span>Телефон і текст звернення передаються через сервер TURBO LEV у CRM. Маркетингова атрибуція не містить повного VIN або держномера.</span></div>
          <label>Ім’я<input name="name" autoComplete="name" placeholder="Як до вас звертатися" maxLength={120} /></label>
          <label>Телефон<input name="phone" inputMode="tel" autoComplete="tel" placeholder="+380 …" maxLength={40} required /></label>
          <label>Що потрібно<textarea name="message" rows={4} maxLength={1800} defaultValue={serviceLabel ? `Потрібна послуга: ${serviceLabel}` : intent === "install" ? "Потрібне встановлення придбаної запчастини" : ""} placeholder="Коротко опишіть проблему або роботу" /></label>
          <label className="booking-consent"><input type="checkbox" required/><span>Погоджуюсь, що TURBO LEV використає мій телефон і текст звернення для його обробки. <Link href="/privacy">Як обробляються дані</Link>.</span></label>
          <button className="button button-accent" type="submit" disabled={submitState.kind === "sending" || submitState.kind === "accepted"}>{submitState.kind === "sending" ? "НАДСИЛАЄМО…" : submitState.kind === "accepted" ? "ЗАЯВКУ ПРИЙНЯТО" : "НАДІСЛАТИ ЗАЯВКУ"}</button>
          {submitState.kind === "accepted" ? <div className="booking-not-sent" role="status"><b>ЗАЯВКУ ПРИЙНЯТО CRM</b><span>Номер підтвердження: {submitState.receiptRef}. Менеджер отримає звернення в CRM.</span></div> : null}
          {submitState.kind === "error" ? <div className="booking-not-sent" role="alert"><b>НЕ ВІДПРАВЛЕНО</b><span>{submitState.message}</span></div> : null}
        </form>
      </section>
      <aside className="booking-ai-summary"><span>TURBO LEV · CONTEXT</span><strong>ЩО ОТРИМАЄ МАЙСТЕР</strong><ul><li>Безпечний контекст вибраного авто</li><li>Послуга або намір на встановлення</li><li>Товар/артикул, якщо прийшли зі сторінки деталі</li><li>Текст звернення без вигаданого діагнозу</li><li>Джерело / landing / UTM без повного VIN або держномера</li></ul><Link href="/sto/hlevakha">ПРО СТО ГЛЕВАХА →</Link></aside>
    </div>
  );
}
