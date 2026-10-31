import { useState } from "react";
import { useT, useLang } from "@/i18n";
import { usePrices } from "@/lib/use-prices";
import { convertToTry, CURRENCY_SYMBOL, formatForMessage } from "@/lib/currency";
import { newOrderId, sendToCrm, track, waLink } from "@/lib/order";
import { GIFT_AMOUNTS, GIFT_UNPRICED, giftTotals, giftPurchaseDate, type GiftDelivery } from "@/lib/gift-card";
import { formatTl } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Option } from "./Option";
import { Stepper } from "./Stepper";
import { WhatsAppIcon } from "./WhatsAppIcon";
import giftImg from "@/assets/gift-card.jpg";
export { GIFT_AMOUNTS } from "@/lib/gift-card";

export function GiftCardPage() {
  const lang = useLang(), t = useT();
  const { cur, rates, fmt, settings } = usePrices();
  const [choice, setChoice] = useState("design");
  const [custom, setCustom] = useState("");
  const [qty, setQty] = useState(1);
  const [delivery, setDelivery] = useState<GiftDelivery>("digital");
  const [warn, setWarn] = useState(false);
  const unpriced = GIFT_UNPRICED.some(value => value === choice);
  const customNum = Number(custom.replace(",", "."));
  const unitTry = unpriced ? null : choice === "custom" ? (Number.isFinite(customNum) && customNum > 0 ? convertToTry(customNum, cur, rates) : null) : Number(choice);
  const { shipping, total } = giftTotals(unitTry, qty, delivery, settings);
  const shippingText = (value: number) => value === 0 ? t("gift.freeShipping") : t("gift.shippingFee", { price: fmt(value) });
  const printedFee = giftTotals(unitTry, qty, "printed", settings).shipping;
  const totalText = total === null ? t("gift.decided") : fmt(total);

  const send = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!unpriced && (!unitTry || !Number.isFinite(unitTry))) { event.preventDefault(); setWarn(true); return; }
    const id = newOrderId(), date = new Date();
    const piece = choice === "one_tooth" || choice === "star" ? t(`gift.piece.${choice}`) : undefined;
    const amountText = unpriced ? piece ? t("gift.msg.piece", { piece }) : t("gift.msg.design") : formatForMessage(unitTry ?? 0, cur, lang, rates);
    const msg = [
      `${t("msg.order")} #${id}`,
      `${t("msg.product")}: ${t("gift.title")}`,
      `${t("gift.date")}: ${giftPurchaseDate(date)}`,
      `${t("msg.amount")}: ${amountText}`,
      `${t("msg.qty")}: ${qty}`,
      `${t("order.delivery")}: ${delivery === "digital" ? t("gift.msg.digital") : t("gift.msg.printed", { shipping: shippingText(shipping) })}`,
      `${t("msg.total")}: ${total === null ? t("gift.decided") + (shipping ? ` (+${formatTl(shipping)} ${t("gift.shipping")})` : "") : formatForMessage(total, cur, lang, rates)}`,
      ...(cur !== "TRY" && total !== null ? [t("price.approx")] : []),
    ].join("\n");
    track("create_order_click", { product: "gift-card", value: total ?? 0 });
    sendToCrm({ order_id: id, source: "Gift card", language: lang.toUpperCase(), product: "Gift card", quantity: qty, currency: cur, estimated_price: total ?? 0, amount_type: unpriced ? "to_be_decided" : choice === "custom" ? "custom" : "fixed", ...(piece ? { piece } : {}), delivery, shipping_tl: shipping, status: "1 – Order created on website" });
    event.currentTarget.href = waLink(settings.whatsapp_number, msg);
  };

  return (
    <main className="mx-auto max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6">
      <div className="md:sticky md:top-20 md:self-start">
        <img src={giftImg} alt={t("gift.title")} width={1024} height={1280} className="aspect-[4/5] w-full object-cover md:rounded-[20px]" />
      </div>
      <div className="min-w-0 px-4 pt-6 md:px-0 md:pt-0">
        <p className="label-xs text-helper">333 GRILLZ</p>
        <h1 className="mt-2 text-4xl leading-none md:text-6xl">{t("gift.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-helper">{t("gift.intro")}</p>
        {!unpriced && unitTry !== null && <p className="mt-4 font-mono text-[15px]">{fmt(unitTry)}</p>}
        <fieldset className="mt-8 min-w-0">
          <legend className="label-xs">{t("gift.amount")}</legend>
          <div role="radiogroup" aria-label={t("gift.amount")} className="mt-2 space-y-2">
            {GIFT_UNPRICED.map(value => <Option key={value} selected={choice === value} onSelect={() => { setChoice(value); setWarn(false); }} label={t(`gift.${value}`)} />)}
          </div>
          <label className="mt-4 block">
            <span className="sr-only">{t("gift.customLabel", { sym: CURRENCY_SYMBOL[cur] })}</span>
            <select aria-label={t("gift.amount")} value={unpriced ? "" : choice} onChange={event => { if (event.target.value) setChoice(event.target.value); setWarn(false); }} className="mt-2 h-[54px] w-full rounded-full border border-border bg-surface px-5 text-[15px]">
              <option value="" disabled>{t("gift.amount")}</option>
              {GIFT_AMOUNTS.map(amount => <option key={amount} value={amount}>{fmt(amount)}</option>)}
              <option value="custom">{t("gift.custom")}</option>
            </select>
          </label>
        </fieldset>
        {choice === "custom" && <label className="mt-4 block"><span className="label-xs">{t("gift.customLabel", { sym: CURRENCY_SYMBOL[cur] })}</span><input aria-label={t("gift.customLabel", { sym: CURRENCY_SYMBOL[cur] })} inputMode="decimal" value={custom} onChange={event => { setCustom(event.target.value.replace(/[^\d.,]/g, "")); setWarn(false); }} className="mt-2 h-[54px] w-full rounded-full border border-border bg-surface px-5 text-[15px]" placeholder={CURRENCY_SYMBOL[cur]} /></label>}
        <p className="helper mt-4">{t("gift.validity")}</p>
        <div className="mt-6"><p className="label-xs mb-2">{t("gift.qty")}</p><Stepper value={qty} onChange={setQty} max={20} label={t("gift.qty")} /></div>
        <fieldset className="mt-6 min-w-0">
          <legend className="label-xs">{t("gift.delivery")}</legend>
          <div role="radiogroup" aria-label={t("gift.delivery")} className="mt-3 space-y-2">
            <Option selected={delivery === "digital"} onSelect={() => setDelivery("digital")} label={t("gift.digital")} />
            <Option selected={delivery === "printed"} onSelect={() => setDelivery("printed")} label={t("gift.printed", { shipping: shippingText(printedFee) })} note={t("gift.addressNote")} />
          </div>
        </fieldset>
        <div className="mt-6 border-y border-border py-4">
          <div className="flex justify-between gap-3 text-sm"><span>{t("gift.shipping")}</span><span>{shipping === 0 ? t("gift.freeShipping") : fmt(shipping)}</span></div>
          <div className="mt-3 flex flex-wrap justify-between gap-3 font-mono"><span>{t("gift.total")}</span><span role="status">{totalText}</span></div>
        </div>
        {cur !== "TRY" && total !== null && <p className="helper mt-2">{t("price.approx")}</p>}
        <Button asChild className="mt-8 h-auto min-h-12 w-full rounded-full py-3"><a href="#" target="_blank" rel="noreferrer" onClick={send}><WhatsAppIcon />{t("cta.create")}</a></Button>
        {warn && <p role="alert" className="mt-3 text-sm text-destructive">{t("gift.needAmount")}</p>}
        <p className="mt-8 leading-normal text-helper">{t("gift.desc")}</p>
      </div>
    </main>
  );
}
