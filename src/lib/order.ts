import { translate, type Lang } from "@/i18n";

export type ScanOption = "istanbul" | "other" | "stl";
export type DeliveryOption = "pickup" | "ship";

export const newOrderId = () => `GZ-${Math.floor(1000 + Math.random() * 9000)}`;

export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export interface OrderMsg {
  id: string; product: string; metal: string; color: string; teeth: number[];
  scan: ScanOption; delivery: DeliveryOption; price: string;
}

export function orderMessage(lang: Lang, o: OrderMsg) {
  const t = (k: string) => translate(lang, k);
  return [
    `${t("msg.order")} #${o.id}`,
    `${t("msg.product")}: ${o.product}`,
    `${t("msg.metal")}: ${o.metal}`,
    `${t("msg.color")}: ${o.color}`,
    `${t("msg.teeth")}: ${o.teeth.join(", ")}`,
    `${t("msg.scan")}: ${t(`msg.scan.${o.scan}`)}`,
    `${t("msg.delivery")}: ${t(`msg.delivery.${o.delivery}`)}`,
    `${t("msg.payment")}: ${t("msg.paymentValue")}`,
    `${t("msg.price")}: ${o.price}`,
  ].join("\n");
}

export function quoteMessage(lang: Lang, id: string, material: string, idea: string) {
  const t = (k: string) => translate(lang, k);
  return [`${t("msg.quote")} #${id}`, `${t("msg.material")}: ${material || "-"}`, `${t("msg.idea")}: ${idea.trim() || "-"}`, t("msg.photo")].join("\n");
}

/** POST to the CRM webhook (Google Apps Script / Make). Set VITE_CRM_WEBHOOK_URL. Fire-and-forget. */
export function sendToCrm(row: Record<string, unknown>) {
  const url = import.meta.env["VITE_CRM_WEBHOOK_URL"] as string | undefined;
  if (!url) return;
  const body = JSON.stringify({ created_at: new Date().toISOString(), ...row });
  fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body }).catch((e) =>
    console.error("CRM webhook failed", e),
  );
}

declare global {
  interface Window { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void }
}
export function track(event: "create_order_click" | "whatsapp_send_click" | "custom_quote_click", params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
}
