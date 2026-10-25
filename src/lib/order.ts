export const newOrderId = () => `GZ-${Math.floor(1000 + Math.random() * 9000)}`;

export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

const CRM_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwZQj8t6DtY7NUOBzhxknGDrTqarnfExhsPOEvpKhB0VstaNp1ZjXJMQhq7hLVT17Fn/exec";
/** Public order-log endpoint; fire-and-forget, without customer personal data. */
export function sendToCrm(row: Record<string, unknown>) {
  const url = CRM_WEBHOOK_URL || import.meta.env["VITE_CRM_WEBHOOK_URL"] as string | undefined;
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
