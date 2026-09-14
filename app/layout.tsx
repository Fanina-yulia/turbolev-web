import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VehicleContextProvider } from "@/components/VehicleContextProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://turbolev-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "TURBO LEV — автозапчастини та СТО", template: "%s | TURBO LEV" },
  description: "AI-підбір автозапчастин, визначення авто за номером/VIN, fitment перевірка та встановлення на СТО TURBO LEV.",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: { title: "TURBO LEV", description: "Запчастини без лотереї: AI-підбір, vehicle/fitment перевірка та встановлення на СТО.", type: "website", locale: "uk_UA" },
};

const fontVariables = {
  "--font-inter": "Arial, Helvetica, sans-serif",
  "--font-oswald": '"Arial Black", Impact, Arial, sans-serif',
} as CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(() => { try { const saved = localStorage.getItem("turbolev-theme"); document.documentElement.dataset.theme = saved === "light" ? "light" : "dark"; } catch { document.documentElement.dataset.theme = "dark"; } })();`;
  return <html lang="uk" data-theme="dark" suppressHydrationWarning style={fontVariables}><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><VehicleContextProvider><Header/><main>{children}</main><Footer/></VehicleContextProvider></body></html>;
}
