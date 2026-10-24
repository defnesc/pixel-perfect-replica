import { useLang, useT } from "@/i18n";
import { classics, formatTl } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { BackButton } from "./BackButton";

const HAS_OPTIONS = ["stones", "stones_cherub", "bar", "bar_cutout"];

/** Classics list in CSV sort_order — deliberate, do not re-sort. */
export function ClassicsList() {
  const lang = useLang();
  const t = useT();
  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-6">
      <BackButton />
      <h1 className="h1-xl mt-4">{t("cat.classics")}</h1>
            <div className="mt-8 grid grid-cols-2 gap-x-2.5 gap-y-[22px] md:grid-cols-3 lg:grid-cols-4">
        {classics().map((p) => {
          const from = p.option_groups.some((g) => HAS_OPTIONS.includes(g));
          const priceText = from ? t("card.from", { price: formatTl(p.price) }) : formatTl(p.price);
          return <ProductCard key={p.folder} p={p} priceText={priceText} />;
        })}
      </div>
    </main>
  );
}
