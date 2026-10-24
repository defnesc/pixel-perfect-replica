import { useNavigate, useRouter } from "@tanstack/react-router";
import { useLang, useT } from "@/i18n";

/** Goes to the previous page; falls back to the homepage when opened directly. */
export function BackButton() {
  const router = useRouter();
  const navigate = useNavigate();
  const lang = useLang();
  const t = useT();
  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/$lang", params: { lang } });
  };
  return (
    <button type="button" onClick={back} className="tap label-xs flex items-center gap-1 hover:text-primary">
      <span aria-hidden>←</span> {t("nav.back")}
    </button>
  );
}
