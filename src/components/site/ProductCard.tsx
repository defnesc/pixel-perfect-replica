import { Link } from "@tanstack/react-router";
import { useLang, useT } from "@/i18n";
import { photoUrl, type CatalogProduct } from "@/lib/catalog";

/** Catalog card: photo (hover swap), name, badge pill, price. */
export function ProductCard({ p, priceText }: { p: CatalogProduct; priceText: string }) {
  const lang = useLang();
  const t = useT();
  const name = lang === "tr" ? p.name_tr : p.name;
  const badge = lang === "tr" ? p.badge_tr : p.badge;
  const main = photoUrl(p.main_image);
  const hover = photoUrl(p.hover_image);
  return (
    <Link to="/$lang/product/$id" params={{ lang, id: p.folder }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-surface">
        {main ? (
          <img src={main} alt={name} loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center label-xs text-helper">333</div>
        )}
        {hover && <img src={hover} alt="" loading="lazy" width={1024} height={1280} className="card-swap absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
        {badge && <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-primary-foreground">{badge}</span>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-3.5 pb-3.5 pt-16 leading-snug">
          <div className="text-[15px] font-semibold normal-case tracking-normal">{name}</div>
          <div className="mt-1 font-mono text-[13px] uppercase tracking-[0.04em]">
            {p.compare_at_price && <span className="mr-2 text-helper line-through">{new Intl.NumberFormat("tr-TR").format(p.compare_at_price)} TL</span>}
            {priceText}
          </div>
        </div>
      </div>
    </Link>
  );
}
