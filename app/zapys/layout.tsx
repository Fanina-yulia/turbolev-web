import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/zapys" } };

export default function BookingLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
