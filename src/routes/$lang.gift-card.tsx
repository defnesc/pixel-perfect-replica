import { createFileRoute } from "@tanstack/react-router";
import type { Lang } from "@/i18n";
import { seo } from "@/lib/seo";
import { GiftCardPage } from "@/components/site/GiftCard";

export const Route = createFileRoute("/$lang/gift-card")({
  head: ({ params }) => seo(params.lang as Lang, "gift", "/gift-card", "/hediye-karti"),
  component: GiftCardPage,
});
