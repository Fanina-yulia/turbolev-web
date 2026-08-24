import type { Metadata } from "next";
import Link from "next/link";
import { GarageClient } from "@/components/GarageClient";
export const metadata: Metadata = { title: "Мій гараж", robots: { index: false, follow: false } };
export default function AccountPage(){return <div className="shell page section"><div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><span>Мій гараж</span></div><GarageClient/></div>}
