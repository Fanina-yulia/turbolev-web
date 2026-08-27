import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: "/account" } };

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
