import type { Metadata } from "next";
import Link from "next/link";
import { BookingClient } from "@/components/BookingClient";
import { getService } from "@/lib/services";
export const metadata: Metadata = { title: "Запис на СТО", robots: { index: false, follow: false } };
export default async function BookingPage({searchParams}:{searchParams:Promise<{service?:string;intent?:string;product?:string}>}){const query=await searchParams;const service=query.service?getService(query.service):null;return <div className="shell page section"><div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><Link href="/sto/hlevakha">СТО Глеваха</Link><span>›</span><span>Запис</span></div><BookingClient serviceLabel={service?.name ?? null} intent={query.intent ?? null} product={query.product ?? null}/></div>}
