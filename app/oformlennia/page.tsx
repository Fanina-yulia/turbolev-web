import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutClient } from "@/components/CheckoutClient";
export const metadata: Metadata = { title: "Оформлення замовлення", robots: { index: false, follow: false } };
export default function CheckoutPage(){return <div className="shell page section"><div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><Link href="/koszyk">Кошик</Link><span>›</span><span>Оформлення</span></div><CheckoutClient/></div>}
