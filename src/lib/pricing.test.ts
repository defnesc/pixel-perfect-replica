import { describe, expect, it } from "vitest";
import { computePrice, lowestPrice, toTry, type PriceRow } from "./pricing";

const base: PriceRow = { product_id: "x", metal_type: "Silver", price: 1000, currency: "TRY", pricing_mode: "per_set" };

describe("pricing", () => {
  it("per_tooth multiplies by selected teeth", () => {
    expect(computePrice({ ...base, pricing_mode: "per_tooth" }, 4, 40)).toBe(4000);
  });
  it("per_set ignores teeth count", () => {
    expect(computePrice(base, 6, 40)).toBe(1000);
  });
  it("USD converts with usd_try rounded to nearest 10 TL", () => {
    expect(toTry(380, "USD", 41.237)).toBe(15670);
  });
  it("empty price returns null (ask on WhatsApp)", () => {
    expect(toTry(null, "USD", 40)).toBeNull();
  });
  it("lowest price picks the cheapest metal", () => {
    expect(lowestPrice([{ ...base, price: 5000 }, { ...base, price: 3000 }], 40)).toBe(3000);
  });
});
