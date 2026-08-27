import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/oformlennia" } };

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
