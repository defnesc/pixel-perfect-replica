import { describe, expect, it } from "vitest";
import { GIFT_AMOUNTS, GIFT_UNPRICED, giftPurchaseDate, giftTotals } from "./gift-card";
import { BUILTIN, parseSettings } from "./sheet";

describe("gift card pricing rules", () => {
  const settings = BUILTIN.settings;
  it("keeps the five fixed TL amounts", () => {
    expect(GIFT_AMOUNTS).toEqual([5000, 8000, 10000, 12000, 15000]);
  });
  it("puts design-dependent before the unpriced tooth and Star choices", () => {
    expect(GIFT_UNPRICED).toEqual(["design", "one_tooth", "star"]);
  });
  it("has free digital delivery", () => {
    expect(giftTotals(5000, 1, "digital", settings)).toEqual({ subtotal: 5000, shipping: 0, total: 5000 });
  });
  it("adds printed shipping once, not once per card", () => {
    expect(giftTotals(2000, 3, "printed", settings)).toEqual({ subtotal: 6000, shipping: 150, total: 6150 });
  });
  it("waives shipping at exactly 10,000 TL combined face value", () => {
    expect(giftTotals(5000, 2, "printed", settings)).toEqual({ subtotal: 10000, shipping: 0, total: 10000 });
    expect(giftTotals(9999, 1, "printed", settings).shipping).toBe(150);
  });
  it("always charges printed shipping on unpriced cards even for multiple cards", () => {
    expect(giftTotals(null, 20, "printed", settings)).toEqual({ subtotal: null, shipping: 150, total: null });
  });
  it("keeps unpriced digital cards without any numeric total", () => {
    expect(giftTotals(null, 1, "digital", settings)).toEqual({ subtotal: null, shipping: 0, total: null });
  });
  it("reads shipping settings with backups of 150 and 10,000", () => {
    const parsed = parseSettings({ gift_card_shipping_tl: "oops", gift_card_free_shipping_from: "" });
    expect(parsed.gift_card_shipping_tl).toBe(150);
    expect(parsed.gift_card_free_shipping_from).toBe(10000);
    expect(giftTotals(5000, 1, "printed", parseSettings({gift_card_shipping_tl:"200",gift_card_free_shipping_from:"12000"})).total).toBe(5200);
  });
  it("does not apply the dollar factor to card values or shipping", () => {
    expect(giftTotals(5000, 1, "printed", { ...settings, auto_price_adjust: true, price_step_percent: 30 })).toEqual({ subtotal: 5000, shipping: 150, total: 5150 });
  });
  it("dates the purchase in Istanbul and uses the requested day.month.year format", () => {
    expect(giftPurchaseDate(new Date("2026-10-27T19:39:00Z"))).toBe("27.10.2026");
    expect(giftPurchaseDate(new Date("2026-10-27T22:00:00Z"))).toBe("28.10.2026");
  });
});