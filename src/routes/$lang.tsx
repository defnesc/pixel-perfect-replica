import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { isLang, LANG_STORAGE_KEY } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { Footer, Header } from "@/components/site/Shell";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(sheetQuery),
  head: ({ params }) => ({
    meta: [{ name: "keywords", content: params.lang === "tr" ? "Grillz İstanbul, altın grillz, özel grillz" : "Grillz Istanbul, gold grillz, custom grillz" }],
  }),
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
