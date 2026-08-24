import Link from "next/link";

export function CatalogAiAssist({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "catalog-ai compact-ai" : "catalog-ai"}>
      <div><span>TURBO LEV AI</span><strong>Не знаєте назву деталі?</strong><p>Опишіть симптом або задачу звичайними словами — AI підкаже, що перевірити, і приведе до потрібної категорії.</p></div>
      <Link href="/#ai">ОПИСАТИ ПРОБЛЕМУ →</Link>
    </section>
  );
}
