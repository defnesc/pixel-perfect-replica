import { Link } from "@tanstack/react-router";
import { useLang, useT } from "@/i18n";
import { usePrices } from "@/lib/use-prices";
import { classics, customDesigns, photoUrl } from "@/lib/catalog";

/** Two large boxes — Classics and Custom. */
export function CatalogBoxes() {
  const lang = useLang();
  const t = useT();
  const { products, fmt, adjusted } = usePrices();
  const minimum = (section: "classics" | "custom") => {
    const rows = section === "classics" ? classics(products) : customDesigns(products);
    return rows.length ? fmt(adjusted(Math.min(...rows.map(p => p.price)))) : t("price.ask");
  };
  const boxes = [
    { to: lang === "tr" ? "/$lang/klasikler" : "/$lang/classics", img: photoUrl("star-01.jpg"), title: t("cat.classics"), text: t("cat.classicsFrom", { price: minimum("classics") }) },
    { to: "/$lang/custom", img: photoUrl("letter-01.jpg"), title: t("cat.custom"), text: t("cat.customFrom", { price: minimum("custom") }) },
  ] as const;
  return (
      <div className="grid gap-4 md:grid-cols-2">
        {boxes.map((b) => (
          <Link
            key={b.title}
            to={b.to}
            params={{ lang }}
            className="group relative block aspect-[4/3] overflow-hidden rounded-[32px] border border-primary/60 transition-colors duration-300 hover:border-primary"
          >
            {b.img ? (
              <img src={b.img} alt={b.title} loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-90" />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <h2 className="text-3xl">{b.title}</h2>
              <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.04em]">{b.text}</p>
            </div>
          </Link>
        ))}
      </div>
  );
}

/** Catalog landing page. */
export function CatalogLanding() {
  const t = useT();
  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-10">
      <h1 className="h1-xl">{t("catalog.title")}</h1>
      <div className="mt-8"><CatalogBoxes /></div>
    </main>
  );
}
