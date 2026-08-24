import Link from "next/link";
import { money, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-visual"><span>{product.brand}</span><strong>{product.article}</strong></div>
      <div className="product-body">
        <div className="eyebrow">{product.brand} · {product.article}</div>
        <h3><Link href={`/zapchastyny/${product.category}/${product.slug}`}>{product.name}</Link></h3>
        <p className="stock ok-dot">{product.availability}</p>
        <div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice ? <del>{money(product.oldPrice)}</del> : null}</div>
        <Link className="button button-dark" href={`/zapchastyny/${product.category}/${product.slug}`}>Переглянути</Link>
      </div>
    </article>
  );
}
