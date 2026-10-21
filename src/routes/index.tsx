import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { readSavedLang } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "333 Grillz — Custom Grillz Istanbul" },
      { name: "description", content: "Custom gold and silver grillz in Bomonti, Istanbul. / İstanbul'da size özel grillz." },
      { property: "og:title", content: "333 Grillz — Custom Grillz Istanbul" },
      { property: "og:description", content: "Custom gold and silver grillz in Bomonti, Istanbul." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "tr", href: "/tr" },
    ],
  }),
  component: LangRedirect,
});

function LangRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const saved = readSavedLang();
    const lang = saved ?? (navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en");
    navigate({ to: "/$lang", params: { lang }, replace: true });
  }, [navigate]);
  return <div className="flex min-h-screen items-center justify-center font-display text-5xl">333</div>;
}
