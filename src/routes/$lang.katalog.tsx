import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import type { Lang } from "@/i18n";
import { CatalogLanding } from "@/components/site/CatalogLanding";

export const Route = createFileRoute("/$lang/katalog")({
  head: ({ params }) => seo(params.lang as Lang, "catalog", "/catalog", "/katalog"),
  component: CatalogLanding,
});
