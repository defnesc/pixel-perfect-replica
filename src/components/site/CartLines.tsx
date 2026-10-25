import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "./Stepper";
import { useLang, useT } from "@/i18n";
import { photoUrl, type OptionGroup } from "@/lib/catalog";
import { priceCart } from "@/lib/cart-pricing";
import { orderedCartItems } from "@/lib/cart-actions";
import { translate } from "@/i18n";
import type { CartLine } from "@/lib/cart-pricing";
export function cartLineName(item: CartLine, product: ReturnType<typeof priceCart>["lines"][number]["product"], lang: "en" | "tr") {
  return item.kind === "estimate" ? translate(lang, "estimator.lineTitle") : (lang === "tr" ? product?.name_tr : product?.name) ?? item.product;
}
export function lineDescription(
  item: { colour: string; options: Record<string, string>; estimate?: CartLine["estimate"] },
  groups: OptionGroup[],
  lang: "en" | "tr",
) {
  return [
    lang === "tr" ? (item.colour === "White" ? "Beyaz" : "Sarı") : item.colour,
    ...(item.estimate ? [item.estimate.style, item.estimate.stones, item.estimate.engraving].map((v) => translate(lang, `estimator.option.${v}`)) : []),
    ...Object.entries(item.options).flatMap(([id, name]) => {
      const o = groups.find((g) => g.group_id === id)?.options.find((o) => o.option === name);
      return o && !o.isDefault ? [lang === "tr" ? o.option_tr : o.option] : [];
    }),
  ].join(", ");
}
export function CartLines({
  priced,
  groups,
  fmt,
  quantity,
  remove,
}: {
  priced: ReturnType<typeof priceCart>;
  groups: OptionGroup[];
  fmt: (n: number) => string;
  quantity?: (id: string, n: number) => void;
  remove?: (id: string) => void;
}) {
  const lang = useLang();
  const t = useT();
  return (
    <div className="divide-y divide-border">
      {orderedCartItems(priced.lines.map((l) => l.item)).map((item) => {
        const l = priced.lines.find((l) => l.item === item);
        if (!l) return null;
        const p = l.product;
        const img = p ? photoUrl(p.main_image) : undefined;
        return (
          <article key={l.item.id} className={`flex gap-3 py-5 ${l.item.addonOf ? "ml-5 border-l-2 border-primary pl-3" : ""}`}>
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
              {img && <img src={img} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              {p ? (
                <Link
                  to="/$lang/product/$id"
                  params={{ lang, id: p.folder }}
                  className="font-semibold"
                >
                  {lang === "tr" ? p.name_tr : p.name}
                </Link>
              ) : l.item.kind === "estimate" ? (
                <p className="font-semibold">{t("estimator.lineTitle")}</p>
              ) : (
                <p className="text-destructive">{t("check.missing", { name: l.item.product })}</p>
              )}
              <p className="helper mt-1">{lineDescription(l.item, groups, lang)}</p>
              {l.item.addonOf && <span className="label-xs text-primary">{t("addon.label")}</span>}
              {(p?.per_tooth || l.item.kind === "estimate") && (
                <p className="helper">
                  {t(p?.placement === "gap" ? "cart.gaps" : "cart.teeth", { n: l.item.teeth })}
                </p>
              )}
              {(p?.section === "custom" || l.item.kind === "estimate") && (
                <span className="label-xs text-primary">{t("cart.estimate")}</span>
              )}
              {l.invalid && (p || l.item.kind === "estimate") && <p className="text-destructive">{t("check.invalidOptions")}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {quantity ? (
                  <Stepper
                    value={l.item.quantity}
                    onChange={(n) => quantity(l.item.id, n)}
                    max={10}
                    label={t("gift.qty")}
                  />
                ) : (
                  <span className="font-mono">{l.item.quantity}×</span>
                )}
                <div className="font-mono text-sm">
                  {l.savings > 0 && (
                    <span className="mr-2 text-helper line-through">{fmt(l.full)}</span>
                  )}
                  {fmt(l.total)}
                </div>
              </div>
            </div>
            {remove && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("cart.remove")}
                onClick={() => remove(l.item.id)}
              >
                <Trash2 />
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}
