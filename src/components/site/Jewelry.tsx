import { useT } from "@/i18n";

export function JewelryPage() {
  const t = useT();
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="label-xs text-helper">{t("jewelry.title")}</p>
      <h1 className="h1-xl mt-4 text-primary">{t("jewelry.soon")}</h1>
    </main>
  );
}
