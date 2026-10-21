import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { METALS, toTry } from "@/lib/pricing";
import { formatPrice, useCurrency } from "@/lib/currency";
import { newOrderId, quoteMessage, sendToCrm, track, waLink } from "@/lib/order";
import { seo } from "@/lib/seo";
import { Option } from "@/components/site/Option";
import { Faq } from "@/components/site/Faq";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/$lang/custom")({
  head: ({ params }) => seo(params.lang as Lang, "custom", "/custom"),
  component: CustomPage,
});

function CustomPage() {
  const { lang } = Route.useParams() as { lang: Lang };
  const t = useT();
  const { data } = useSuspenseQuery(sheetQuery);
  const [material, setMaterial] = useState("");
  const [idea, setIdea] = useState("");
  const [age, setAge] = useState(false);
  const [warn, setWarn] = useState(false);
  const cur = useCurrency();
  const fmt = (n: number) => formatPrice(n, cur, lang, data.settings, data.settings.currency_symbol);
  const materialLabel = material === "unsure" ? t("custom.notSure") : material ? t(`metal.${material}`) : "";

  const send = (e: React.MouseEvent) => {
    if (!age) { e.preventDefault(); setWarn(true); return; }
    const id = newOrderId();
    track("custom_quote_click", { material });
    sendToCrm({ order_id: id, source: "Custom quote", language: lang.toUpperCase(), metal_type: material === "unsure" ? "Not sure" : material, design_details: idea, status: "1 – Order created on website" });
    (e.currentTarget as HTMLAnchorElement).href = waLink(data.settings.whatsapp_number, quoteMessage(lang, id, materialLabel, idea));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="h1-xl">{t("custom.title")}</h1>
      <p className="mt-4 max-w-[45ch] leading-normal text-helper">{t("custom.intro")}</p>

      <h2 className="mt-12 pb-2 text-2xl">{t("custom.base")}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {METALS.map((m) => {
          const r = data.customBase.find((x) => x.metal_type === m);
          const first = r ? toTry(r.first_tooth_price, r.currency, data.settings.usd_try) : null;
          const extra = r ? toTry(r.extra_tooth_price, r.currency, data.settings.usd_try) : null;
          const note = r ? (lang === "tr" ? r.note_tr : r.note_en) : "";
          let line = t("price.ask");
          if (first !== null) line = extra !== null && extra !== first ? t("custom.silverLine", { first: fmt(first), extra: fmt(extra) }) : t("custom.perTooth", { price: fmt(first) });
          return (
            <div key={m} className="rounded-[20px] bg-surface p-5">
              <h3 className="text-2xl">{t(`metal.${m}`)}</h3>
              <p className="mt-3 text-sm">{line}</p>
              {note && <p className="helper mt-2">{note}</p>}
            </div>
          );
        })}
      </div>
      <p className="helper mt-3">{t("custom.baseNote")}</p>

      <h2 className="mt-12 pb-2 text-2xl">{t("custom.how")}</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {["custom.step1", "custom.step2", "custom.step3"].map((k, i) => (
          <li key={k} className="flex gap-3 text-sm"><span className="font-display text-3xl text-primary">{i + 1}</span><span className="pt-2">{t(k)}</span></li>
        ))}
      </ol>

      <div className="mx-auto mt-12 max-w-xl">
        <h2 className="pb-2 text-2xl">{t("custom.form")}</h2>
        <p className="mt-4 text-sm font-semibold">{t("custom.material")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[...METALS, "unsure"].map((m) => (
            <button key={m} type="button" aria-pressed={material === m} onClick={() => setMaterial(material === m ? "" : m)} className={`pill ${material === m ? "!border-primary bg-primary text-primary-foreground" : ""}`}>
              {m === "unsure" ? t("custom.notSure") : t(`metal.${m}`)}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm font-semibold" htmlFor="idea">{t("custom.idea")}</label>
        <textarea id="idea" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={500} rows={4} placeholder={t("custom.placeholder")} className="mt-2 w-full rounded-[20px] border border-foreground/20 bg-surface p-4 text-base focus:border-primary focus:outline-none" />
        <div className={`mt-4 ${warn && !age ? "outline outline-2 outline-offset-2 outline-primary" : ""}`}>
          <Option type="check" selected={age} onSelect={() => { setAge(!age); setWarn(false); }} label={t("confirm.age")} />
        </div>
        <a href="#" onClick={send} target="_blank" rel="noreferrer" className={`btn mt-6 w-full ${age ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
          <WhatsAppIcon /> {t("custom.send")}
        </a>
        <p className="helper mt-2 text-center">{t("custom.photoNote")}</p>
      </div>

      <div className="mt-14"><Faq /></div>
    </main>
  );
}
