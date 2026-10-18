import { createFileRoute } from "@tanstack/react-router";
import { useT, type Lang } from "@/i18n";
import { seo } from "@/lib/seo";
import { Faq } from "@/components/site/Faq";

export const Route = createFileRoute("/$lang/faq")({
  head: ({ params }) => seo(params.lang as Lang, "faq", "/faq"),
  component: FaqPage,
});

function FaqPage() {
  const t = useT();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-6xl">{t("faq.title")}</h1>
      <Faq />
    </main>
  );
}
