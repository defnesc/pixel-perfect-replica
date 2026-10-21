import { createFileRoute } from "@tanstack/react-router";
import type { Lang } from "@/i18n";
import { seo } from "@/lib/seo";
import { JewelryPage } from "@/components/site/Jewelry";

export const Route = createFileRoute("/$lang/taki")({
  head: ({ params }) => seo(params.lang as Lang, "jewelry", "/jewelry", "/taki"),
  component: JewelryPage,
});
