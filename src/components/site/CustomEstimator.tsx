import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useLang, useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { usePrices } from "@/lib/use-prices";
import { estimateCustom, photoUrl } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import type { CartLine } from "@/lib/cart-pricing";
import { formatForMessage } from "@/lib/currency";
import { newOrderId, sendToCrm, track, waLink } from "@/lib/order";
import { Question } from "./Option";
import { Stepper } from "./Stepper";
import { WhatsAppIcon } from "./WhatsAppIcon";

const examples: Record<string, string> = { Simple: "letter-01.jpg", Detailed: "abstract-flame-01.jpg", "Very detailed": "rose-01.jpg" };
export function CustomEstimator() {
  const t = useT(), lang = useLang(), cart = useCart();
  const { estimator, factor, fmt, cur, rates, settings } = usePrices();
  const [teeth, setTeeth] = useState(1);
  const [jaw, setJaw] = useState<"Upper" | "Lower" | "Both">("Upper");
  const [colour, setColour] = useState<"White" | "Yellow">("White");
  const [choices, setChoices] = useState({ style: "Simple", stones: "No stones", engraving: "No engraving" });
  const max = Math.min(8, estimator.find((r) => r.group === "limit" && r.option === "Max teeth online")?.price_add_tl ?? 8);
  const amount = estimateCustom(estimator, teeth, Object.values(choices), factor);
  const item: CartLine = { id: "custom-estimate", product: "custom-estimate", kind: "estimate", colour, quantity: 1, teeth, options: {}, estimate: { jaw, ...choices } };
  const message = t("estimator.message", { n: teeth, jaw: t(`estimator.jaw.${jaw}`), style: t(`estimator.option.${choices.style}`), stones: t(`estimator.option.${choices.stones}`), engraving: t(`estimator.option.${choices.engraving}`), colour: t(`color.${colour}`), price: amount === null ? t("price.ask") : formatForMessage(amount, cur, lang, rates) }) + (cur !== "TRY" && amount !== null ? `\n${t("price.approx")}` : "");
  const send = () => {
    sendToCrm({ order_id: newOrderId(), source: "Custom estimator", language: lang.toUpperCase(), items: [item], estimated_price: amount, custom_estimated_price: amount, currency: cur, price_factor: factor, usd_try: rates.usd_try, status: "Custom quote requested" });
    track("custom_quote_click", { source: "estimator" });
  };
  return (
    <div className="mx-auto mt-8 w-full max-w-2xl rounded-lg border border-border p-4 text-left md:p-6">
      <h2 className="text-2xl">{t("estimator.title")}</h2>
      <Question id="estimate-teeth" title={t("product.howManyTeeth")}>
        <Stepper value={teeth} onChange={setTeeth} max={max} label={t("product.howManyTeeth")} />
        <div role="group" aria-label={t("estimator.jaw")} className="mt-4 grid grid-cols-3 gap-2">
          {(["Upper", "Lower", "Both"] as const).map((v) => <Button key={v} variant="outline" aria-pressed={jaw === v} onClick={() => setJaw(v)} className={jaw === v ? "border-primary bg-primary text-primary-foreground" : ""}>{t(`estimator.jaw.${v}`)}</Button>)}
        </div>
        <a className="helper mt-3 block underline" href={waLink(settings.whatsapp_number, t("estimator.moreMessage", { n: max }))} target="_blank" rel="noreferrer" onClick={send}>{t("estimator.more", { n: max })}</a>
      </Question>
      {(["style", "stones", "engraving"] as const).map((group) => <Question key={group} id={`estimate-${group}`} title={t(`estimator.${group}`)}>
        <div role="group" aria-label={t(`estimator.${group}`)} className={`grid gap-2 ${group === "style" ? "grid-cols-3" : "grid-cols-2"}`}>
          {estimator.filter((r) => r.group === group).map((row) => {
            const src = group === "style" ? photoUrl(examples[row.option] ?? "") : undefined;
            return <Button key={row.option} variant="outline" aria-pressed={choices[group] === row.option} onClick={() => setChoices((v) => ({ ...v, [group]: row.option }))} className={`h-auto min-h-12 flex-col overflow-hidden whitespace-normal p-2 ${choices[group] === row.option ? "border-primary bg-primary/10" : ""}`}>
              {src && <img src={src} alt="" className="aspect-square w-full rounded object-cover" />}
              <span>{lang === "tr" ? row.option_tr : t(`estimator.option.${row.option}`)}</span>
              {row.price_add_tl < 0 && <span className="text-xs text-helper">{t("price.ask")}</span>}
            </Button>;
          })}
        </div>
        {group === "stones" && <p className="helper mt-3">{t("product.stonesNote")}</p>}
      </Question>)}
      <Question id="estimate-colour" title={t("product.colour")}>
        <div className="grid grid-cols-2 gap-2">{(["White", "Yellow"] as const).map((c) => <Button key={c} variant="outline" aria-pressed={colour === c} onClick={() => setColour(c)} className={colour === c ? "border-primary bg-primary text-primary-foreground" : ""}>{t(`color.${c}`)}</Button>)}</div>
        <p className="helper mt-3">{t("product.colourNote")}</p>
      </Question>
      <div className="border-t border-border pt-5">
        <p role="status" className="font-mono text-xl">{amount === null ? t("price.ask") : t("cat.customFrom", { price: fmt(amount) })}</p>
        <p className="helper mt-3">{t("estimator.note")}</p>
        {cur !== "TRY" && amount !== null && <p className="helper mt-2">{t("price.approx")}</p>}
        <Button asChild className="mt-5 h-auto min-h-12 w-full whitespace-normal bg-success py-3 text-success-foreground hover:bg-success/90"><a href={waLink(settings.whatsapp_number, message)} target="_blank" rel="noreferrer" onClick={send}><WhatsAppIcon />{t("estimator.send")}</a></Button>
        <Button variant="outline" disabled={amount === null} className="mt-3 h-auto min-h-12 w-full whitespace-normal py-3" onClick={() => { cart.add(item); toast.success(t("cart.added")); }}><ShoppingBag />{t("estimator.add")}</Button>
      </div>
    </div>
  );
}