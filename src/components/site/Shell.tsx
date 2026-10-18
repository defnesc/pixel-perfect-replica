import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LANG_STORAGE_KEY, useLang, useT, type Lang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { waLink } from "@/lib/order";
import { WhatsAppIcon } from "./WhatsAppIcon";

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
  const navCls = "tap flex items-center label-xs border-b-2 border-transparent";
  const active = { className: "!border-primary text-primary" };
  return (
    <header className="sticky top-0 z-40 border-b border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/$lang" params={{ lang }} className="font-display text-xl">333</Link>
        <nav className="flex items-center gap-3 sm:gap-8">
          <Link to="/$lang" params={{ lang }} activeOptions={{ exact: true }} className={navCls} activeProps={active}>{t("nav.catalog")}</Link>
          <Link to="/$lang/custom" params={{ lang }} className={navCls} activeProps={active}>{t("nav.custom")}</Link>
          <Link to="/$lang/faq" params={{ lang }} className={navCls} activeProps={active}>{t("nav.faq")}</Link>
        </nav>
        <div className="flex items-center label-xs">
          {(["en", "tr"] as Lang[]).map((l, i) => (
            <span key={l} className="flex items-center">
              {i > 0 && <span className="px-0.5">|</span>}
              <button type="button" onClick={() => switchTo(l)} className={`tap px-1 ${l === lang ? "text-primary" : ""}`} aria-current={l === lang}>
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
    <footer className="mt-20 border-t border-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="font-display text-4xl">333 GRILLZ</div>
          <p className="helper mt-2">{t("footer.location")}</p>
        </div>
        <div className="flex flex-col gap-1 label-xs">
          <a className="tap flex items-center" href="https://instagram.com/333grillz" target="_blank" rel="noreferrer">Instagram</a>
          <a className="tap flex items-center" href={waLink(data.settings.whatsapp_number, "")} target="_blank" rel="noreferrer">WhatsApp</a>
          <Link className="tap flex items-center" to={lang === "tr" ? "/$lang/gizlilik" : "/$lang/privacy"} params={{ lang }}>{t("footer.privacy")}</Link>
        </div>
        <p className="helper self-end">{t("footer.legal")}</p>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  const t = useT();
  const loc = useLocation();
  const { data } = useSuspenseQuery(sheetQuery);
  if (/\/product\//.test(loc.pathname)) return null;
  return (
    <a
      href={waLink(data.settings.whatsapp_number, "")}
      target="_blank"
      rel="noreferrer"
      aria-label={t("wa.float")}
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
