import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ActiveVehicleChip } from "@/components/ActiveVehicleChip";

export function Header() {
  return (
    <>
      <div className="topline"><div className="shell topline-inner"><span>TURBO LEV · ЗАПЧАСТИНИ · СТО · AI-ПІДБІР</span><span>Україна · AI + майстер · встановлення на СТО</span></div></div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand tl-brand" aria-label="TURBO LEV — головна"><span className="tl-brand-badge">TL</span><span className="tl-wordmark"><b>TURBO</b><em>LEV</em><small>PARTS + SERVICE</small></span></Link>
          <form action="/zapchastyny" className="header-search tl-search"><input name="q" aria-label="Пошук за артикулом або назвою" placeholder="Пошук за артикулом або назвою..."/><button type="submit">⌕</button></form>
          <nav className="header-actions tl-header-actions" aria-label="Швидкі дії">
            <Link className="ai-header-link" href="/#ai">AI ПІДБІР</Link>
            <ActiveVehicleChip />
            <Link href="/account">МІЙ ГАРАЖ</Link>
            <Link href="/koszyk">КОШИК</Link>
            <ThemeToggle />
          </nav>
        </div>
        <nav className="main-nav tl-nav" aria-label="Основна навігація">
          <div className="shell nav-inner">
            <Link href="/zapchastyny">КАТАЛОГ</Link><Link href="/#ai">AI-ПІДБІР</Link><Link href="/vin">АВТО: НОМЕР / VIN</Link><Link href="/sto">НАШІ СТО</Link><Link href="/poslugy">ПОСЛУГИ</Link><Link href="/zapchastyny/halmivna-systema">ГАЛЬМА</Link><Link href="/zapchastyny/pidviska">ПІДВІСКА</Link><Link href="/zapchastyny/filtry-ta-masla">ФІЛЬТРИ</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
