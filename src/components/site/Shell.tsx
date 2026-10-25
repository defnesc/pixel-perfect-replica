import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { saveLang, useLang, useT, type Lang } from "@/i18n";
import { CURRENCIES, CURRENCY_SYMBOL, setCurrency, useCurrency } from "@/lib/currency";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

const TR_ALIASES: [string, string][] = [["/privacy", "/gizlilik"], ["/gift-card", "/hediye-karti"], ["/jewelry", "/taki"], ["/catalog", "/katalog"], ["/classics", "/klasikler"]];

function NavLinks({ className }: { className: string }) {
  const lang = useLang();
  const t = useT();
  const navCls = "tap flex shrink-0 items-center label-xs text-[11px] sm:text-xs";
  const active = { className: "text-primary" };
  return (
    <nav className={className}>
      <Link to={lang === "tr" ? "/$lang/katalog" : "/$lang/catalog"} params={{ lang }} className={navCls} activeProps={active}>{t("nav.catalog")}</Link>
      <Link to={lang === "tr" ? "/$lang/taki" : "/$lang/jewelry"} params={{ lang }} className={navCls} activeProps={active}>{t("nav.jewelry")}</Link>
      <Link to={lang === "tr" ? "/$lang/hediye-karti" : "/$lang/gift-card"} params={{ lang }} className={navCls} activeProps={active}>{t("nav.gift")}</Link>
      <Link to="/$lang/faq" params={{ lang }} className={navCls} activeProps={active}>{t("nav.faq")}</Link>
    </nav>
  );
}

export function Header() {
  const lang = useLang();
  const t = useT();
  const loc = useLocation();
  const navigate = useNavigate();
  const cur = useCurrency();
  const { items } = useCart();
  const count = items.reduce((sum, line) => sum + line.quantity * line.teeth, 0);
  const switchTo = (l: Lang) => {
    if (l === lang) return;
    saveLang(l);
    let rest = loc.pathname.replace(/^\/(en|tr)/, "");
    for (const [en, tr] of TR_ALIASES) {
      if (l === "tr") rest = rest.replace(new RegExp(`^${en}`), tr);
      else rest = rest.replace(new RegExp(`^${tr}`), en);
    }
    navigate({ to: `/${l}${rest}` as "/" });
  };
  const sw = (on: boolean) => `h-8 min-w-8 rounded-full px-2 text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : ""}`;
  return (
    <header className="sticky top-2 z-40 px-2">
      <div className="mx-auto max-w-[1200px] rounded-[28px] border border-border bg-background/60 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 pl-5 pr-2">
          <Link to="/$lang" params={{ lang }} className="font-display text-xl">333</Link>
          <NavLinks className="hidden items-center gap-6 lg:flex" />
          <div className="flex items-center gap-1 label-xs">
            <Button asChild variant="ghost" size="icon" className="relative shrink-0 rounded-full">
              <Link to="/$lang/cart" params={{ lang }} aria-label={t("cart.open", { count })}><ShoppingBag />{count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{count}</span>}</Link>
            </Button>
            <div className="flex items-center" role="group" aria-label={t("currency.label")}>
              {CURRENCIES.map((c) => (
                <button key={c} type="button" onClick={() => setCurrency(c)} className={sw(c === cur)} aria-pressed={c === cur} aria-label={c}>
                  {CURRENCY_SYMBOL[c]}
                </button>
              ))}
            </div>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            {(["en", "tr"] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => switchTo(l)} className={sw(l === lang)} aria-current={l === lang}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <NavLinks className="flex items-center justify-center gap-5 overflow-x-auto px-5 pb-1 -mt-2 [scrollbar-width:none] lg:hidden" />
      </div>
    </header>
  );
}

export function Footer() {
  const lang = useLang();
  const t = useT();
  return (
    <footer className="mt-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-4 pb-12 pt-14 text-center text-[15px]">
        <div className="font-display text-[clamp(2rem,8.5vw,3.5rem)] leading-none whitespace-nowrap tracking-tight">333GRILLZ</div>
        <div className="flex flex-wrap items-center justify-center gap-x-6">
          <a className="tap" href="https://instagram.com/333grillz" target="_blank" rel="noreferrer">Instagram</a>
          <span className="tap">{t("footer.location")}</span>
        </div>
        <Link className="tap text-[12px] leading-[1.5] text-helper" to={lang === "tr" ? "/$lang/gizlilik" : "/$lang/privacy"} params={{ lang }}>{t("footer.privacy")}</Link>
      </div>
    </footer>
  );
}
