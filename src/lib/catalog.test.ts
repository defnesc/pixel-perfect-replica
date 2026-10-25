import { describe, expect, it } from "vitest";
import { ADDONS, disc30, findProduct, formatTl, groupOf, orderTotals, piecePrice } from "./catalog";

describe("catalog pricing", () => {
  it("30% off rounds down to nearest 100 then +90", () => {
    expect(disc30(4990)).toBe(3490);
    expect(disc30(6490)).toBe(4590);
    expect(disc30(6990)).toBe(4890);
  });
  it("piece price adds option surcharges", () => {
    const frame = findProduct("frame")!;
    expect(piecePrice(frame, [0, 0])).toBe(4990);
    expect(piecePrice(frame, [1500, 0])).toBe(6490);
    expect(piecePrice(frame, [2000, 0])).toBe(6990);
  });
  it("dragon red stone option totals 10.490", () => {
    const dragon = findProduct("dragon")!;
    expect(dragon.price).toBe(8490);
    const stones = groupOf(dragon, "stones_dragon")!;
    expect(stones.options.map((o) => o.price_add_tl)).toEqual([0, 2000]);
    expect(piecePrice(dragon, [0, 2000])).toBe(10490);
  });
  it("duo deal is 7.990 against 9.980", () => {
    const duo = findProduct("classic-cap-and-frame-duo")!;
    expect(duo.price).toBe(7990);
    expect(duo.compare_at_price).toBe(9980);
  });
  it("add-ons at or below the main piece price are charged at addon price", () => {
    const cap = ADDONS.find((a) => a.addon_id === "addon-classic-cap")!;
    const gap = ADDONS.find((a) => a.addon_id === "addon-gap-filler")!;
    // Frame 4.990 + Gap filler add-on 3.490 = 8.480
    expect(orderTotals(4990, [gap])).toMatchObject({ total: 8480, savings: 1500 });
    expect(orderTotals(4990, [cap, gap]).total).toBe(4990 + 3490 + 3490);
  });
  it("an add-on pricier than the main piece is full price and the main piece gets 30% off", () => {
    const icedBar = ADDONS.find((a) => a.addon_id === "addon-frame-with-iced-bar")!;
    // main 4.990 (disc 3.490) + add-on normal 6.990 full = 10.480
    expect(orderTotals(4990, [icedBar])).toMatchObject({ total: 10480, savings: 1500 });
  });
  it("formats Turkish-style prices with a dot", () => {
    expect(formatTl(4990)).toBe("4.990 TL");
    expect(formatTl(12990)).toBe("12.990 TL");
  });
});
