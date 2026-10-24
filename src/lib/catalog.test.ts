import { describe, expect, it } from "vitest";
import { ADDONS, disc30, findProduct, formatTl, orderTotals, piecePrice } from "./catalog";

describe("catalog pricing", () => {
  it("30% off rounds down to nearest 100 then +90", () => {
    expect(disc30(4490)).toBe(3190);
    expect(disc30(5990)).toBe(4190);
    expect(disc30(6990)).toBe(4890);
  });
  it("piece price adds option surcharges", () => {
    const frame = findProduct("frame")!;
    expect(piecePrice(frame, [0, 0])).toBe(4490);
    expect(piecePrice(frame, [1500, 0])).toBe(5990);
    expect(piecePrice(frame, [2500, 0])).toBe(6990);
  });
  it("add-ons at or below the main piece price are charged at addon price", () => {
    const cap = ADDONS.find((a) => a.addon_id === "addon-classic-cap")!;
    const gap = ADDONS.find((a) => a.addon_id === "addon-gap-filler")!;
    // Frame 4.490 + Gap filler add-on 3.190 = 7.680
    expect(orderTotals(4490, [gap])).toMatchObject({ total: 7680, savings: 1300 });
    expect(orderTotals(4490, [cap, gap]).total).toBe(4490 + 3190 + 3190);
  });
  it("an add-on pricier than the main piece is full price and the main piece gets 30% off", () => {
    const icedBar = ADDONS.find((a) => a.addon_id === "addon-frame-with-iced-bar")!;
    // main 4.490 (disc 3.190) + add-on normal 6.990 full = 10.180
    expect(orderTotals(4490, [icedBar])).toMatchObject({ total: 10180, savings: 1300 });
  });
  it("formats Turkish-style prices with a dot", () => {
    expect(formatTl(4490)).toBe("4.490 TL");
    expect(formatTl(12990)).toBe("12.990 TL");
  });
});
