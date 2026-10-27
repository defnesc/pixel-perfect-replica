import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { customDesigns } from "@/lib/catalog";
import { usePrices } from "@/lib/use-prices";
import { CustomEstimator } from "@/components/site/CustomEstimator";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import { ProductCard } from "@/components/site/ProductCard";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/$lang/custom")({
  head: ({ params }) => seo(params.lang as Lang, "custom", "/custom"),
  component: CustomPage,
});

function CustomPage() {
  const { lang } = Route.useParams() as { lang: Lang };
  const t = useT();
  useSuspenseQuery(sheetQuery);
  const { products, fmt, adjusted } = usePrices();
  const goDown = () => document.getElementById("designs")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-6">
      <BackButton />
      <section className="flex min-h-[60svh] flex-col items-center justify-center text-center">
        <h1 className="h1-xl">{t("custom2.title")}</h1>
        <p className="mt-4 max-w-[45ch] leading-normal text-helper">{t("custom2.intro")}</p>
        <CustomEstimator />
        <Button variant="ghost" type="button" onClick={goDown} className="tap mt-16 h-auto flex-col gap-1 label-xs">
          {t("custom2.or")}
          <span className="animate-bob text-lg" aria-hidden>↓</span>
        </Button>
      </section>

      <section id="designs" className="scroll-mt-24 pt-6">
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-[22px] md:grid-cols-3 lg:grid-cols-4">
          {customDesigns(products).map((p) => {
            const note = lang === "tr" ? p.price_note_tr : p.price_note;
            const priceText = t("card.approx", { price: fmt(adjusted(p.price)) }) + (note ? ` · ${note}` : "");
            return <ProductCard key={p.folder} p={p} priceText={priceText} />;
          })}
        </div>
      </section>
    </main>
  );
}
