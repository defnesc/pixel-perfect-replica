import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { translate, useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { ADDONS, findProduct, formatTl, groupOf, orderTotals, photoUrl, piecePrice, productPhotos, type CatalogProduct } from "@/lib/catalog";
import { formatForMessage, formatPrice, useCurrency } from "@/lib/currency";
import { newOrderId, sendToCrm, track, waLink } from "@/lib/order";
import { Option, Question } from "@/components/site/Option";
import { Faq } from "@/components/site/Faq";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/$lang/product/$id")({
  loader: ({ params }) => {
    const p = findProduct(params.id);
    if (!p) throw notFound();
    return { name_en: p.name, name_tr: p.name_tr };
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

function ProductPage() {
  const { lang, id } = Route.useParams() as { lang: Lang; id: string };
  const product = findProduct(id);
  if (!product) throw notFound();
  return product.section === "custom" ? <CustomProduct lang={lang} product={product} /> : <ClassicsProduct lang={lang} product={product} />;
}

function useFmt(lang: Lang) {
  const { data } = useSuspenseQuery(sheetQuery);
  const cur = useCurrency();
  const fmt = (n: number) => (cur === "TRY" ? formatTl(n) : formatPrice(n, cur, lang, data.settings, data.settings.currency_symbol));
  return { fmt, cur, settings: data.settings };
}

function Gallery({ product, name }: { product: CatalogProduct; name: string }) {
  const photos = productPhotos(product);
  const [img, setImg] = useState(0);
  return (
    <div className="md:sticky md:top-24 md:self-start">
      <div className="flex snap-x snap-mandatory overflow-x-auto" onScroll={(e) => setImg(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {(photos.length ? photos : [undefined]).map((src, i) =>
          src ? (
            <img key={i} src={src} alt={name} width={1024} height={1280} loading={i ? "lazy" : "eager"} className="aspect-[4/5] w-full shrink-0 snap-center object-cover md:rounded-[20px]" />
          ) : (
            <div key={i} className="flex aspect-[4/5] w-full shrink-0 snap-center items-center justify-center bg-surface label-xs text-helper md:rounded-[20px]">333</div>
          ),
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {photos.map((_, i) => <span key={i} className={`h-1.5 w-6 rounded-full ${i === img ? "bg-primary" : "bg-foreground/20"}`} />)}
        </div>
      )}
    </div>
  );
}

function ClassicsProduct({ lang, product }: { lang: Lang; product: CatalogProduct }) {
  const t = useT();
  const { fmt, cur, settings } = useFmt(lang);
  const name = lang === "tr" ? product.name_tr : product.name;
  const badge = lang === "tr" ? product.badge_tr : product.badge;

  const colour = groupOf(product, "colour")!;
  const bar = groupOf(product, "bar") ?? groupOf(product, "bar_cutout");
  const stones = groupOf(product, "stones") ?? groupOf(product, "stones_cherub");

  const [colourIdx, setColourIdx] = useState(0);
  const [barIdx, setBarIdx] = useState(0);
  const [stonesIdx, setStonesIdx] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const optLabel = (g: NonNullable<typeof bar>, i: number) => (lang === "tr" ? g.options[i]!.option_tr : g.options[i]!.option);
  const colourName = optLabel(colour, colourIdx);
  const adds = [bar?.options[barIdx]?.price_add_tl ?? 0, stones?.options[stonesIdx]?.price_add_tl ?? 0];
  const piece = piecePrice(product, adds);
  const addons = ADDONS.filter((a) => picked.has(a.addon_id));
  const { total, savings } = orderTotals(piece, addons);

  const toggleAddon = (aid: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(aid)) n.delete(aid);
      else n.add(aid);
      return n;
    });

  const orderHref = () => {
    const parts = [`${name} (${[colourName, bar && barIdx > 0 ? optLabel(bar, barIdx) : "", stones && stonesIdx > 0 ? optLabel(stones, stonesIdx) : ""].filter(Boolean).join(", ")})`];
    for (const a of addons) parts.push(`${lang === "tr" ? a.name_tr : a.name} (${t("msg.addonOff")})`);
    return waLink(settings.whatsapp_number, `${t("msg.order")} ${parts.join(" + ")}. ${t("msg.total")}: ${formatForMessage(total, cur, lang, settings)}`);
  };

  const onOrder = () => {
    const oid = newOrderId();
    track("create_order_click", { product: product.folder });
    sendToCrm({
      order_id: oid, source: "Website", language: lang.toUpperCase(), product: product.name,
      colour: colourName, bar: bar ? optLabel(bar, barIdx) : "", stones: stones ? optLabel(stones, stonesIdx) : "",
      addons: addons.map((a) => a.name).join(", "), estimated_price: total, currency: cur, status: "1 – Order created on website",
    });
  };

  return (
    <main className="mx-auto max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6">
      <Gallery product={product} name={name} />

      <div className="px-4 md:px-0">
        <Link to={lang === "tr" ? "/$lang/klasikler" : "/$lang/classics"} params={{ lang }} className="tap inline-flex items-center label-xs text-subtle">{t("product.back")}</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="h1-xl">{name}</h1>
          {badge && <span className="rounded-full bg-primary px-3 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-primary-foreground">{badge}</span>}
        </div>
        <p className="mt-4 font-mono text-[15px] uppercase tracking-[0.04em]">
          {product.compare_at_price && <span className="mr-2 text-helper line-through">{fmt(product.compare_at_price)}</span>}
          {fmt(piece)}
        </p>
        <p className="helper mt-1">{t("product.material")}</p>

        <Question id="q-colour" title={t("product.colour")}>
          <div className="grid grid-cols-2 gap-2">
            {colour.options.map((o, i) => (
              <button key={o.option} type="button" onClick={() => setColourIdx(i)} aria-pressed={colourIdx === i} className={`pill ${colourIdx === i ? "!border-primary bg-primary text-primary-foreground" : ""}`}>
                {lang === "tr" ? o.option_tr : o.option}
              </button>
            ))}
          </div>
          <p className="helper mt-3">{t("product.colourNote")}</p>
        </Question>

        {bar && (
          <Question id="q-bar" title={lang === "tr" ? bar.label_tr : bar.label}>
            <div className="grid gap-2">
              {bar.options.map((o, i) => (
                <Option key={o.option} selected={barIdx === i} onSelect={() => setBarIdx(i)} label={lang === "tr" ? o.option_tr : o.option} note={o.price_add_tl > 0 ? `+${fmt(o.price_add_tl)}` : undefined} />
              ))}
            </div>
          </Question>
        )}

        {stones && (
          <Question id="q-stones" title={lang === "tr" ? stones.label_tr : stones.label}>
            <div className="grid gap-2">
              {stones.options.map((o, i) => (
                <Option key={o.option} selected={stonesIdx === i} onSelect={() => setStonesIdx(i)} label={lang === "tr" ? o.option_tr : o.option} note={o.price_add_tl > 0 ? `+${fmt(o.price_add_tl)}` : undefined} />
              ))}
            </div>
            <p className="helper mt-3">{t("product.stonesNote")}</p>
          </Question>
        )}

        <Question id="q-addons" title={t("addon.title")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ADDONS.map((a) => {
              const on = picked.has(a.addon_id);
              const img = photoUrl(`${a.photo_folder}-01.jpg`);
              return (
                <button key={a.addon_id} type="button" onClick={() => toggleAddon(a.addon_id)} aria-pressed={on} className={`tap overflow-hidden rounded-[20px] border text-left ${on ? "border-primary" : "border-foreground/20"}`}>
                  {img ? <img src={img} alt="" loading="lazy" width={512} height={512} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square w-full items-center justify-center bg-surface label-xs text-helper">333</div>}
                  <span className="block p-3">
                    <span className="block text-[13px] font-semibold leading-snug">{lang === "tr" ? a.name_tr : a.name}</span>
                    <span className="mt-1 block font-mono text-[12px] uppercase tracking-[0.04em]">
                      <span className="mr-1.5 text-helper line-through">{fmt(a.normal_price_tl)}</span>
                      {fmt(a.addon_price_tl)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Question>

        <div className="mt-10 rounded-[20px] bg-surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label-xs">{t("product.total")}</span>
            <span className="font-mono text-lg uppercase tracking-[0.04em]">{fmt(total)}</span>
          </div>
          {savings > 0 && <p className="mt-1 text-right font-mono text-[13px] uppercase tracking-[0.04em] text-success">{t("product.save", { x: fmt(savings) })}</p>}
          <a href={orderHref()} target="_blank" rel="noreferrer" onClick={onOrder} className="btn mt-4 w-full bg-success text-success-foreground">
            <WhatsAppIcon /> {t("cta.order")}
          </a>
        </div>

        <div className="mt-10"><Faq /></div>
      </div>
    </main>
  );
}

function CustomProduct({ lang, product }: { lang: Lang; product: CatalogProduct }) {
  const t = useT();
  const { fmt, settings } = useFmt(lang);
  const name = lang === "tr" ? product.name_tr : product.name;
  const note = lang === "tr" ? product.price_note_tr : product.price_note;
  const colour = groupOf(product, "colour")!;
  const [colourIdx, setColourIdx] = useState(0);
  const colourName = lang === "tr" ? colour.options[colourIdx]!.option_tr : colour.options[colourIdx]!.option;

  const quoteHref = waLink(settings.whatsapp_number, t("msg.quote", { name, colour: colourName }));
  const onQuote = () => {
    track("custom_quote_click", { product: product.folder });
    sendToCrm({ order_id: newOrderId(), source: "Custom quote", language: lang.toUpperCase(), product: product.name, colour: colourName, status: "1 – Order created on website" });
  };

  return (
    <main className="mx-auto max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6">
      <Gallery product={product} name={name} />

      <div className="px-4 md:px-0">
        <Link to="/$lang/custom" params={{ lang }} className="tap inline-flex items-center label-xs text-subtle">{t("product.back")}</Link>
        <h1 className="mt-2 h1-xl">{name}</h1>
        <p className="mt-4 font-mono text-[15px] uppercase tracking-[0.04em]">
          {t("card.approx", { price: fmt(product.price) })}{note ? ` · ${note}` : ""}
        </p>
        <p className="helper mt-1">{t("product.material")}</p>

        <Question id="q-colour" title={t("product.colour")}>
          <div className="grid grid-cols-2 gap-2">
            {colour.options.map((o, i) => (
              <button key={o.option} type="button" onClick={() => setColourIdx(i)} aria-pressed={colourIdx === i} className={`pill ${colourIdx === i ? "!border-primary bg-primary text-primary-foreground" : ""}`}>
                {lang === "tr" ? o.option_tr : o.option}
              </button>
            ))}
          </div>
          <p className="helper mt-3">{t("product.colourNote")}</p>
        </Question>

        <p className="helper mt-6">{t("product.estimateNote")}</p>

        <a href={quoteHref} target="_blank" rel="noreferrer" onClick={onQuote} className="btn mt-6 w-full bg-success text-success-foreground">
          <WhatsAppIcon /> {t("cta.quote")}
        </a>

        <div className="mt-10"><Faq /></div>
      </div>
    </main>
  );
}
