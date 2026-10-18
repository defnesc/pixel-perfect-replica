import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { translate, useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { computePrice, formatTry, METALS, type MetalType } from "@/lib/pricing";
import { newOrderId, orderMessage, sendToCrm, track, waLink, type DeliveryOption, type ScanOption } from "@/lib/order";
import { Option, Question } from "@/components/site/Option";
import { TeethPicker } from "@/components/site/TeethPicker";
import { Faq } from "@/components/site/Faq";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/$lang/product/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(sheetQuery);
    const p = data.products.find((x) => x.product_id === params.id && x.active);
    if (!p) throw notFound();
    return { name_en: p.product_name_en, name_tr: p.product_name_tr };
  },
  head: ({ params, loaderData }) => {
    const lang = params.lang as Lang;
    const name = loaderData ? (lang === "tr" ? loaderData.name_tr : loaderData.name_en) : "Grillz";
    const title = `${name} — 333 Grillz ${lang === "tr" ? "İstanbul" : "Istanbul"}`;
    const description = translate(lang, "seo.product.desc", { name });
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "alternate", hrefLang: "en", href: `/en/product/${params.id}` },
        { rel: "alternate", hrefLang: "tr", href: `/tr/product/${params.id}` },
      ],
    };
  },
  component: ProductPage,
});

const QIDS = ["q-metal", "q-color", "q-teeth", "q-scan", "q-delivery", "q-payment", "q-confirm"] as const;

