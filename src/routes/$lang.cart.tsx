import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/site/CartPage";
import { seo } from "@/lib/seo";
import type { Lang } from "@/i18n";
export const Route = createFileRoute("/$lang/cart")({
  head: ({ params }) => seo(params.lang as Lang, "cart", "/cart"),
  component: CartPage,
});
