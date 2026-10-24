import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import type { Lang } from "@/i18n";
import { ClassicsList } from "@/components/site/ClassicsList";

export const Route = createFileRoute("/$lang/classics")({
  head: ({ params }) => seo(params.lang as Lang, "classics", "/classics", "/klasikler"),
  component: ClassicsList,
});
