import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { formatTry, lowestPrice } from "@/lib/pricing";
import { seo } from "@/lib/seo";
import introAsset from "@/assets/hero-grillz.jpg.asset.json";

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
        <div className="photo-fade absolute inset-x-0 top-[13.5%] bottom-[5.5%] overflow-hidden">
          <img src={introAsset.url} alt="" width={1536} height={1755} className="animate-intro absolute inset-0 h-full w-full object-cover opacity-90" />
        </div>
        <div className="blur-veil pointer-events-none absolute inset-0 scale-[1.05] overflow-hidden">
          <img src={introAsset.url} alt="" aria-hidden width={1536} height={1755} className="absolute inset-0 h-full w-full object-cover opacity-90 blur-[16px]" />
          <div className="veil-tint absolute inset-0" />
        </div>
        <div className="relative overflow-hidden px-4 text-center">
          <h1 className="text-[22vw] leading-[0.9] sm:text-[12rem]">333</h1>
          <p className="label-xs mt-2">{t("intro.tagline")}</p>
        </div>
        <button type="button" onClick={goDown} className="tap absolute bottom-8 flex flex-col items-center gap-1 label-xs">
          {t("intro.scroll")}
          <span className="animate-bob text-lg" aria-hidden>↓</span>
        </button>
      </section>

      <section id="catalog" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-6">
        <Link to="/$lang/custom" params={{ lang }} className="pill w-full !border-primary bg-primary text-primary-foreground">
          {t("catalog.customBtn")} →
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-[22px] md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const low = lowestPrice(data.prices.filter((r) => r.product_id === p.product_id), data.settings.usd_try);
            return (
              <Link key={p.product_id} to="/$lang/product/$id" params={{ lang, id: p.product_id }} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-surface">
                  <img src={p.image_urls[0]} alt={lang === "tr" ? p.product_name_tr : p.product_name_en} loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {p.image_urls[1] && <img src={p.image_urls[1]} alt="" loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-3.5 pb-3.5 pt-16 leading-snug">
                    <div className="text-[15px] font-semibold normal-case tracking-normal">{lang === "tr" ? p.product_name_tr : p.product_name_en}</div>
                    <div className="mt-1 font-mono text-[13px] uppercase tracking-[0.04em]">{low === null ? t("price.ask") : t("catalog.from", { price: formatTry(low, lang, data.settings.currency_symbol) })}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
