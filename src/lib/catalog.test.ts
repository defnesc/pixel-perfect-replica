import { describe, expect, it } from "vitest";
import { discountedPrice, findProduct, formatTl, groupOf, piecePrice } from "./catalog";

describe("catalog pricing", () => {
  it("30% off rounds down to nearest 100 then +90", () => {
    expect(discountedPrice(4990,30)).toBe(3490);
    expect(discountedPrice(6490,30)).toBe(4590);
    expect(discountedPrice(6990,30)).toBe(4890);
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
  it("formats Turkish-style prices with a dot", () => {
    expect(formatTl(4990)).toBe("4.990 TL");
    expect(formatTl(12990)).toBe("12.990 TL");
  });
});
