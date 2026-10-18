import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LANG_STORAGE_KEY, useLang, useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { waLink } from "@/lib/order";

export function Header() {
  const lang = useLang();
  const t = useT();
  const loc = useLocation();
  const navigate = useNavigate();
  const switchTo = (l: Lang) => {
    if (l === lang) return;
    localStorage.setItem(LANG_STORAGE_KEY, l);
    let rest = loc.pathname.replace(/^\/(en|tr)/, "");
    if (l === "tr") rest = rest.replace(/^\/privacy/, "/gizlilik");
    else rest = rest.replace(/^\/gizlilik/, "/privacy");
    navigate({ to: `/${l}${rest}` as "/" });
  };
  const navCls = "tap flex items-center label-xs text-[11px] sm:text-xs";
  const active = { className: "text-primary" };
  return (
    <header className="sticky top-2 z-40 px-2">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 rounded-full border border-border bg-background/60 pl-5 pr-2 backdrop-blur-md">
        <Link to="/$lang" params={{ lang }} className="font-display text-xl">333</Link>
        <nav className="flex items-center gap-3 sm:gap-8">
          <Link to="/$lang" params={{ lang }} activeOptions={{ exact: true }} className={navCls} activeProps={active}>{t("nav.catalog")}</Link>
          <Link to="/$lang/custom" params={{ lang }} className={navCls} activeProps={active}>{t("nav.custom")}</Link>
          <Link to="/$lang/faq" params={{ lang }} className={navCls} activeProps={active}>{t("nav.faq")}</Link>
        </nav>
        <div className="flex items-center label-xs">
          {(["en", "tr"] as Lang[]).map((l, i) => (
            <span key={l} className="flex items-center">
              
              <button type="button" onClick={() => switchTo(l)} className={`h-8 min-w-8 rounded-full px-2 text-[11px] font-bold ${l === lang ? "bg-primary text-primary-foreground" : ""}`} aria-current={l === lang}>
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const lang = useLang();
  const t = useT();
  const { data } = useSuspenseQuery(sheetQuery);
  return (
    <footer className="mt-24">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-10 pt-14 sm:grid-cols-3">
        <div>
          <div className="font-display text-5xl">333<br />GRILLZ</div>
          <p className="helper mt-2">{t("footer.location")}</p>
        </div>
        <div className="flex flex-col text-[15px]">
          <a className="tap flex items-center" href="https://instagram.com/333grillz" target="_blank" rel="noreferrer">Instagram</a>
          <a className="tap flex items-center" href={waLink(data.settings.whatsapp_number, "")} target="_blank" rel="noreferrer"></a>
          <Link className="tap flex items-center" to={lang === "tr" ? "/$lang/gizlilik" : "/$lang/privacy"} params={{ lang }}>{t("footer.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
