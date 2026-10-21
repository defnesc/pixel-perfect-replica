import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { translate, useLang, useT } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { convertToTry, CURRENCY_SYMBOL, formatForMessage, formatPrice, useCurrency } from "@/lib/currency";
import { newOrderId, sendToCrm, track, waLink } from "@/lib/order";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import giftImg from "@/assets/gift-card.jpg";

/** Gift card amounts in TRY. */
export const GIFT_AMOUNTS = [5000, 8000, 10000, 12000, 15000];

export function GiftCardPage() {
  const lang = useLang();
  const t = useT();
  const cur = useCurrency();
  const { data } = useSuspenseQuery(sheetQuery);
  const rates = data.settings;
  const [choice, setChoice] = useState<string>(String(GIFT_AMOUNTS[0]));
  const [custom, setCustom] = useState("");
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState(false);

  const customNum = Number(custom.replace(",", "."));
  const unitTry = choice === "custom" ? (customNum > 0 ? convertToTry(customNum, cur, rates) : null) : Number(choice);
  const fmt = (n: number) => formatPrice(n, cur, lang, rates, data.settings.currency_symbol);

  const send = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!unitTry) { e.preventDefault(); setWarn(true); return; }
    const id = newOrderId();
    const tr = (k: string) => translate(lang, k);
    const msg = [
      `${tr("msg.order")} #${id}`,
      `${tr("msg.product")}: ${tr("gift.title")}`,
      `${tr("msg.amount")}: ${formatForMessage(unitTry, cur, lang, rates)}`,
      `${tr("msg.qty")}: ${qty}`,
      `${tr("msg.total")}: ${formatForMessage(unitTry * qty, cur, lang, rates)}`,
    ].join("\n");
    track("create_order_click", { product: "gift-card", value: unitTry * qty });
    sendToCrm({ order_id: id, source: "Gift card", language: lang.toUpperCase(), product: "Gift card", quantity: qty, currency: cur, estimated_price: unitTry * qty, status: "1 – Order created on website" });
    e.currentTarget.href = waLink(data.settings.whatsapp_number, msg);
  };

  return (
    <main className="mx-auto max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6">
      <div className="md:sticky md:top-20 md:self-start">
        <img src={giftImg} alt={t("gift.title")} width={1024} height={1280} className="aspect-[4/5] w-full object-cover md:rounded-[20px]" />
      </div>
      <div className="px-4 pt-6 md:px-0 md:pt-0">
        <p className="label-xs text-helper">333 GRILLZ</p>
        <h1 className="mt-2 text-[clamp(40px,8vw,64px)] leading-none">{t("gift.title")}</h1>
        <p className="mt-4 font-mono text-[15px] uppercase tracking-[0.04em]">{unitTry ? fmt(unitTry) : "—"}</p>

        <label className="mt-8 block">
          <span className="label-xs">{t("gift.amount")}</span>
          <select value={choice} onChange={(e) => { setChoice(e.target.value); setWarn(false); }} className="mt-2 h-[54px] w-full rounded-full border border-border bg-surface px-5 text-[15px]">
            {GIFT_AMOUNTS.map((a) => <option key={a} value={a}>{fmt(a)}</option>)}
            <option value="custom">{t("gift.custom")}</option>
          </select>
        </label>
        {choice === "custom" && (
          <label className="mt-4 block">
            <span className="label-xs">{t("gift.customLabel", { sym: CURRENCY_SYMBOL[cur] })}</span>
            <input inputMode="numeric" value={custom} onChange={(e) => { setCustom(e.target.value.replace(/[^\d.,]/g, "")); setWarn(false); }} className="mt-2 h-[54px] w-full rounded-full border border-border bg-surface px-5 text-[15px]" placeholder={CURRENCY_SYMBOL[cur]} />
          </label>
        )}

        <div className="mt-6">
          <span className="label-xs">{t("gift.qty")}</span>
          <div className="mt-2 inline-flex h-[54px] items-center rounded-full border border-border">
            <button type="button" className="h-full w-14 text-lg" aria-label={t("gift.dec")} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="w-10 text-center font-mono">{qty}</span>
            <button type="button" className="h-full w-14 text-lg" aria-label={t("gift.inc")} onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
          </div>
        </div>

        {qty > 1 && unitTry && <p className="mt-4 font-mono text-[13px] uppercase">{t("gift.total")}: {fmt(unitTry * qty)}</p>}

        <a href="#" target="_blank" rel="noreferrer" onClick={send} className="btn mt-8 w-full bg-primary text-primary-foreground">
          <WhatsAppIcon /> {t("cta.create")}
        </a>
        {warn && <p className="mt-3 text-sm text-destructive">{t("gift.needAmount")}</p>}

        <p className="mt-8 leading-normal text-helper">{t("gift.desc")}</p>
      </div>
    </main>
  );
}
