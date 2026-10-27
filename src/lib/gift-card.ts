import type { Settings } from "./sheet";

export const GIFT_AMOUNTS = [5000, 8000, 10000, 12000, 15000];
export const GIFT_UNPRICED = ["design", "one_tooth", "star"] as const;
export type GiftDelivery = "digital" | "printed";
export function giftTotals(unit: number | null, quantity: number, delivery: GiftDelivery, settings: Pick<Settings, "gift_card_shipping_tl" | "gift_card_free_shipping_from">) {
  const subtotal = unit === null ? null : unit * quantity;
  const shipping = delivery === "printed" && (subtotal === null || subtotal < settings.gift_card_free_shipping_from) ? settings.gift_card_shipping_tl : 0;
  return { subtotal, shipping, total: subtotal === null ? null : subtotal + shipping };
}
export function giftPurchaseDate(date = new Date()) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}