function ProductPage() {
  const { lang, id } = Route.useParams() as { lang: Lang; id: string };
  const t = useT();
  const { data } = useSuspenseQuery(sheetQuery);
  const product = data.products.find((p) => p.product_id === id)!;
  const rows = data.prices.filter((r) => r.product_id === id);
  const metals = METALS.filter((m) => rows.some((r) => r.metal_type === m));
  const fixed = product.teeth_count === "any" ? null : product.teeth_count;
  const name = lang === "tr" ? product.product_name_tr : product.product_name_en;

  const [metal, setMetal] = useState<MetalType | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [teeth, setTeeth] = useState<number[]>([]);
  const [scan, setScan] = useState<ScanOption | null>(null);
  const [delivery, setDelivery] = useState<DeliveryOption | null>(null);
  const [cash, setCash] = useState(false);
  const [age, setAge] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [flag, setFlag] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [img, setImg] = useState(0);

  const row = rows.find((r) => r.metal_type === metal) ?? rows.find((r) => r.metal_type === metals[0]);
  const price = computePrice(row, teeth.length || (fixed ?? 1), data.settings.usd_try);
  const priceText = price === null ? t("price.ask") : formatTry(price, lang, data.settings.currency_symbol);

  const teethOk = fixed ? teeth.length === fixed : teeth.length > 0;
  const answered = [!!metal, !!color, teethOk, !!scan, !!delivery, cash, age && kvkk];
  const ready = answered.every(Boolean);

  const create = () => {
    if (!ready) {
      const qid: string = QIDS[answered.findIndex((a) => !a)] ?? "q-metal";
      setFlag(qid);
      document.getElementById(qid)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => setFlag(null), 2000);
      return;
    }
    const oid = newOrderId();
    setOrderId(oid);
    track("create_order_click", { product: id, metal });
    sendToCrm({
      order_id: oid, source: "Website", language: lang.toUpperCase(), product: product.product_name_en,
      metal_type: metal, metal_color: color, teeth: [...teeth].sort((a, b) => a - b).join(", "),
      scan_option: scan, delivery_option: delivery, estimated_price: price ?? "", status: "1 – Order created on website",
    });
  };

  const sortedTeeth = useMemo(() => [...teeth].sort((a, b) => a - b), [teeth]);

  return (
    <main className="mx-auto max-w-6xl pb-28 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6">
      <div className="md:sticky md:top-16 md:self-start">
        <div className="flex snap-x snap-mandatory overflow-x-auto" onScroll={(e) => setImg(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {product.image_urls.map((src, i) => (
            <img key={i} src={src} alt={name} width={1024} height={1280} loading={i ? "lazy" : "eager"} className="aspect-[4/5] w-full shrink-0 snap-center object-cover" />
          ))}
        </div>
        {product.image_urls.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {product.image_urls.map((_, i) => <span key={i} className={`h-1.5 w-6 ${i === img ? "bg-primary" : "bg-foreground/20"}`} />)}
          </div>
        )}
      </div>

      <div className="px-4 md:px-0">
        <Link to="/$lang" params={{ lang }} className="tap inline-flex items-center helper">{t("product.back")}</Link>
        <h1 className="text-5xl">{name}</h1>
        <p className="helper mt-2">{lang === "tr" ? product.description_tr : product.description_en}</p>
        <p className="mt-4 text-xl font-semibold">{priceText}</p>
        <p className="helper mb-6">{t("product.estimated")}{row?.pricing_mode === "per_tooth" ? ` · ${t("product.perTooth")}` : ""}</p>

        <Question id="q-metal" title={t("q1.title")} highlight={flag === "q-metal"}>
          <div className="grid gap-2">
            {metals.map((m) => (
              <Option key={m} selected={metal === m} onSelect={() => setMetal(m)} label={t(`metal.${m}`)} note={m === "Silver" ? t("q1.silverNote") : undefined} />
            ))}
          </div>
        </Question>

        <Question id="q-color" title={t("q2.title")} highlight={flag === "q-color"}>
          <p className="helper mb-3">{t("q2.note")}</p>
          <div className="grid grid-cols-3 gap-2">
            {data.settings.metal_colors.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-pressed={color === c} className={`tap border px-2 label-xs ${color === c ? "border-primary text-primary" : "border-foreground/25"}`}>
                {t(`color.${c}`)}
              </button>
            ))}
          </div>
        </Question>

        <Question id="q-teeth" title={t("q3.title")} highlight={flag === "q-teeth"}>
          <p className="helper mb-3">{fixed ? t("q3.fixed", { n: fixed }) : t("q3.note")}</p>
          <TeethPicker value={teeth} onChange={setTeeth} max={fixed} />
        </Question>

        <Question id="q-scan" title={t("q4.title")} highlight={flag === "q-scan"}>
          <p className="text-sm">{t("q4.intro")}</p>
          <p className="helper mb-3">{t("q4.note")}</p>
          <p className="mb-3 text-sm font-semibold">{t("q4.ask")}</p>
          <div className="grid gap-2">
            <Option selected={scan === "istanbul"} onSelect={() => setScan("istanbul")} label={t("q4.istanbul")} />
            <Option selected={scan === "other"} onSelect={() => setScan("other")} label={t("q4.other")} />
            <Option selected={scan === "stl"} onSelect={() => setScan("stl")} label={t("q4.stl")} note={t("q4.stlNote")} />
          </div>
        </Question>

        <Question id="q-delivery" title={t("q5.title")} highlight={flag === "q-delivery"}>
          <p className="text-sm font-semibold">{t("q5.ask")}</p>
          <p className="helper mb-3">{t("q5.note")}</p>
          <div className="grid gap-2">
            <Option selected={delivery === "pickup"} onSelect={() => setDelivery("pickup")} label={t("q5.pickup")} />
            <Option selected={delivery === "ship"} onSelect={() => setDelivery("ship")} label={t("q5.ship")} note={t("q5.shipNote")} />
          </div>
          <p className="helper mt-4 border-l-2 border-primary pl-3">⏱ {t("q5.warning")}</p>
        </Question>

        <Question id="q-payment" title={t("q6.title")} highlight={flag === "q-payment"}>
          <p className="mb-3 text-sm font-semibold">{t("q6.ask")}</p>
          <Option selected={cash} onSelect={() => setCash(!cash)} label={t("q6.cash")} note={t("q6.note")} />
        </Question>

        <Question id="q-confirm" title="✓" highlight={flag === "q-confirm"}>
          <div className="grid gap-2">
            <Option type="check" selected={age} onSelect={() => setAge(!age)} label={t("confirm.age")} />
            <Option
              type="check"
              selected={kvkk}
              onSelect={() => setKvkk(!kvkk)}
              label={<>{t("confirm.kvkkPre")}<Link to={lang === "tr" ? "/$lang/gizlilik" : "/$lang/privacy"} params={{ lang }} target="_blank" onClick={(e) => e.stopPropagation()} className="underline">{t("confirm.kvkkLink")}</Link>{t("confirm.kvkkPost")}</>}
            />
          </div>
        </Question>

        <div className="mt-10"><Faq /></div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground bg-background p-3">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">{priceText}</div>
            <div className="helper">{t("product.estimated")}</div>
          </div>
          <button type="button" onClick={create} aria-disabled={!ready} className={`tap flex-1 px-4 font-display text-xl ${ready ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t("cta.create")}
          </button>
        </div>
        {flag && <p className="helper mt-1 text-center text-primary">{t("cta.missing")}</p>}
      </div>

      {orderId && metal && color && scan && delivery && (
        <OrderPanel
          lang={lang}
          onClose={() => setOrderId(null)}
          id={orderId}
          product={name}
          metal={t(`metal.${metal}`)}
          color={t(`color.${color}`)}
          teeth={sortedTeeth}
          scan={scan}
          delivery={delivery}
          price={priceText}
          email={data.settings.scan_email}
          wa={data.settings.whatsapp_number}
        />
      )}
    </main>
  );
}

function OrderPanel(p: { lang: Lang; onClose: () => void; id: string; product: string; metal: string; color: string; teeth: number[]; scan: ScanOption; delivery: DeliveryOption; price: string; email: string; wa: string }) {
  const t = (k: string) => translate(p.lang, k);
  const last = t(p.delivery === "pickup" ? "road.pickup" : "road.ship");
  const steps: { text: string; email?: boolean }[] =
    p.scan === "istanbul"
      ? [{ text: t("road.visit") }, { text: t("road.plan") }, { text: last }]
      : p.scan === "other"
        ? [{ text: t("road.callDentist") }, { text: t("road.getScan"), email: true }, { text: t("road.plan") }, { text: last }]
        : [{ text: t("road.emailStl"), email: true }, { text: t("road.plan") }, { text: last }];
  const msg = orderMessage(p.lang, { id: p.id, product: p.product, metal: p.metal, color: p.color, teeth: p.teeth, scan: p.scan, delivery: p.delivery, price: p.price });

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-xl px-4 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <span className="label-xs">#{p.id}</span>
          <button type="button" onClick={p.onClose} className="tap px-2 label-xs">{t("panel.close")} ×</button>
        </div>
        <h1 className="mt-4 text-5xl">{t("panel.title")}</h1>

        <h2 className="mt-8 border-b border-foreground pb-2 text-lg">{t("panel.summary")}</h2>
        <dl className="divide-y divide-foreground/15 text-sm">
          {[["panel.product", p.product], ["panel.metal", p.metal], ["panel.color", p.color], ["panel.teeth", p.teeth.join(", ")], ["panel.price", p.price]].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4 py-2"><dt className="helper">{t(k as string)}</dt><dd className="text-right font-medium">{v}</dd></div>
          ))}
        </dl>
        <p className="helper mt-2">{t("panel.priceNote")}</p>

        <h2 className="mt-8 border-b border-foreground pb-2 text-lg">{t("panel.roadmap")}</h2>
        <ol className="mt-4">
          {steps.map((s, i) => (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-foreground/30" />}
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${i === steps.length - 1 ? "border-success bg-success text-success-foreground" : "border-foreground"}`}>{i + 1}</span>
              <div className="pt-1 text-sm">
                {s.text}
                {s.email && <a href={`mailto:${p.email}?subject=${encodeURIComponent(`STL #${p.id}`)}`} className="tap mt-1 flex items-center text-primary underline">{t("panel.emailTo")} {p.email}</a>}
              </div>
            </li>
          ))}
        </ol>

        <a
          href={waLink(p.wa, msg)}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_send_click", { order_id: p.id })}
          className="tap mt-10 flex w-full items-center justify-center gap-3 bg-success px-4 py-3 font-display text-xl text-success-foreground"
        >
          <WhatsAppIcon /> {t("panel.send")}
        </a>
      </div>
    </div>
  );
}
