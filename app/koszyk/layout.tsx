import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/koszyk" } };

export default function CartLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
