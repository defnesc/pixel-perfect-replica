import { useLang, useT } from "@/i18n";
import { classics, formatTl } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

const HAS_OPTIONS = ["stones", "stones_cherub", "bar", "bar_cutout"];

/** Classics list in CSV sort_order — deliberate, do not re-sort. */
export function ClassicsList() {
  const lang = useLang();
  const t = useT();
  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-10">
      <h1 className="h1-xl">{t("cat.classics")}</h1>
      <div className="mt-8 grid grid-cols-2 gap-x-2.5 gap-y-[22px] md:grid-cols-3 lg:grid-cols-4">
        {classics().map((p) => {
          const from = p.option_groups.some((g) => HAS_OPTIONS.includes(g));
          const price = t(from ? "card.from" : "card.from", { price: formatTl(p.price) });
          return <ProductCard key={p.folder} p={p} priceText={from ? price : formatTl(p.price)} />;
        })}
      </div>
    </main>
  );
}
