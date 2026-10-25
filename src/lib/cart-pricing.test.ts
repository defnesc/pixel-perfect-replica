import { describe, it, expect } from "vitest";
import { PRODUCTS, OPTION_GROUPS, ADDONS, discountedPrice } from "./catalog";
import {
  addonLine,
  cartLineSchema,
  configuredLine,
  decodeOrder,
  encodeOrder,
  firstUnanswered,
  priceCart,
  type CartLine,
  type OrderRecord,
} from "./cart-pricing";
function line(folder: string, teeth = 1, options: Record<string, string> = {}, quantity = 1) {
  const p = PRODUCTS.find((p) => p.folder === folder);
  if (!p) throw new Error("Missing fixture");
  return { ...configuredLine(p, OPTION_GROUPS, "White", options, teeth), quantity };
}
const calc = (items: CartLine[], factor = 1) => priceCart(items, PRODUCTS, OPTION_GROUPS, factor);
describe("cart rules", () => {
  it("30 percent on 4990 is 3490", () => expect(discountedPrice(4990, 30)).toBe(3490));
  it("20 percent on 7490 is 5990", () => expect(discountedPrice(7490, 20)).toBe(5990));
  it("four Frame teeth cost 15460", () => expect(calc([line("frame", 4)]).total).toBe(15460));
  it("bar applies once for four Frame teeth", () =>
    expect(calc([line("frame", 4, { bar: "Bar" })]).total).toBe(16960));
  it("stones apply per tooth", () =>
    expect(calc([line("gap-filler", 4, { stones: "With stones" })]).total).toBe(20260));
  it("highest single piece globally stays full price", () => {
    const p = calc([line("frame", 4, { bar: "Bar" }), line("star")]);
    expect(p.total).toBe(7490 + 4590 + 3 * 3490);
  });
  it("other products use their own 20 percent", () =>
    expect(calc([line("dragon"), line("star")]).total).toBe(8490 + 5990));
  it("quantity two counts two pieces", () =>
    expect(calc([line("star", 1, {}, 2)]).total).toBe(7490 + 5990));
  it("customs never discount or change Classics full-piece selection", () => {
    const p = calc([line("frame"), line("oni-mask", 1, {}, 2)]);
    expect(p.total).toBe(4990);
    expect(p.estimated).toBe(31980);
  });
  it("quantity supports 1 through 10 only", () => {
    expect(cartLineSchema.safeParse(line("frame", 1, {}, 10)).success).toBe(true);
    expect(cartLineSchema.safeParse(line("frame", 1, {}, 11)).success).toBe(false);
    expect(cartLineSchema.safeParse(line("frame", 1, {}, 0)).success).toBe(false);
  });
  it("teeth supports 1 through 8 only", () => {
    expect(cartLineSchema.safeParse(line("frame", 8)).success).toBe(true);
    expect(cartLineSchema.safeParse(line("frame", 9)).success).toBe(false);
    expect(cartLineSchema.safeParse(line("frame", 0)).success).toBe(false);
  });
  it("addon linked option charges the same as cart line", () => {
    const a = ADDONS.find((a) => a.addon_id === "addon-iced-gap-filler");
    if (!a) throw new Error("missing");
    const l = addonLine(a, PRODUCTS, OPTION_GROUPS, "Yellow");
    if (!l) throw new Error("missing");
    expect(l.options["stones"]).toBe("With stones");
    expect(calc([line("dragon"), l]).lines[1]?.total).toBe(4590);
  });
  it("factor applied before own product discount", () =>
    expect(calc([line("frame", 4, { bar: "Bar" })], 1.03).total).toBe(6690 + 3 * 3690));
  it.each(["scan", "delivery", "payment", "adult", "privacy"] as const)(
    "requires %s before creating an order",
    (key) => {
      const a = {
        scan: "stl" as const,
        delivery: "pickup" as const,
        payment: true as const,
        adult: true as const,
        privacy: true as const,
      };
      const { [key]: removed, ...rest } = a;
      expect(firstUnanswered(rest)).toBe(key);
    },
  );
  it("preserves complete order, answers, seen total and factor in link", () => {
    const o: OrderRecord = {
      version: 1,
      id: "GZ-4821",
      date: "2026-10-25T10:34:00.000Z",
      lang: "tr",
      items: [line("frame", 4)],
      answers: { scan: "stl", delivery: "shipping", payment: true, adult: true, privacy: true },
      factor: 1.03,
      total: 16260,
      estimated: 0,
    };
    expect(decodeOrder(encodeOrder(o))).toEqual(o);
  });
  it("rejects malformed links and invalid factors", () => {
    expect(decodeOrder("junk")).toBeNull();
    expect(decodeOrder("")).toBeNull();
  });
  it("rejects a bar group from a different product", () =>
    expect(calc([{ ...line("star"), options: { bar: "Bar" } }]).invalid).toBe(true));
  it("checks current prices with the preserved factor and detects changes", () => {
    const items = [line("frame", 4)];
    const seen = calc(items, 1.03).total;
    expect(seen).toBe(16260);
    const changed = priceCart(
      items,
      PRODUCTS.map((p) => (p.folder === "frame" ? { ...p, price: 5990 } : p)),
      OPTION_GROUPS,
      1.03,
    );
    expect(changed.total).toBe(19360);
    expect(changed.total).not.toBe(seen);
  });
  it("flags missing product and obsolete option", () => {
    expect(calc([{ ...line("frame"), product: "absent" }]).invalid).toBe(true);
    expect(calc([line("frame", 1, { bar: "old" })]).invalid).toBe(true);
  });
});
