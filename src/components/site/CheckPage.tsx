import { CircleCheck, TriangleAlert } from "lucide-react";
import { useLang, useT } from "@/i18n";
import { usePrices } from "@/lib/use-prices";
import { decodeOrder, priceCart, raisedSinceOrder } from "@/lib/cart-pricing";
import { CartLines } from "./CartLines";
export function CheckPage({ encoded }: { encoded: string }) {
  const t = useT(),
    lang = useLang();
  const { products, optionGroups, fmt, cur, factor, estimator } = usePrices();
  const order = decodeOrder(encoded);
  if (!order)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl">{t("check.title")}</h1>
        <p role="alert" className="mt-8 text-destructive">
          {t("check.invalid")}
        </p>
      </main>
    );
  const priced = priceCart(order.items, products, optionGroups, order.factor, estimator);
  const correct =
    !priced.invalid && priced.total === order.total && priced.estimated === order.estimated;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">{t("check.title")}</h1>
      <p className="mt-4 font-mono">#{order.id}</p>
      <time className="helper" dateTime={order.date}>
        {new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(order.date))}
      </time>
      <div className={`mt-3 text-sm ${raisedSinceOrder(order.date, order.factor, factor) ? "text-destructive" : "text-helper"}`}>
        <p>{t("check.level", { saved: order.factor.toFixed(2), today: factor.toFixed(2) })}</p>
        {raisedSinceOrder(order.date, order.factor, factor) && <p className="mt-1">{t("check.raised")}</p>}
      </div>
      <div
        role="status"
        className={`my-8 flex items-start gap-3 border-l-4 p-4 ${correct ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive"}`}
      >
        {correct ? <CircleCheck className="shrink-0" /> : <TriangleAlert className="shrink-0" />}
        <p className="font-semibold">
          {correct ? t("check.correct") : t("check.mismatch", { x: fmt(priced.total) })}
          {!correct && priced.estimated > 0 && (
            <span className="mt-2 block">
              {t("cart.estimated")}: {fmt(priced.estimated)}
            </span>
          )}
        </p>
      </div>
      <CartLines priced={priced} groups={optionGroups} fmt={fmt} />
      <div className="border-y border-border py-5">
        <p className="flex justify-between font-mono">
          <span>{t("product.total")}</span>
          <span>{fmt(priced.total)}</span>
        </p>
        {priced.estimated > 0 && (
          <p className="mt-3 flex justify-between font-mono text-primary">
            <span>{t("cart.estimated")}</span>
            <span>{fmt(priced.estimated)}</span>
          </p>
        )}
        {priced.savings > 0 && (
          <p className="mt-3 text-success">{t("product.save", { x: fmt(priced.savings) })}</p>
        )}
        {cur !== "TRY" && <p className="helper mt-3">{t("price.approx")}</p>}
      </div>
      <dl className="mt-8 space-y-4">
        {(["scan", "delivery"] as const).map((k) => (
          <div key={k}>
            <dt className="label-xs">{t(`order.${k}`)}</dt>
            <dd className="mt-1">{t(`order.${k}.${order.answers[k]}`)}</dd>
          </div>
        ))}
        <div>
          <dt className="label-xs">{t("order.payment")}</dt>
          <dd className="mt-1">{t("order.cashAdvance")}</dd>
        </div>
      </dl>
    </main>
  );
}
