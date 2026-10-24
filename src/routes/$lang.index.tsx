import { createFileRoute, Link } from "@tanstack/react-router";
import { useT, type Lang } from "@/i18n";
import { classics, formatTl } from "@/lib/catalog";
import { seo } from "@/lib/seo";
import { ProductCard } from "@/components/site/ProductCard";
import introAsset from "@/assets/hero-grillz.jpg.asset.json";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => seo(params.lang as Lang, "home"),
  component: Catalog,
});

function Catalog() {
  const { lang } = Route.useParams() as { lang: Lang };
  const t = useT();
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
          {t("cat.custom")} →
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-[22px] md:grid-cols-3 lg:grid-cols-4">
          {classics().map((p) => (
            <ProductCard key={p.folder} p={p} priceText={formatTl(p.price)} />
          ))}
        </div>
      </section>
    </main>
  );
}
