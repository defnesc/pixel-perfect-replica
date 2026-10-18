import { useT } from "@/i18n";

export function PrivacyPage() {
  const t = useT();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-5xl">{t("privacy.title")}</h1>
      <p className="text-sm leading-relaxed">{t("privacy.body")}</p>
    </main>
  );
}
