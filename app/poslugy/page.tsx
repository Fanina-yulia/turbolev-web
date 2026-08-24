import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { VehicleContextBar } from "@/components/VehicleContextBar";
import { VehicleIdentityResolver } from "@/components/VehicleIdentityResolver";
export const metadata: Metadata = { title: "Послуги автосервісу", description: "Діагностика, ремонт і встановлення запчастин на СТО TURBO LEV." };
export default function ServicesPage(){return <div className="shell page section service-index"><div className="breadcrumbs"><Link href="/">Головна</Link><span>›</span><span>Послуги</span></div><div className="service-index-head"><div><span className="kicker">TURBO LEV · СТО</span><h1>ПОСЛУГИ АВТОСЕРВІСУ</h1><p className="lead">Vehicle-first сервісний маршрут: авто → симптом/послуга → діагностика → деталь → робота.</p></div><Link className="button button-accent" href="/#ai">ОПИСАТИ ПРОБЛЕМУ AI</Link></div><VehicleContextBar/><VehicleIdentityResolver compact title="ДОДАТИ АВТО ДО СЕРВІСНОГО КОНТЕКСТУ" purpose="STO"/><div className="services-grid service-cards">{services.map((service,i)=><Link href={`/poslugy/${service.slug}`} key={service.slug} className="service-card"><b>{String(i+1).padStart(2,"0")}</b><span>{service.icon}</span><h2>{service.name}</h2><p>{service.short}</p><strong>ДЕТАЛЬНІШЕ →</strong></Link>)}</div></div>}
