import { createFileRoute } from "@tanstack/react-router";
import type { Lang } from "@/i18n";
import { seo } from "@/lib/seo";
import { PrivacyPage } from "@/components/site/Privacy";

export const Route = createFileRoute("/$lang/privacy")({
  head: ({ params }) => seo(params.lang as Lang, "privacy", "/privacy", "/gizlilik"),
  component: PrivacyPage,
});
