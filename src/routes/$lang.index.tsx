import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { formatTry, lowestPrice } from "@/lib/pricing";
import { seo } from "@/lib/seo";
import intro from "@/assets/intro.jpg";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => seo(params.lang as Lang, "home"),
  component: Catalog,
});

function Catalog() {
  const { lang } = Route.useParams() as { lang: Lang };
  const t = useT();
  const { data } = useSuspenseQuery(sheetQuery);
  const products = data.products.filter((p) => p.active).sort((a, b) => a.sort_order - b.sort_order);
  const goDown = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      <section className="relative flex h-[calc(100svh-45px)] flex-col items-center justify-center overflow-hidden">
        <img src={intro} alt="" width={1600} height={1008} className="animate-intro absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="relative overflow-hidden px-4 text-center">
          <h1 className="animate-intro text-[22vw] leading-none sm:text-[12rem]">333</h1>
          <p className="label-xs mt-2">{t("intro.tagline")}</p>
          <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-background/50" />
        </div>
        <button type="button" onClick={goDown} className="tap absolute bottom-8 flex flex-col items-center gap-1 label-xs">
          {t("intro.scroll")}
          <span className="animate-bob text-lg" aria-hidden>↓</span>
        </button>
        <button type="button" onClick={goDown} className="tap absolute right-4 top-4 helper underline">{t("intro.skip")}</button>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-12 px-4 pt-6">
        <Link to="/$lang/custom" params={{ lang }} className="tap flex w-full items-center justify-center border border-foreground px-4 py-3 text-center label-xs hover:border-primary hover:text-primary">
          {t("catalog.customBtn")}
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const low = lowestPrice(data.prices.filter((r) => r.product_id === p.product_id), data.settings.usd_try);
            return (
              <Link key={p.product_id} to="/$lang/product/$id" params={{ lang, id: p.product_id }} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img src={p.image_urls[0]} alt={lang === "tr" ? p.product_name_tr : p.product_name_en} loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-3 text-lg">{lang === "tr" ? p.product_name_tr : p.product_name_en}</h3>
                <p className="helper">{low === null ? t("price.ask") : t("catalog.from", { price: formatTry(low, lang, data.settings.currency_symbol) })}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
