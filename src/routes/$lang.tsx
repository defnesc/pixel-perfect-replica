import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { isLang, saveLang } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { Footer, Header } from "@/components/site/Shell";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";

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
    if (isLang(lang)) saveLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <CartProvider><div className="min-h-screen">
      <Header />
      <Outlet />
      <Footer />
      <Toaster theme="dark" position="top-center" />
    </div></CartProvider>
  );
}
