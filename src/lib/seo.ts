import { translate, type Lang } from "@/i18n";

/** Page meta + hreflang alternates. `path` is the part after /en or /tr (e.g. "/faq"). */
export function seo(lang: Lang, key: string, path = "", trPath = path, vars?: Record<string, string>) {
  const title = translate(lang, `seo.${key}.title`, vars);
  const description = translate(lang, `seo.${key}.desc`, vars);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: lang === "tr" ? "tr_TR" : "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "alternate", hrefLang: "en", href: `/en${path}` },
      { rel: "alternate", hrefLang: "tr", href: `/tr${trPath}` },
      { rel: "alternate", hrefLang: "x-default", href: `/en${path}` },
    ],
  };
}
