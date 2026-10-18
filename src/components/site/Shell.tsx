import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LANG_STORAGE_KEY, useLang, useT, type Lang } from "@/i18n";

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
  return (
    <footer className="mt-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-4 pb-12 pt-14 text-center text-[15px]">
        <div className="font-display text-[clamp(2rem,8.5vw,3.5rem)] leading-none whitespace-nowrap tracking-tight">333GRILLZ</div>
        <div className="flex flex-wrap items-center justify-center gap-x-6">
          <a className="tap" href="https://instagram.com/333grillz" target="_blank" rel="noreferrer">Instagram</a>
          <span className="tap">{t("footer.location")}</span>
        </div>
        <Link className="tap" to={lang === "tr" ? "/$lang/gizlilik" : "/$lang/privacy"} params={{ lang }}>{t("footer.privacy")}</Link>
      </div>
    </footer>
  );
}
