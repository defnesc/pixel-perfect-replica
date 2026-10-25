import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { customDesigns } from "@/lib/catalog";
import { usePrices } from "@/lib/use-prices";
import { track, waLink, newOrderId, sendToCrm } from "@/lib/order";
import { CustomEstimator } from "@/components/site/CustomEstimator";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/$lang/custom")({
  head: ({ params }) => seo(params.lang as Lang, "custom", "/custom"),
  component: CustomPage,
});

function CustomPage() {
  const { lang } = Route.useParams() as { lang: Lang };
  const t = useT();
  const { data } = useSuspenseQuery(sheetQuery);
  const { products, fmt, adjusted, factor, cur, rates } = usePrices();
  const goDown = () => document.getElementById("designs")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-6">
      <BackButton />
      <section className="flex min-h-[60svh] flex-col items-center justify-center text-center">
        <h1 className="h1-xl">{t("custom2.title")}</h1>
        <CustomEstimator />
        <p className="mt-4 max-w-[45ch] leading-normal text-helper">{t("custom2.intro")}</p>
        <a
          href={waLink(data.settings.whatsapp_number, t("msg.customStart"))}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            track("custom_quote_click", { source: "custom_page" });
            sendToCrm({ order_id: newOrderId(), source: "Custom quote", language: lang.toUpperCase(), currency: cur, price_factor: factor, usd_try: rates.usd_try, status: "Custom quote requested" });
          }}
          className="btn mt-8 bg-primary text-primary-foreground"
        >
          <WhatsAppIcon /> {t("custom2.start")}
        </a>
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
