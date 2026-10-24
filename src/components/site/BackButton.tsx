import { useNavigate } from "@tanstack/react-router";
import { useLang, useT } from "@/i18n";

/** Always returns to the homepage (intro). */
export function BackButton() {
  const navigate = useNavigate();
  const lang = useLang();
  const t = useT();
  const back = () => {
    navigate({ to: "/$lang", params: { lang } });
  };
  return (
    <button type="button" onClick={back} className="tap label-xs flex items-center gap-1 hover:text-primary">
      <span aria-hidden>←</span> {t("nav.back")}
    </button>
  );
}
