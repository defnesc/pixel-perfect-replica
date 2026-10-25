import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { translate, useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { findProduct, photoUrl, productPhotos, type CatalogProduct } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { addonLine, configuredLine, priceCart } from "@/lib/cart-pricing";
import { Stepper } from "@/components/site/Stepper";
import { usePrices } from "@/lib/use-prices";
import { waLink } from "@/lib/order";
import { Option, Question } from "@/components/site/Option";
import { Faq } from "@/components/site/Faq";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/$lang/product/$id")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(sheetQuery);
    const p = findProduct(params.id, data.products);
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
  const { data } = useSuspenseQuery(sheetQuery);
  const product = findProduct(id, data.products);
  if (!product) throw notFound();
  return product.section === "custom" ? <CustomProduct lang={lang} product={product} /> : <ClassicsProduct lang={lang} product={product} />;
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

function ClassicsProduct({ lang, product }: { lang: Lang; product: CatalogProduct }) { return <ProductOrder lang={lang} product={product} />; }
function CustomProduct({ lang, product }: { lang: Lang; product: CatalogProduct }) { return <ProductOrder lang={lang} product={product} />; }
function ProductOrder({lang,product}:{lang:Lang;product:CatalogProduct}) {
 const t=useT(); const navigate=useNavigate(); const cart=useCart(); const {fmt,factor,products,optionGroups,addons,adjusted,cur,settings}=usePrices();
 const [colour,setColour]=useState<'White'|'Yellow'>('White'); const [choices,setChoices]=useState<Record<string,string>>({});const [teeth,setTeeth]=useState(1);
 const groups=optionGroups.filter(g=>product.option_groups.includes(g.group_id));
 const item=configuredLine(product,optionGroups,colour,choices,teeth); const priced=priceCart([item],products,optionGroups,factor);const total=priced.total+priced.estimated;
 const name=lang==='tr'?product.name_tr:product.name;const badge=lang==='tr'?product.badge_tr:product.badge;
 const add=(open=false)=>{cart.add(item);if(open)navigate({to:'/$lang/cart',params:{lang}});else toast.success(t('cart.added'),{action:{label:t('cart.view'),onClick:()=>navigate({to:'/$lang/cart',params:{lang}})}});};
 return <main className="mx-auto max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-10 md:px-4 md:pt-6"><div className="px-4 pt-2 md:col-span-2 md:px-0 md:pt-0"><Link to={lang==='tr'?'/$lang/katalog':'/$lang/catalog'} params={{lang}} className="tap inline-flex items-center label-xs text-subtle">{t('product.back')}</Link></div><Gallery product={product} name={name}/><div className="px-4 md:px-0"><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="h1-xl">{name}</h1>{badge && <span className="rounded-full bg-primary px-3 py-1 font-mono text-xs text-primary-foreground">{badge}</span>}</div><p className="mt-4 font-mono text-[15px]">{product.compare_at_price && <span className="mr-2 text-helper line-through">{fmt(adjusted(product.compare_at_price))}</span>}{product.section==='custom'?t('card.approx',{price:fmt(total)}):fmt(total)}{product.section==='custom' && <span> · {lang==='tr'?product.price_note_tr:product.price_note}</span>}</p>{product.per_tooth && <p className="helper mt-2">{t('product.perTooth',{x:fmt(Math.round(total/teeth))})}</p>}{product.folder==='classic-cap-and-frame-duo' && product.compare_at_price && <p className="helper mt-1">{t('product.duoSave',{x:fmt(adjusted(product.compare_at_price)-adjusted(product.price))})}</p>}<p className="helper mt-1">{t('product.material')}</p>
 <Question id="q-colour" title={t('product.colour')}><div className="grid grid-cols-2 gap-2">{(['White','Yellow'] as const).map(c=><Button key={c} type="button" variant="outline" className={`h-12 rounded-full ${colour===c?'border-primary bg-primary text-primary-foreground':''}`} aria-pressed={colour===c} onClick={()=>setColour(c)}>{t(`color.${c}`)}</Button>)}</div><p className="helper mt-3">{t('product.colourNote')}</p></Question>
 {product.per_tooth && <Question id="q-teeth" title={t(product.placement==='gap'?'product.howManyGaps':'product.howManyTeeth')}><Stepper value={teeth} onChange={setTeeth} max={8} label={t(product.placement==='gap'?'product.howManyGaps':'product.howManyTeeth')}/><a className="helper mt-3 block underline" target="_blank" rel="noreferrer" href={waLink(settings.whatsapp_number,t('msg.moreTeeth',{name}))}>{t('product.moreTeeth')}</a></Question>}
 {groups.filter(g=>g.group_id!=='colour' && product.section==='classics').map(g=>{const chosen=item.options[g.group_id];const note=g.options.find(o=>o.option===chosen);return <Question key={g.group_id} id={`q-${g.group_id}`} title={lang==='tr'?g.label_tr:g.label}><div role="radiogroup" aria-label={lang==='tr'?g.label_tr:g.label} className="space-y-2">{g.options.map(o=>{const next=priceCart([{...item,options:{...item.options,[g.group_id]:o.option}}],products,optionGroups,factor);const base=priceCart([{...item,options:{...item.options,[g.group_id]:g.options.find(v=>v.isDefault)?.option ?? ''}}],products,optionGroups,factor);const difference=next.total-base.total;return <Option key={o.option} selected={chosen===o.option} onSelect={()=>setChoices(v=>({...v,[g.group_id]:o.option}))} label={lang==='tr'?o.option_tr:o.option} note={difference>0?`+${fmt(difference)}`:undefined}/>;})}</div>{(lang==='tr'?note?.small_note_tr:note?.small_note) && <p className="helper mt-3">{lang==='tr'?note?.small_note_tr:note?.small_note}</p>}</Question>;})}
 {product.section==='classics' && <Question id="q-addons" title={t('addon.title')}><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{addons.filter(a=>!product.per_tooth || a.product!==product.folder).map(a=>{const line=addonLine(a,products,optionGroups,colour);if(!line)return null;const combined=priceCart([...cart.items,item,line],products,optionGroups,factor);const charge=combined.lines[combined.lines.length-1];const img=photoUrl(`${a.photo_folder}-01.jpg`);return <Button key={a.addon_id} variant="outline" className="h-auto flex-col items-stretch gap-0 overflow-hidden whitespace-normal rounded-[20px] p-0 text-left" onClick={()=>{cart.add(line);toast.success(t('cart.added'),{action:{label:t('cart.view'),onClick:()=>navigate({to:'/$lang/cart',params:{lang}})}});}}>{img?<img src={img} alt="" className="aspect-square w-full object-cover" loading="lazy"/>:<div className="flex aspect-square items-center justify-center bg-surface text-helper">333</div>}<span className="block p-3"><span className="block text-[13px]">{lang==='tr'?a.name_tr:a.name}</span><span className="mt-1 block font-mono text-xs">{charge && charge.savings>0 && <span className="mr-1 text-helper line-through">{fmt(charge.full)}</span>}{fmt(charge?.total ?? 0)}</span></span></Button>;})}</div></Question>}
 {product.section==='custom' && <p className="helper mt-6">{t('product.estimateNote')}</p>}<div className="mt-8 border-t border-border pt-5"><div className="flex justify-between font-mono"><span>{t(product.section==='custom'?'cart.estimated':'product.total')}</span><span>{fmt(total)}</span></div>{cur!=='TRY' && <p className="helper mt-2">{t('price.approx')}</p>}<Button variant="outline" className="mt-4 h-auto min-h-12 w-full whitespace-normal rounded-full py-3" onClick={()=>add()}><ShoppingBag/>{t('cart.add')}</Button><Button className="mt-3 h-auto min-h-12 w-full whitespace-normal rounded-full bg-success py-3 text-success-foreground hover:bg-success/90" onClick={()=>add(true)}><WhatsAppIcon/>{t('cta.order')}</Button></div><div className="mt-10"><Faq/></div></div></main>;
}
